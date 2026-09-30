from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / "ml"))

from domain_models import (
    AlgorithmOutput,
    PlantIdentity,
    RecoveryState,
    RevisitRecoveryTracker,
    SDG3HealthImpact,
    Severity,
    TomatoLeafClassification,
)


def test_tomato_leaf_classification_maps_to_plant_identity() -> None:
    """Declared tomato leaf classification must be linked to a concrete plant."""
    plant = PlantIdentity("Field A", "03", "12", 17.9, 79.6)
    output = AlgorithmOutput("early_blight", 0.88, Severity.MODERATE, 0.91)
    result = TomatoLeafClassification(plant, output)
    result.validate()
    assert result.plant.plant_id == "Field A-R03-P12"
    assert result.output.predicted_class == "early_blight"


def test_algorithm_output_rejects_low_confidence() -> None:
    """Low-confidence algorithm output must abstain rather than force a result."""
    output = AlgorithmOutput("late_blight", 0.41, Severity.SEVERE, 0.90)
    with pytest.raises(ValueError, match="low-confidence"):
        output.validate()


@pytest.mark.parametrize(
    ("previous", "current", "expected"),
    [
        (None, Severity.MILD, RecoveryState.BASELINE),
        (Severity.SEVERE, Severity.MODERATE, RecoveryState.IMPROVING),
        (Severity.MODERATE, Severity.MODERATE, RecoveryState.STABLE),
        (Severity.MILD, Severity.SEVERE, RecoveryState.WORSENING),
    ],
)
def test_revisit_recovery_tracking(
    previous: Severity | None,
    current: Severity,
    expected: RecoveryState,
) -> None:
    """Revisit recovery tracking must classify severity change correctly."""
    tracker = RevisitRecoveryTracker(
        PlantIdentity("Field A", "03", "12"), previous, current
    )
    assert tracker.recovery_state() is expected


def test_sdg3_health_and_wellbeing_linkage_is_explicit() -> None:
    """Algorithm output must map explicitly to SDG 3 in architecture semantics."""
    classification = TomatoLeafClassification(
        PlantIdentity("Field A", "03", "12"),
        AlgorithmOutput("early_blight", 0.88, Severity.MODERATE, 0.91),
    )
    note = SDG3HealthImpact(classification).architecture_note()
    assert "SDG 3" in note
    assert "Good Health & Well-Being" in note
    assert "classification output" in note
    assert "agrochemical exposure" in note
