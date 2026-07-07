from io import BytesIO
from .key_gen import generate_color_key
from .crypto import aes_encrypt, aes_decrypt
from .lsb import embed_lsb, extract_lsb
from utils.metrics import calculate_psnr
from .crypto import aes_encrypt, aes_decrypt, aes_encrypt_bytes, aes_decrypt_bytes


def hide(image_source, secret_text: str, password: str, output_target) -> dict:
    # BytesIO-ს შემთხვევაში ორჯერ გამოვიყენებთ — seek საჭიროა
    if isinstance(image_source, BytesIO):
        image_source.seek(0)

    color_key = generate_color_key(image_source, password)

    if isinstance(image_source, BytesIO):
        image_source.seek(0)

    encrypted = aes_encrypt(secret_text, color_key)
    embed_lsb(image_source, encrypted, color_key, output_target)

    # PSNR-ისთვის ორიგინალი კვლავ საჭიროა
    if isinstance(image_source, BytesIO):
        image_source.seek(0)
    if isinstance(output_target, BytesIO):
        output_target.seek(0)

    psnr = calculate_psnr(image_source, output_target)

    return {
        "psnr": round(psnr, 2),
        "color_key_hex": color_key.hex(),
        "encrypted_size_bytes": len(encrypted),
    }


def reveal(stego_source, color_key_hex: str) -> str:
    if isinstance(stego_source, BytesIO):
        stego_source.seek(0)

    color_key = bytes.fromhex(color_key_hex)
    encrypted = extract_lsb(stego_source, color_key)
    return aes_decrypt(encrypted, color_key)


def hide_file(image_source, file_bytes: bytes, filename: str, password: str, output_target) -> dict:
    if isinstance(image_source, BytesIO):
        image_source.seek(0)

    color_key = generate_color_key(image_source, password)

    if isinstance(image_source, BytesIO):
        image_source.seek(0)

    # filename + separator + file_bytes
    name_encoded = filename.encode("utf-8")
    payload = len(name_encoded).to_bytes(2, "big") + name_encoded + file_bytes
    encrypted = aes_encrypt_bytes(payload, color_key)

    embed_lsb(image_source, encrypted, color_key, output_target)

    if isinstance(image_source, BytesIO):
        image_source.seek(0)
    if isinstance(output_target, BytesIO):
        output_target.seek(0)

    psnr = calculate_psnr(image_source, output_target)

    return {
        "psnr": round(psnr, 2),
        "color_key_hex": color_key.hex(),
        "encrypted_size_bytes": len(encrypted),
    }


def reveal_file(stego_source, color_key_hex: str) -> tuple[bytes, str]:
    if isinstance(stego_source, BytesIO):
        stego_source.seek(0)

    color_key = bytes.fromhex(color_key_hex)
    encrypted = extract_lsb(stego_source, color_key)
    payload = aes_decrypt_bytes(encrypted, color_key)

    name_len = int.from_bytes(payload[:2], "big")
    filename = payload[2:2 + name_len].decode("utf-8")
    file_bytes = payload[2 + name_len:]

    return file_bytes, filename