"""Deterministic image features for the reproducible baseline model."""
from pathlib import Path
import numpy as np
from PIL import Image

def image_features(path: str | Path) -> np.ndarray:
    image = Image.open(path).convert("RGB").resize((96, 96))
    arr = np.asarray(image, dtype=np.float32) / 255.0
    feats = []
    for channel in range(3):
        hist, _ = np.histogram(arr[:, :, channel], bins=16, range=(0, 1), density=True)
        feats.extend(hist.tolist())
    gray = arr.mean(axis=2)
    gx, gy = np.diff(gray, axis=1), np.diff(gray, axis=0)
    feats += [float(arr[:, :, i].mean()) for i in range(3)]
    feats += [float(arr[:, :, i].std()) for i in range(3)]
    feats += [float(np.abs(gx).mean()), float(np.abs(gy).mean()), float(gray.std())]
    return np.asarray(feats, dtype=np.float32)
