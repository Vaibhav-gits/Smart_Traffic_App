from ultralytics import YOLO
from utils.preprocess import load_image
import os
import cv2
import numpy as np  

# Load model once at import to avoid reloading on each request
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolo_helmet.pt")
# If the dedicated helmet model is missing or empty, fall back to the general yolov8n model
if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1024:
    MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolov8n.pt")
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Failed to load helmet model at {MODEL_PATH}: {e}")
    # Final fallback: attempt to load the shipped yolov8n
    model = YOLO(os.path.join(BASE_DIR, "..", "models", "yolov8n.pt"))
is_general_model = MODEL_PATH.endswith('yolov8n.pt')


def detect_helmet(image_file):
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

                # If using dedicated helmet model, look for helmet classes
                if not is_general_model and cls_name and 'helmet' in cls_name:
                    boxes.append({
                        'x1': int(box.xyxy[0][0]),
                        'y1': int(box.xyxy[0][1]),
                        'x2': int(box.xyxy[0][2]),
                        'y2': int(box.xyxy[0][3]),
                        'confidence': float(box.conf[0]),
                        'class': cls_idx,
                        'label': cls_name,
                    })

        # Determine max confidence for helmet detections
        max_conf = 0.0
        for b in boxes:
            if b.get('confidence', 0) > max_conf:
                max_conf = b['confidence']

        # If using general model (yolov8n), implement fallback logic
        if is_general_model:
            # Check if motorcycle and person are detected
            has_motorcycle = 'motorcycle' in detected_classes or 'motorbike' in detected_classes or 'bike' in detected_classes
            has_person = 'person' in detected_classes

            if has_motorcycle and has_person:
                # For motorcycle with person, we cannot reliably detect helmet with general model
                # Return False (no helmet detected) with low confidence to indicate uncertainty
                print(f"Helmet detector (general model) saw classes: {detected_classes}, assuming no helmet detectable")
                return False, [], 0.1  # Low confidence to indicate fallback logic
            else:
                # No motorcycle-person combination, assume not applicable
                print(f"Helmet detector (general model) saw classes: {detected_classes}, no motorcycle-person detected")
                return True, [], 0.0  # Not applicable, but return True to avoid false violations

        # For dedicated helmet model
        CONF_THRESHOLD = 0.5  # Lower threshold for dedicated model
        helmet_present = len(boxes) > 0 and max_conf >= CONF_THRESHOLD

        # Debug: print detected classes if no helmet found or low confidence
        if not boxes or max_conf < CONF_THRESHOLD:
            print(f"Helmet detector saw classes: {detected_classes}, max_conf={max_conf}")

        # Final return: helmet presence (bool), boxes list, max confidence
        return helmet_present, boxes, max_conf
    except Exception as e:
        print(f"Error in helmet detection: {e}")
        return False, [], 0.0
