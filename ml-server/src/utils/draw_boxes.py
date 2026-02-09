import cv2

def draw_boxes(image, detections, label="Detected"):
    """
    Draw bounding boxes on image
    """
    for det in detections:
        cv2.rectangle(
            image,
            (det["x1"], det["y1"]),
            (det["x2"], det["y2"]),
            (0, 255, 0),
            2
        )

        cv2.putText(
            image,
            label,
            (det["x1"], det["y1"] - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    return image
