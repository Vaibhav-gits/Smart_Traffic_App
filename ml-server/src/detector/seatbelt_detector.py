import os
from ultralytics import YOLO
from utils.preprocess import load_image

# Load model once at import to avoid reloading on each request
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolo_seatbelt.pt")
# If the dedicated seatbelt model is missing or empty, fall back to the general yolov8n model
if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1024:
    MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolov8n.pt")
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Failed to load seatbelt model at {MODEL_PATH}: {e}")
    model = YOLO(os.path.join(BASE_DIR, "..", "models", "yolov8n.pt"))

is_general_model = MODEL_PATH.endswith('yolov8n.pt')

def detect_seatbelt(image_file):
    try:
        img = load_image(image_file)
        results = model(img)
        boxes = []
        detected_classes = []

        # First, collect all detected classes for analysis
        for result in results:
            for box in result.boxes:
                try:
                    cls_idx = int(box.cls[0]) if hasattr(box.cls, '__len__') else int(box.cls)
                except Exception:
                    try:
                        cls_idx = int(box.cls)
                    except Exception:
                        cls_idx = None

                cls_name = None
                if cls_idx is not None and cls_idx in model.names:
                    cls_name = str(model.names[cls_idx]).lower()
                    detected_classes.append(cls_name)

                # If using dedicated seatbelt model, look for seatbelt/belt classes
                if not is_general_model and cls_name and ('seatbelt' in cls_name or 'belt' in cls_name):
                    boxes.append({
                        'x1': int(box.xyxy[0][0]),
                        'y1': int(box.xyxy[0][1]),
                        'x2': int(box.xyxy[0][2]),
                        'y2': int(box.xyxy[0][3]),
                        'confidence': float(box.conf[0]),
                        'class': cls_idx,
                        'label': cls_name,
                    })

        # Determine max confidence for seatbelt detections
        max_conf = 0.0
        for b in boxes:
            if b.get('confidence', 0) > max_conf:
                max_conf = b['confidence']

        # If using general model (yolov8n), implement fallback logic
        if is_general_model:
            # Check if car is detected
            has_car = 'car' in detected_classes or 'truck' in detected_classes or 'bus' in detected_classes

            if has_car:
                # For cars, we cannot reliably detect seatbelt with general model
                # Return False (no seatbelt detected) with low confidence to indicate uncertainty
                print(f"Seatbelt detector (general model) saw classes: {detected_classes}, assuming no seatbelt detectable")
                return False, [], 0.1  # Low confidence to indicate fallback logic
            else:
                # No car detected, assume not applicable
                print(f"Seatbelt detector (general model) saw classes: {detected_classes}, no car detected")
                return True, [], 0.0  # Not applicable, but return True to avoid false violations

        # For dedicated seatbelt model
        CONF_THRESHOLD = 0.5  # Lower threshold for dedicated model
        seatbelt_present = len(boxes) > 0 and max_conf >= CONF_THRESHOLD

        # Debug: print detected classes if no seatbelt found or low confidence
        if not boxes or max_conf < CONF_THRESHOLD:
            print(f"Seatbelt detector saw classes: {detected_classes}, max_conf={max_conf}")

        # Final return: seatbelt presence (bool), boxes list, max confidence
        return seatbelt_present, boxes, max_conf
    except Exception as e:
        print(f"Error in seatbelt detection: {e}")
        return False, [], 0.0
