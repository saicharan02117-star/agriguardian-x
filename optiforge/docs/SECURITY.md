# Security model

## Browser surface
- No private API key, Admin SDK credential, service-account JSON, model-provider secret or refresh token is stored in client code.
- Firebase Web App configuration is public client configuration; authorization is enforced by Firebase Authentication + Firestore Security Rules, not by hiding the web config.
- Images are analysed locally in the evaluation demo and are not uploaded automatically.
- File MIME type and size are validated; low-quality inputs can return an uncertain result instead of a forced diagnosis.
- Dynamic user values are escaped or inserted with `textContent`.
- Deployment headers deny framing and MIME sniffing, restrict referrers and disable unnecessary browser capabilities.

## Firebase / Firestore surface
- Public reference collections (`conditions`, `sources`, validated `modelVersions`) are read-only from the browser.
- Private farmer data lives below `users/{uid}`.
- Every private rule requires `request.auth != null && request.auth.uid == uid`.
- Unmatched Firestore paths are denied by default.
- Client users cannot write verified knowledge records or validated model metadata.
- Service-account/Admin SDK credentials must never be committed or sent to the browser.
- `firestore.rules` and `firestore.indexes.json` are version-controlled under `optiforge/firebase/`.

## Abuse and failure handling
- The current evaluator demo has no paid inference endpoint, so it has no model-API quota to exhaust.
- Firestore access is limited by authentication and per-user path ownership.
- Production should enable Firebase App Check before public scale-out.
- User-facing errors do not expose stack traces, credentials, internal database paths or tokens.
- When Firebase is not configured, the demo explicitly falls back to local browser storage rather than pretending that records were saved to the cloud.

## Deployment checks
1. Run JavaScript, Python and Playwright tests.
2. Validate production HTTPS security headers.
3. Scan the repository for service-account/private-key/token patterns.
4. Deploy Firestore rules in production mode.
5. Test owner access and cross-user denial using two authenticated test users.
6. Confirm public reference data cannot be modified from the client.
7. Enable App Check before production-scale use.
