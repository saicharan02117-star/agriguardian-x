# Firebase backend for AgriGuardian X

AgriGuardian X uses Firebase Authentication + Cloud Firestore for the production backend. The static evaluation build can fall back to local browser storage only when Firebase has not yet been configured.

## Collections
- `conditions/{conditionId}` — verified crop-health knowledge records
- `sources/{sourceId}` — agronomic source metadata
- `modelVersions/{modelId}` — validated model metadata
- `users/{uid}/plants/{plantId}` — farmer-owned plant identity and geotag
- `users/{uid}/inspections/{inspectionId}` — AI/symptom/expert inspection records
- `users/{uid}/treatmentPlans/{planId}` — farmer-approved treatment plan records
- `users/{uid}/revisits/{revisitId}` — before/after recovery evidence
- `users/{uid}/feedback/{feedbackId}` — correction and training-consent records

## Required Firebase console steps
1. Create a Firebase project on the Spark plan.
2. Add a Web app.
3. Enable Authentication (Email/Password or Google sign-in).
4. Create Cloud Firestore in production mode.
5. Deploy `firestore.rules` and `firestore.indexes.json`.
6. Copy `firebase-config.example.js` to `firebase-config.js` and paste the public Web app config.
7. Never commit service-account JSON, private keys, Admin SDK credentials, or refresh tokens.

## Security model
Public users may read only reviewed condition/source/model metadata. Farmer records are stored below `users/{uid}` and every private rule checks `request.auth.uid == uid`. All unmatched paths are denied.

## Dataset governance
Training-image provenance remains documented in `../docs/DATASET.md`. Field images must not enter future training data unless the user consents and a reviewed label is attached.
