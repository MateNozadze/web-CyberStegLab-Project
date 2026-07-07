import hashlib
from .features import extract_rgb_features


def generate_color_key(image_path: str, password: str) -> bytes:
    """
    Color-Key გენერაცია:
      K = SHA-256(RGB_features XOR password_bytes)

    შედეგი: 32-ბაიტიანი გასაღები (256 ბიტი)
    """
    rgb_bytes = extract_rgb_features(image_path)

    if hasattr(image_path, "seek"):
        image_path.seek(0)

    pwd_bytes = password.encode("utf-8")

    pwd_extended = (pwd_bytes * (len(rgb_bytes) // len(pwd_bytes) + 1))[:len(rgb_bytes)]
    xor_result = bytes(a ^ b for a, b in zip(rgb_bytes, pwd_extended))

    return hashlib.sha256(xor_result).digest()
