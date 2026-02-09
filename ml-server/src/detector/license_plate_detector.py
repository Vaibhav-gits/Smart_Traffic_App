import cv2
import numpy as np
from PIL import Image
import io
import os

# Global OCR variables
OCR_ENGINE = None
PYTESSERACT = None
EASYOCR_READER = None

def set_ocr_globals(engine, pytesseract, easyocr_reader):
    """
    Set global OCR variables
    """
    global OCR_ENGINE, PYTESSERACT, EASYOCR_READER
    OCR_ENGINE = engine
    PYTESSERACT = pytesseract
    EASYOCR_READER = easyocr_reader


def detect_license_plate(image):
    """
    Detect license plate region using multiple detection strategies optimized for Indian license plates
    Returns cropped license plate image or None if not found
    """
    try:
        # Convert PIL to numpy array
        if isinstance(image, Image.Image):
            img = np.array(image.convert('RGB'))
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        else:
            img = image

        height, width = img.shape[:2]
        print(f"Processing image of size {width}x{height}")

        # Try YOLO model first to detect vehicles, then look for license plates within them
        vehicle_regions = []
        try:
            from ultralytics import YOLO
            import os

            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "yolov8n.pt")

            model = YOLO(MODEL_PATH)
            results = model(img, conf=0.25)  # Lower confidence threshold

            # Look for vehicle classes that might contain license plates
            vehicle_classes = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'vehicle']

            for result in results:
                for box in result.boxes:
                    try:
                        cls_idx = int(box.cls[0]) if hasattr(box.cls, '__len__') else int(box.cls)
                    except Exception:
                        cls_idx = None

                    cls_name = None
                    if cls_idx is not None and cls_idx in model.names:
                        cls_name = str(model.names[cls_idx]).lower()

                    # Check for vehicle classes
                    if cls_name and any(keyword in cls_name for keyword in vehicle_classes):
                        vehicle_regions.append({
                            'x1': int(box.xyxy[0][0]),
                            'y1': int(box.xyxy[0][1]),
                            'x2': int(box.xyxy[0][2]),
                            'y2': int(box.xyxy[0][3]),
                            'confidence': float(box.conf[0]),
                            'class': cls_name
                        })

            print(f"YOLO detected {len(vehicle_regions)} vehicle regions")

        except Exception as e:
            print(f"YOLO vehicle detection failed: {e}")

        # If vehicles found, focus license plate detection in those regions
        search_regions = []
        if vehicle_regions:
            for vehicle in vehicle_regions:
                # Define license plate search area (typically bottom portion of vehicle)
                v_x1, v_y1, v_x2, v_y2 = vehicle['x1'], vehicle['y1'], vehicle['x2'], vehicle['y2']
                v_width = v_x2 - v_x1
                v_height = v_y2 - v_y1

                # License plates are usually in the lower portion of vehicles
                plate_y1 = max(v_y1, int(v_y2 - v_height * 0.4))  # Bottom 40% of vehicle
                plate_y2 = min(height, v_y2 + 10)  # Small extension below vehicle
                plate_x1 = max(0, v_x1 - int(v_width * 0.1))  # Small extension to sides
                plate_x2 = min(width, v_x2 + int(v_width * 0.1))

                search_regions.append((plate_x1, plate_y1, plate_x2, plate_y2))
                print(f"Searching for license plate in vehicle region: {plate_x1},{plate_y1},{plate_x2},{plate_y2}")
        else:
            # If no vehicles detected, search entire image
            search_regions.append((0, 0, width, height))

        # Advanced image processing for license plate detection
        print("Performing advanced image processing for license plate detection")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply bilateral filter to reduce noise while keeping edges sharp
        gray = cv2.bilateralFilter(gray, 11, 17, 17)

        # Multiple edge detection approaches optimized for license plates
        edges = []

        # Canny with different thresholds for different contrast levels
        edges.append(cv2.Canny(gray, 30, 200))  # Good for high contrast plates
        edges.append(cv2.Canny(gray, 50, 150))  # Good for medium contrast
        edges.append(cv2.Canny(gray, 70, 180))  # Good for low contrast plates

        # Combine edges
        combined_edges = edges[0]
        for edge in edges[1:]:
            combined_edges = cv2.bitwise_or(combined_edges, edge)

        # Morphological operations to clean up edges and connect plate characters
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (4, 2))  # Horizontal kernel for text
        combined_edges = cv2.morphologyEx(combined_edges, cv2.MORPH_CLOSE, kernel, iterations=3)
        combined_edges = cv2.morphologyEx(combined_edges, cv2.MORPH_OPEN, kernel, iterations=1)

        # Find contours
        contours, hierarchy = cv2.findContours(combined_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:100]  # Top 100 contours

        license_plate_candidates = []

        for contour in contours:
            # Skip very small contours
            area = cv2.contourArea(contour)
            if area < 300:  # Minimum area for license plate characters
                continue

            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)

            # Check if contour is within search regions
            in_search_region = False
            for sx1, sy1, sx2, sy2 in search_regions:
                if x >= sx1 and y >= sy1 and x + w <= sx2 and y + h <= sy2:
                    in_search_region = True
                    break
            if not in_search_region:
                continue

            # Calculate aspect ratio
            aspect_ratio = w / float(h)

            # License plates are typically rectangular
            # Indian plates: ~3.0-5.0, Motorcycle plates: ~2.0-4.0, Commercial: ~4.0-6.0
            if not (1.5 <= aspect_ratio <= 7.0):
                continue

            # Check if dimensions are reasonable for license plates
            min_plate_width = 50
            max_plate_width = width * 0.95
            min_plate_height = 12
            max_plate_height = height * 0.8

            if not (min_plate_width <= w <= max_plate_width and min_plate_height <= h <= max_plate_height):
                continue

            # Calculate solidity (area / convex hull area)
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = area / hull_area if hull_area > 0 else 0

            # License plates should have reasonable solidity
            if solidity < 0.5:  # More lenient
                continue

            # Check if contour is approximately rectangular
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.06 * peri, True)  # More lenient approximation

            # Should be roughly rectangular (4-10 corners)
            if not (4 <= len(approx) <= 12):
                continue

            # Additional check: ensure the contour isn't too elongated or irregular
            rect_area = w * h
            extent = area / rect_area if rect_area > 0 else 0
            if extent < 0.4:  # Contour should fill reasonable portion of bounding box
                continue

            # Calculate score based on multiple factors
            aspect_score = 1.0 if 2.5 <= aspect_ratio <= 5.5 else 0.7
            size_score = min(w * h / (width * height * 0.1), 1.0)  # Allow larger plates
            position_score = 1.0 if y > height * 0.15 else 0.6  # Prefer lower half
            solidity_score = min(solidity * 2, 1.0)  # Boost solidity score
            extent_score = min(extent * 2.5, 1.0)  # Boost extent score

            total_score = aspect_score * size_score * position_score * solidity_score * extent_score

            license_plate_candidates.append({
                'contour': contour,
                'bbox': (x, y, w, h),
                'score': total_score,
                'area': area,
                'aspect_ratio': aspect_ratio,
                'solidity': solidity,
                'extent': extent
            })

        # Sort candidates by score
        license_plate_candidates.sort(key=lambda x: x['score'], reverse=True)

        print(f"Found {len(license_plate_candidates)} license plate candidates")

        # Try top candidates
        for candidate in license_plate_candidates[:15]:  # Check top 15 candidates
            x, y, w, h = candidate['bbox']

            # Add generous padding for license plate text
            padding_x = max(10, int(w * 0.2))
            padding_y = max(8, int(h * 0.25))

            x_pad = max(0, x - padding_x)
            y_pad = max(0, y - padding_y)
            w_pad = min(width - x_pad, w + 2 * padding_x)
            h_pad = min(height - y_pad, h + 2 * padding_y)

            # Crop license plate region
            license_plate_img = img[y_pad:y_pad + h_pad, x_pad:x_pad + w_pad]

            # Additional validation: check if cropped image has text-like characteristics
            if validate_license_plate_region(license_plate_img):
                license_plate_pil = Image.fromarray(cv2.cvtColor(license_plate_img, cv2.COLOR_BGR2RGB))
                print(f"Detected license plate with score {candidate['score']:.3f}, aspect ratio {candidate['aspect_ratio']:.2f}")
                return license_plate_pil

        print("No valid license plate regions found")
        return None

    except Exception as e:
        print(f"License plate detection failed: {e}")
        return None


