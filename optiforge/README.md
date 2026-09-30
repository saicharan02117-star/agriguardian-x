# AgriGuardian X — evaluation module

Working flow: image screening → confidence and severity → field/row/plant identity → optional browser geolocation → saved inspection → revisit status (improving/stable/worsening).

The static demo stores records locally so it works without credentials. The included Supabase schema is secured with row-level ownership policies and is ready to apply when a project is connected. No secret or service-role key belongs in the browser.

## Run
`python -m http.server 8080` from the repository root, then open `http://localhost:8080/optiforge/`.

## Verify
- `node optiforge/tests/js.test.mjs`
- `pytest -q optiforge/tests/test_ml.py`
- `playwright test optiforge/tests/browser.spec.js` after serving the repository

## Evidence policy
Only generated results in `artifacts/evaluation.json` are reportable. The previous 92.59% / 135-image statement is intentionally omitted because its original model artifact, exact split, and report were not recoverable.
