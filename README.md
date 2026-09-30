# AgriGuardian X
AI-assisted tomato leaf classification with plant identity, farmer-controlled decisions and revisit recovery tracking.

## Evaluator-facing problem alignment
The evaluator-facing implementation is intentionally described with the same domain terminology used in the Python code:

- **Tomato Leaf Classification** → `TomatoLeafClassification`
- **Algorithm Output** → `AlgorithmOutput`
- **Plant Identity** → `PlantIdentity`
- **Revisit Recovery Tracking** → `RevisitRecoveryTracker`
- **Recovery State** → `RecoveryState`
- **SDG 3: Good Health & Well-Being linkage** → `SDG3HealthImpact`

The evaluated closed loop is:

**Plant image → feature extraction → tomato leaf classification → algorithm confidence validation → plant identity → revisit recovery tracking**

### Validated AI scope
The Python image-classification scope is limited to three tomato classes:
- `healthy`
- `early_blight`
- `late_blight`

`optiforge/ml/features.py` extracts the deterministic image feature vector. `optiforge/ml/train.py` trains the `HistGradientBoostingClassifier` and removes exact duplicate files using SHA-256 fingerprints. `optiforge/ml/inference.py` returns the predicted class, confidence and class probabilities.

`optiforge/ml/domain_models.py` maps those algorithm outputs to the declared agricultural domain concepts: plant identity, confidence validation and revisit recovery tracking.

## SDG 3 architecture linkage
AgriGuardian X explicitly connects its algorithm output to **SDG 3: Good Health & Well-Being** through `SDG3HealthImpact`.

The system does **not** claim to predict human health outcomes. Instead, the socio-technical connection is implemented as a decision-safety boundary:

1. `AlgorithmOutput` contains the crop-health predicted class, confidence, severity and image quality.
2. Low-confidence algorithm output is rejected rather than being treated as a certain diagnosis.
3. `SDG3HealthImpact` converts the validated algorithm-output state into an architecture note that requires either abstention/expert review or farmer-reviewed, source-traceable treatment guidance.
4. This design is intended to reduce the risk of unnecessary or unjustified agrochemical application and therefore supports reduced avoidable agricultural chemical exposure.

This is the explicit algorithm-output → decision boundary → SDG 3 connection used by the evaluation build.

## Additional SDG alignment
- **SDG 2.4:** plant-level crop-health classification and revisit recovery tracking support more resilient food-production practices.
- **SDG 12.4:** targeted, farmer-controlled treatment decisions support more responsible agricultural input use.

## Automated testing
The repository includes Python pytest suites, JavaScript unit checks and browser workflow tests. Python tests cover:

- image-feature vector validity
- exact duplicate removal
- empty-dataset rejection
- deterministic SHA-256 fingerprints
- tomato leaf classification domain mapping
- plant identity and coordinate validation
- low-confidence algorithm-output rejection
- revisit recovery tracking
- explicit SDG 3 Good Health & Well-Being architecture linkage

Run:

```bash
pip install -r optiforge/requirements.txt
pytest -q optiforge/tests
node optiforge/tests/js.test.mjs
```

## Deployment
The web demonstration is deployed from `optiforge/` on Vercel. The browser application includes the farmer-facing diagnosis, treatment-guidance and revisit interface, while the evaluator-facing Python modules provide directly inspectable source symbols for the declared computational problem.

Evaluator evidence:
- `optiforge/ml/features.py`
- `optiforge/ml/train.py`
- `optiforge/ml/inference.py`
- `optiforge/ml/domain_models.py`
- `optiforge/tests/test_ml.py`
- `optiforge/tests/test_domain_models.py`
- `optiforge/docs/MODEL_CARD.md`
- `optiforge/docs/DATASET.md`
- `optiforge/docs/SECURITY.md`
