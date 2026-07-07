import numpy as np
from PIL import Image


def calculate_psnr(original_path: str, stego_path: str) -> float:
    """
    PSNR გამოთვლა:
      MSE  = mean((original - stego)²)
      PSNR = 10 * log10(255² / MSE)

    >40 dB — ვიზუალური მთლიანობა დაცულია.
    """
    if hasattr(original_path, "seek"):
        original_path.seek(0)
    if hasattr(stego_path, "seek"):
        stego_path.seek(0)
        
    orig  = np.array(Image.open(original_path).convert("RGB"), dtype=np.float64)
    stego = np.array(Image.open(stego_path).convert("RGB"),    dtype=np.float64)

    mse = np.mean((orig - stego) ** 2)
    if mse == 0:
        return float("inf")

    return 10 * np.log10((255.0 ** 2) / mse)
