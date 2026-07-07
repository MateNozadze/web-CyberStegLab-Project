import struct
import numpy as np
from PIL import Image


def extract_rgb_features(image_source) -> bytes:
    img = Image.open(image_source).convert("RGB")
    raw = np.array(img, dtype=np.uint8)
    pixels = (raw & 0xFE).astype(np.float64)

    H, W, _ = pixels.shape
    features = []

    features.extend(pixels.mean(axis=(0, 1)).tolist())

    for q in [
        pixels[:H//2, :W//2],
        pixels[:H//2, W//2:],
        pixels[H//2:, :W//2],
        pixels[H//2:, W//2:],
    ]:
        features.extend(q.mean(axis=(0, 1)).tolist())

    features.extend(pixels.std(axis=(0, 1)).tolist())

    return struct.pack(f"{len(features)}d", *features)