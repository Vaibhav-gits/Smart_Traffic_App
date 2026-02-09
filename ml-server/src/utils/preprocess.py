import cv2
import numpy as np
from PIL import Image

def load_image(image_file):
    """
    Load image from Flask request file
    """
    image = Image.open(image_file).convert("RGB")
    return np.array(image)

def preprocess_image(image_file, size=(224, 224)):
    """
    Preprocess image for EfficientNet
    """
    image = Image.open(image_file).convert("RGB")
    image = image.resize(size)
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image