def validate_license_plate_region(plate_img):
    """
    Validate if a cropped region is likely to be a license plate
    """
    try:
        if plate_img is None or plate_img.size == 0:
            return False

        # Convert to grayscale
        if len(plate_img.shape) == 3:
            gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_img

        # Check contrast - license plates should have good contrast
        min_val, max_val = np.min(gray), np.max(gray)
        contrast_ratio = (max_val - min_val) / 255.0
        if contrast_ratio < 0.3:  # Low contrast
            return False

        # Check for text-like patterns using horizontal projection
        height, width = gray.shape

        # Calculate horizontal projection (sum of pixels per row)
        horizontal_proj = np.sum(gray, axis=1) / width

        # Find peaks (text lines) and valleys (spaces)
        threshold = np.mean(horizontal_proj)
        peaks = horizontal_proj > threshold

        # Count transitions (should indicate text lines)
        transitions = np.sum(np.diff(peaks.astype(int)) != 0)

        # License plates typically have 1-2 lines of text
        if transitions < 2 or transitions > 8:
            return False

        # Check vertical projection for character spacing
        vertical_proj = np.sum(gray, axis=0) / height
        v_threshold = np.mean(vertical_proj)
        v_peaks = vertical_proj > v_threshold

        # Count character-like gaps
        v_transitions = np.sum(np.diff(v_peaks.astype(int)) != 0)

        # Should have multiple character transitions
        if v_transitions < 6:  # At least a few characters
            return False

        return True

    except Exception as e:
        print(f"License plate validation failed: {e}")
        return False

