# AgriGuardian X
AI-assisted plant-health screening with plant/zone traceability, verified treatment guidance, farmer approval and revisit-based recovery verification.

## Evaluation build
The evaluator-facing product is deployed on Vercel from `optiforge/` and is intentionally focused on one closed-loop workflow:

**Capture → Diagnose → Explain → Farmer approval → Save plant identity → Revisit → Verify recovery**

The build contains modular browser code, reproducible ML scripts, automated browser/unit tests, a model card, dataset provenance, security headers, Firebase/Firestore security rules and source-traceable crop-health guidance.

### AI scope
The image screen explicitly supports three validated tomato prototype classes:
- Tomato healthy
- Tomato early blight
- Tomato late blight

The broader crop library covers tomato, chilli, maize, cotton and groundnut across leaf, stem, root, flower, fruit, whorl, boll and whole-plant symptoms. These are knowledge records, **not extra trained image classes**.

### Backend architecture
Production architecture uses:
- **Firebase Authentication** for farmer identity
- **Cloud Firestore** for private plant, inspection, treatment and revisit records
- **Firestore Security Rules** for per-user authorization
- **Vercel** for the web deployment

Until the Firebase Web App config is supplied, the static demo uses browser localStorage as an explicit offline/demo fallback. It does not claim cloud persistence when Firebase is not configured.

See `optiforge/firebase/README.md`, `optiforge/firebase/firestore.rules`, and `optiforge/firebase/firestore.indexes.json`.

## Dataset and model governance
Training provenance is documented in `optiforge/docs/DATASET.md`. Field images are not silently added to training data. New field evidence may be considered for future training only after consent, reviewed labels, duplicate checks and a fresh held-out evaluation.

## Run locally
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080/optiforge/`.

## Verification
```bash
node optiforge/tests/js.test.mjs
python3 optiforge/tests/test_ml.py -v
cd optiforge && npm ci && npm run test:browser
```

Evaluator-facing evidence:
- `optiforge/docs/MODEL_CARD.md`
- `optiforge/docs/DATASET.md`
- `optiforge/docs/SECURITY.md`
- `optiforge/docs/UI_UX_SPEC.md`
- `optiforge/docs/PLANTIX_COMPARISON.md`
- `optiforge/firebase/README.md`
