from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / "ml"))

from features import image_features
from train import CLASSES, fingerprint, load


@pytest.fixture
def synthetic_dataset(tmp_path: Path) -> Path:
    """Create a tiny three-class image tree for deterministic loader tests."""
    for folder in CLASSES:
        (tmp_path / folder).mkdir()
    return tmp_path


def test_feature_vector_shape_and_finiteness(tmp_path: Path) -> None:
    """Feature extraction must always return the documented 57 finite values."""
    image_path = tmp_path / "leaf.png"
    Image.fromarray(np.full((32, 32, 3), [30, 150, 50], dtype=np.uint8)).save(image_path)
    vector = image_features(image_path)
    assert vector.shape == (57,)
    assert np.isfinite(vector).all()


def test_exact_duplicate_images_are_removed(synthetic_dataset: Path) -> None:
    """Exact byte duplicates must never be counted twice across class folders."""
    folders = list(CLASSES)
    image = Image.fromarray(np.full((8, 8, 3), 80, dtype=np.uint8))
    image.save(synthetic_dataset / folders[0] / "a.png")
    image.save(synthetic_dataset / folders[1] / "b.png")
    rows, duplicates = load(synthetic_dataset)
    assert len(rows) == 1
    assert duplicates == 1


def test_loader_rejects_empty_supported_dataset(synthetic_dataset: Path) -> None:
    """Training must fail loudly when no supported images are available."""
    with pytest.raises(ValueError, match="No supported images"):
        load(synthetic_dataset)


def test_fingerprint_is_deterministic(tmp_path: Path) -> None:
    """Dataset identity hashes must remain stable for the same image bytes."""
    image_path = tmp_path / "leaf.png"
    Image.fromarray(np.full((8, 8, 3), 120, dtype=np.uint8)).save(image_path)
    assert fingerprint(image_path) == fingerprint(image_path)