def extract_vehicle_number(image):
    """
    Extract vehicle number from license plate using OCR - Simplified and optimized for Indian plates
    """
    global OCR_ENGINE, PYTESSERACT, EASYOCR_READER

    vehicle_number = "Unknown"

    # Try pytesseract first with optimized settings for Indian license plates
    if PYTESSERACT is not None:
        try:
            # Convert to PIL Image if needed
            if isinstance(image, np.ndarray):
                ocr_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            else:
                ocr_image = image

            # Convert to grayscale
            gray = ocr_image.convert('L')

            # Enhance contrast
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(2.0)

            # Resize for better OCR (optimal size for tesseract)
            width, height = enhanced.size
            if width < 200:
                ratio = 200 / width
                new_size = (int(width * ratio), int(height * ratio))
                enhanced = enhanced.resize(new_size, Image.Resampling.LANCZOS)

            # Convert to OpenCV for additional processing
            img_np = np.array(enhanced)

            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(img_np, (3, 3), 0)

            # Try multiple threshold methods
            _, binary_otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            binary_adaptive = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

            # Try CLAHE for better contrast
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
            clahe_img = clahe.apply(blurred.astype(np.uint8))
            _, clahe_binary = cv2.threshold(clahe_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Test images
            test_images = [
                Image.fromarray(binary_otsu),
                Image.fromarray(binary_adaptive),
                Image.fromarray(clahe_binary),
                enhanced  # Original enhanced image
            ]

            best_text = ""
            best_confidence = 0

            # Try different PSM modes optimized for license plates
            psm_configs = [
                '--psm 8 --oem 3',  # Single word
                '--psm 7 --oem 3',  # Single text line
                '--psm 13 --oem 3', # Raw line
                '--psm 6 --oem 3',  # Uniform block of text
                '--psm 3 --oem 3',  # Fully automatic
            ]

            for img in test_images:
                for psm_config in psm_configs:
                    try:
                        # Whitelist for Indian license plates (letters, numbers, no special chars)
                        config = f'{psm_config} -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -c tessedit_pageseg_min_chars=3'

                        # Get both text and confidence data
                        data = PYTESSERACT.image_to_data(img, config=config, output_type=PYTESSERACT.Output.DICT)

                        # Extract text from all detected text blocks
                        texts = []
                        confidences = []

                        for i, text in enumerate(data['text']):
                            text = text.strip()
                            if text and len(text) >= 3:  # Minimum 3 characters
                                confidence = int(data['conf'][i])
                                if confidence > 30:  # Minimum confidence threshold
                                    texts.append(text.upper())
                                    confidences.append(confidence)

                        if texts:
                            # Combine all high-confidence texts
                            combined_text = ''.join(texts)

                            # Clean the text
                            import re
                            clean_text = re.sub(r'[^A-Z0-9]', '', combined_text)

                            if len(clean_text) >= 6:  # Minimum length for Indian plates
                                # Calculate average confidence
                                avg_confidence = sum(confidences) / len(confidences)

                                # Score based on Indian license plate pattern
                                score = avg_confidence

                                # Bonus points for matching Indian plate patterns
                                if re.match(r'^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$', clean_text):  # Full pattern
                                    score += 100
                                elif re.match(r'^[A-Z]{2}\d{2}[A-Z]+\d+$', clean_text):  # Partial pattern
                                    score += 50
                                elif re.match(r'^[A-Z]{2}\d+', clean_text):  # State code + numbers
                                    score += 25

                                # Prefer text with good letter-number balance
                                letters = sum(1 for c in clean_text if c.isalpha())
                                numbers = sum(1 for c in clean_text if c.isdigit())
                                if letters > 0 and numbers > 0:
                                    ratio = min(letters, numbers) / max(letters, numbers)
                                    if 0.3 <= ratio <= 1.0:  # Balanced alphanumeric
                                        score += 20

                                if score > best_confidence:
                                    best_confidence = score
                                    best_text = clean_text
                                    print(f"New best: '{clean_text}' (confidence: {avg_confidence:.1f}, score: {score:.1f})")

                    except Exception as e:
                        continue

            if best_text and len(best_text) >= 6:
                vehicle_number = best_text
                print(f"Final extracted vehicle number: '{vehicle_number}'")
            else:
                print("No valid license plate text found with pytesseract")

        except Exception as e:
            print(f"pytesseract OCR failed: {e}")

    # Fallback to easyocr if pytesseract didn't work
    if vehicle_number == "Unknown" and EASYOCR_READER is not None:
        try:
            print("Trying easyocr as fallback...")

            # Prepare image for easyocr
            if isinstance(image, Image.Image):
                ocr_img = np.array(image.convert('L'))
            else:
                ocr_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

            # Use easyocr with optimized settings
            results = EASYOCR_READER.readtext(ocr_img, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', detail=1)

            # Filter results by confidence and length
            valid_results = []
            for (bbox, text, confidence) in results:
                text = text.strip().upper()
                if confidence > 0.3 and len(text) >= 6:  # Minimum confidence and length
                    # Clean text
                    import re
                    clean_text = re.sub(r'[^A-Z0-9]', '', text)
                    if len(clean_text) >= 6:
                        valid_results.append((clean_text, confidence))

            if valid_results:
                # Sort by confidence and pick the best
                valid_results.sort(key=lambda x: x[1], reverse=True)
                best_text, best_conf = valid_results[0]

                # Additional validation for Indian plates
                import re
                if re.match(r'^[A-Z]{2}\d{2}[A-Z]+\d+$', best_text):
                    vehicle_number = best_text
                    print(f"easyocr extracted: '{vehicle_number}' (confidence: {best_conf:.2f})")
                else:
                    print(f"easyocr result doesn't match Indian plate pattern: '{best_text}'")

        except Exception as e:
            print(f"easyocr failed: {e}")

    if vehicle_number == "Unknown":
        print("License plate detection failed - no valid text extracted")
        # Return a placeholder that indicates detection failed
        vehicle_number = "DETECT_FAILED"

    return vehicle_number
