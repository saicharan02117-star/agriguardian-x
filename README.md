# AgriGuardian X
AI-assisted plant-health screening with plant/zone traceability and revisit-based recovery verification.

## Live deployment
This repository is configured for GitHub Pages deployment through GitHub Actions.

Evaluation workspace: `optiforge/`

The evaluation module contains modular browser code, reproducible ML scripts, automated tests, a model card, dataset provenance, and an RLS-protected Supabase schema. It supports Tomato Healthy, Early Blight and Late Blight as an explicitly limited prototype scope.

## Run locally
Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080
