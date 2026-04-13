import pytesseract
from PIL import Image
import io
import base64
import os

import sys
import platform

# Tesseract path detection logic
def get_tesseract_path():
    # 1. Check if running as a PyInstaller bundle
    if getattr(sys, 'frozen', False):
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
        if platform.system() == "Windows":
            return os.path.join(base_path, "bin", "tesseract", "tesseract.exe")
        return os.path.join(base_path, "bin", "tesseract")

    # 2. Local Mac path (Homebrew)
    mac_brew_path = "/opt/homebrew/bin/tesseract"
    if platform.system() == "Darwin" and os.path.exists(mac_brew_path):
        return mac_brew_path

    # 3. Local Windows path (for dev)
    if platform.system() == "Windows":
        local_win_path = os.path.join(os.getcwd(), "bin", "tesseract", "tesseract.exe")
        if os.path.exists(local_win_path):
            return local_win_path

    # 4. Fallback (rely on PATH)
    return "tesseract"

TESSERACT_PATH = get_tesseract_path()
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def extract_text_from_image_base64(b64_str: str) -> str:
    try:
        # Strip data URI prefix if present
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
            
        img_data = base64.b64decode(b64_str)
        img = Image.open(io.BytesIO(img_data))
        
        # Perform OCR
        # lang='tur' can be added if training data exists, 
        # but for Docker/Code, default 'eng' is usually better.
        # We can try both or just default.
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
