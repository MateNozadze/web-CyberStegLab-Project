import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core import hide, reveal

TEST_IMAGE  = "tests/test_original.png"
STEGO_IMAGE = "tests/test_stego.png"
PASSWORD    = "ColorKey2026!"
SECRET      = "გამარჯობა! ეს არის Color-Key ალგორითმით დამალული შეტყობინება."


def make_test_image():
    if not os.path.exists(TEST_IMAGE):
        rng = np.random.default_rng(42)
        pixels = rng.integers(0, 256, (600, 800, 3), dtype=np.uint8)
        Image.fromarray(pixels, "RGB").save(TEST_IMAGE)
        print(f"[+] სატესტო სურათი შეიქმნა: {TEST_IMAGE}")


def test_hide_reveal():
    make_test_image()

    print("\n" + "="*50)
    print("  Color-Key სტეგანოგრაფია — ტესტი")
    print("="*50)

    result = hide(TEST_IMAGE, SECRET, PASSWORD, STEGO_IMAGE)
    print(f"  PSNR:      {result['psnr']} dB")
    print(f"  Color-Key: {result['color_key_hex']}")

    recovered = reveal(STEGO_IMAGE, result["color_key_hex"])

    if recovered == SECRET:
        print("\n  ✅ ტესტი წარმატებულია!")
    else:
        print("\n  ❌ შეცდომა!")
        sys.exit(1)


if __name__ == "__main__":
    test_hide_reveal()
