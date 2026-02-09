from ultralytics import YOLO
from utils.preprocess import load_image
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "yolov8n.pt")

model = YOLO(MODEL_PATH)

def classify_vehicle(image_file):
    try:
        img = load_image(image_file)
        results = model(img)
        for r in results:
            for box in r.boxes:
                try:
                    cls_idx = int(box.cls[0]) if hasattr(box.cls, '__len__') else int(box.cls)
                except Exception:
                    try:
                        cls_idx = int(box.cls)
                    except Exception:
                        cls_idx = None

                if cls_idx is None:
                    continue
                name = model.names.get(cls_idx, str(cls_idx)).lower()
                if name in ["car", "bus", "truck"]:
                    return "car"
                if name in ["motorcycle", "bicycle"]:
                    return "bike"
        return "bike"
    except Exception as e:
        print(f"Vehicle classification error: {e}")
        return "bike"
