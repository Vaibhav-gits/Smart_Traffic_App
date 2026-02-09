import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from detector.helmet_detector import detect_helmet
from detector.seatbelt_detector import detect_seatbelt
from detector.vehicle_classifier import classify_vehicle
from detector.license_plate_detector import extract_vehicle_number, set_ocr_globals
from PIL import Image
import io

# OCR: try to import pytesseract first, then easyocr as a fallback
OCR_ENGINE = None
PYTESSERACT = None
EASYOCR_READER = None
try:
    import pytesseract as _pyt
    # Set Tesseract path for Windows (adjust if installed elsewhere)
    _pyt.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    PYTESSERACT = _pyt
    OCR_ENGINE = 'pytesseract'
except Exception as e:
    print(f"pytesseract failed to load: {e}")
    try:
        import easyocr
        # Create reader lazily (may be slow) — do it once
        try:
            EASYOCR_READER = easyocr.Reader(['en'], gpu=False)
            OCR_ENGINE = 'easyocr'
        except Exception as e:
            print(f"easyocr failed to load: {e}")
            OCR_ENGINE = None
    except Exception as e:
        print(f"easyocr import failed: {e}")
        OCR_ENGINE = None

# Set OCR globals in the detector module
set_ocr_globals(OCR_ENGINE, PYTESSERACT, EASYOCR_READER)

app = Flask(__name__)
CORS(app)

# ======================
# HEALTH CHECK ROUTE
# ======================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "ML Server is running successfully",
        "status": "OK"
    })

# ======================
# IMAGE DETECTION ROUTE
# ======================
@app.route("/detect/image", methods=["POST"])
def detect_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    # Read bytes once to avoid consuming the stream and to allow multiple reads
    try:
        image.stream.seek(0)
    except Exception:
        pass
    data = image.read()
    size = len(data)
    filename = getattr(image, 'filename', 'uploaded')
    print(f"Received image upload: {filename}, size={size} bytes")

    # Provide BytesIO copies to each processing function
    buf_for_classify = io.BytesIO(data)
    buf_for_helmet = io.BytesIO(data)
    buf_for_seatbelt = io.BytesIO(data)
    buf_for_ocr = io.BytesIO(data)

    # Note: License plate detection removed as yolov8n model doesn't have license plate class
    # OCR will be performed on the full image

    # 🔍 Vehicle classification
    try:
        vehicle = classify_vehicle(buf_for_classify)
    except Exception as e:
        print(f"Vehicle classification failed: {e}")
        return jsonify({"error": f"Vehicle classification failed: {str(e)}"}), 500

    helmet = False
    helmet_boxes = []
    seatbelt = False
    seatbelt_boxes = []
    helmet_conf = 0.0
    seatbelt_conf = 0.0

    # Run appropriate detector
    if vehicle == "bike":
        try:
            helmet, helmet_boxes, helmet_conf = detect_helmet(buf_for_helmet)
        except Exception as e:
            print(f"Helmet detection failed: {e}")
            helmet, helmet_boxes, helmet_conf = False, [], 0.0
    elif vehicle == "car":
        try:
            seatbelt, seatbelt_boxes, seatbelt_conf = detect_seatbelt(buf_for_seatbelt)
        except Exception as e:
            print(f"Seatbelt detection failed: {e}")
            seatbelt, seatbelt_boxes, seatbelt_conf = False, [], 0.0
    # OCR for vehicle number using license plate detection
    try:
        img = Image.open(buf_for_ocr).convert("RGB")
        vehicle_number = extract_vehicle_number(img)
    except Exception as e:
        print(f"Vehicle number extraction failed: {e}")
        vehicle_number = "Unknown"

    # 🚨 Violation logic and fine
    violation = False
    fine = 0
    if vehicle == "bike":
        if helmet is False:
            violation = True
            fine = 500
    if vehicle == "car":
        if seatbelt is False:
            violation = True
            fine = 500

    return jsonify({
        "vehicle": vehicle,
        "helmet": bool(helmet),
        "helmet_confidence": float(helmet_conf),
        "helmet_boxes": helmet_boxes,
        "seatbelt": bool(seatbelt),
        "seatbelt_confidence": float(seatbelt_conf),
        "seatbelt_boxes": seatbelt_boxes,
        "violation": violation,
        "fine": fine,
        "vehicleNumber": vehicle_number,
    })

# ======================
# VIDEO DETECTION ROUTE
# ======================
@app.route("/detect/video", methods=["POST"])
def detect_video():
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]

    from PIL import Image
    import io

    # Assuming video is uploaded as a file, extract first frame (simplified)
    # This is a placeholder; real implementation needs video processing library like OpenCV
    try:
        # For demo, assume we can convert video to image (not accurate)
        # In practice, use cv2 to read video frames
        image = Image.open(io.BytesIO(video.read()))  # This won't work for videos, just placeholder

        # 🔍 Vehicle classification
        vehicle = classify_vehicle(image)

        helmet = None
        helmet_boxes = []
        seatbelt = None
        seatbelt_boxes = []

        if vehicle == "bike":
            helmet, helmet_boxes = detect_helmet(image)

        elif vehicle == "car":
            seatbelt, seatbelt_boxes = detect_seatbelt(image)

        # 🚨 Violation logic
        violation = False
        if vehicle == "bike" and helmet is False:
            violation = True
        if vehicle == "car" and seatbelt is False:
            violation = True

        return jsonify({
            "vehicle": vehicle,
            "helmet": helmet,
            "helmet_boxes": helmet_boxes,
            "seatbelt": seatbelt,
            "seatbelt_boxes": seatbelt_boxes,
            "violation": violation
        })
    except Exception as e:
        return jsonify({"error": f"Video processing failed: {str(e)}"}), 500

# ======================
# RUN SERVER
# ======================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
