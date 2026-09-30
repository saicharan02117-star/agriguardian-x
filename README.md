# AgriGuardian X
AI-assisted plant-health screening with plant/zone traceability and revisit-based recovery verification.

## Evaluation build
This repository is configured for static deployment on Vercel and GitHub Pages.

The root URL opens the evaluation workspace in `optiforge/`. The earlier camera-control/dashboard prototype was removed from this branch so evaluators see one focused product.

The evaluation module contains modular browser code, reproducible ML scripts, automated browser and unit tests, a model card, dataset provenance, security headers, and an RLS-protected Supabase schema. Its image screen supports Tomato Healthy, Early Blight and Late Blight as an explicitly limited prototype scope.

The crop knowledge library adds source-traceable inspection guidance for tomato, chilli, maize, cotton and groundnut across leaf, stem, root, flower, fruit, whorl, boll and whole-plant symptoms. These records are clearly separated from trained image classes.

## Run locally
Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080

## Verification

```bash
node optiforge/tests/js.test.mjs
python3 optiforge/tests/test_ml.py -v
cd optiforge && npm install && npm run test:browser
```

See `optiforge/docs/UI_UX_SPEC.md`, `optiforge/docs/SECURITY.md`, `optiforge/docs/MODEL_CARD.md`, and `optiforge/docs/PLANTIX_COMPARISON.md` for evaluator-facing design and evidence.
