from src.detector.license_plate_detector import extract_vehicle_number, set_ocr_globals
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import cv2

# OCR setup
OCR_ENGINE = None
PYTESSERACT = None
EASYOCR_READER = None
try:
    import pytesseract as _pyt
    _pyt.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    PYTESSERACT = _pyt
    OCR_ENGINE = 'pytesseract'
except Exception as e:
    print(f'pytesseract failed: {e}')
    try:
        import easyocr
        EASYOCR_READER = easyocr.Reader(['en'], gpu=False)
        OCR_ENGINE = 'easyocr'
    except Exception as e:
        print(f'easyocr failed: {e}')

set_ocr_globals(OCR_ENGINE, PYTESSERACT, EASYOCR_READER)

def create_test_license_plate(text='MH20DY2366'):
    """Create a simulated license plate image for testing"""
    # Create a realistic license plate background
    img = Image.new('RGB', (400, 120), color=(64, 64, 64))  # Dark background
    draw = ImageDraw.Draw(img)

    # Add some noise and texture to simulate real license plate
    np_img = np.array(img)
    noise = np.random.normal(0, 25, np_img.shape).astype(np.uint8)
    np_img = cv2.add(np_img, noise)
    img = Image.fromarray(np_img)

    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype('arial.ttf', 48)
    except:
        font = ImageFont.load_default()

    # Draw the license plate text
    draw.text((20, 30), text, fill='white', font=font)

    # Add some blur to simulate real image
    img = img.filter(ImageFilter.GaussianBlur(0.5))

    return img

def test_ocr():
    """Test OCR functionality with multiple scenarios"""
    print("Testing OCR functionality...")
    print(f"OCR Engine: {OCR_ENGINE}")

    # Test 1: Clean license plate
    print("\n=== Test 1: Clean license plate ===")
    img1 = create_test_license_plate('MH20DY2366')
    result1 = extract_vehicle_number(img1)
    print(f"Input: MH20DY2366")
    print(f"Output: {result1}")
    print("PASS" if result1 == 'MH20DY2366' else "FAIL")

    # Test 2: Different license plate
    print("\n=== Test 2: Different license plate ===")
    img2 = create_test_license_plate('KA01AB1234')
    result2 = extract_vehicle_number(img2)
    print(f"Input: KA01AB1234")
    print(f"Output: {result2}")
    print("PASS" if result2 == 'KA01AB1234' else "FAIL")

    # Test 3: Shorter text
    print("\n=== Test 3: Shorter license plate ===")
    img3 = create_test_license_plate('MH202366')
    result3 = extract_vehicle_number(img3)
    print(f"Input: MH202366")
    print(f"Output: {result3}")
    print("PASS" if result3 == 'MH202366' else "FAIL")

    # Test 4: Noisy image
    print("\n=== Test 4: Very noisy image ===")
    img4 = create_test_license_plate('MH20DY2366')
    # Add more noise
    np_img4 = np.array(img4)
    heavy_noise = np.random.normal(0, 50, np_img4.shape).astype(np.uint8)
    np_img4 = cv2.add(np_img4, heavy_noise)
    img4 = Image.fromarray(np_img4)
    result4 = extract_vehicle_number(img4)
    print(f"Input: MH20DY2366 (noisy)")
    print(f"Output: {result4}")
    # For noisy images, check if it contains the expected pattern
    has_expected = 'MH20DY2366' in result4 or result4 == 'MH20DY2366'
    print("PASS" if has_expected else "FAIL (expected pattern not found)")

    print("\n=== OCR Testing Complete ===")

if __name__ == "__main__":
    test_ocr()
