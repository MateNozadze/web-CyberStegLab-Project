import struct
import numpy as np
from PIL import Image


def _make_trajectory(color_key: bytes, total_pixels: int) -> np.ndarray:
    seed = int.from_bytes(color_key[:4], "big")
    rng = np.random.default_rng(seed)
    indices = np.arange(total_pixels, dtype=np.int64)
    rng.shuffle(indices)
    return indices


def _bytes_to_bits(data: bytes) -> list:
    return [(byte >> i) & 1 for byte in data for i in range(7, -1, -1)]


def _bits_to_bytes(bits: list) -> bytes:
    result = []
    for i in range(0, len(bits), 8):
        byte = 0
        for j, bit in enumerate(bits[i:i+8]):
            byte = (byte << 1) | bit
        result.append(byte)
    return bytes(result)


def embed_lsb(image_source, payload: bytes, color_key: bytes, output_target):
    img = Image.open(image_source).convert("RGB")
    pixels = np.array(img, dtype=np.uint8)
    H, W, _ = pixels.shape
    flat = pixels.reshape(-1, 3)

    full_payload = struct.pack(">I", len(payload)) + payload
    bits = _bytes_to_bits(full_payload)

    if len(bits) > len(flat) * 3:
        raise ValueError(
            f"სურათი ძალიან პატარაა. საჭიროა {len(bits)} ბიტი, "
            f"მაქსიმუმი: {len(flat) * 3} ბიტი."
        )

    trajectory = _make_trajectory(color_key, len(flat))
    bit_idx = 0

    for pix_idx in trajectory:
        for channel in range(3):
            if bit_idx >= len(bits):
                break
            flat[pix_idx, channel] = (flat[pix_idx, channel] & 0b11111110) | bits[bit_idx]
            bit_idx += 1
        if bit_idx >= len(bits):
            break

    Image.fromarray(flat.reshape(H, W, 3), "RGB").save(output_target, format="PNG")

    if hasattr(image_source, "seek"):
        image_source.seek(0)


def extract_lsb(stego_source, color_key: bytes) -> bytes:
    flat = np.array(Image.open(stego_source).convert("RGB"), dtype=np.uint8).reshape(-1, 3)
    trajectory = _make_trajectory(color_key, len(flat))

    raw_bits = []
    payload_length = None
    payload_bits_needed = None

    for pix_idx in trajectory:
        for channel in range(3):
            raw_bits.append(flat[pix_idx, channel] & 1)

            if payload_length is None and len(raw_bits) == 32:
                payload_length = struct.unpack(">I", _bits_to_bytes(raw_bits[:32]))[0]
                payload_bits_needed = payload_length * 8

            if payload_length is not None and len(raw_bits) >= 32 + payload_bits_needed:
                break

        if payload_length is not None and len(raw_bits) >= 32 + payload_bits_needed:
            break

    return _bits_to_bytes(raw_bits[32: 32 + payload_bits_needed])