# Security model

## Browser surface
- No service-role, secret or model-provider key is stored in client code.
- Images are analysed locally in the evaluation demo and are not uploaded automatically.
- File MIME type and size are validated; low-quality inputs can return an uncertain result.
- Dynamic user values are escaped or inserted with `textContent`.
- Deployment headers deny framing and MIME sniffing, limit referrers, and disable camera/microphone/payment access.

## Supabase surface
- Reference tables are read-only to public roles.
- Every exposed table has row-level security enabled.
- Farmer records, inspections and feedback require authentication and `auth.uid() = user_id` for reads and writes.
- No `SECURITY DEFINER` function is used.
- Service-role credentials belong only in a server environment and are never required by this static client.

## Abuse and failure handling
- The current demo has no paid inference endpoint, so it has no model-API quota to exhaust.
- A future write API should add per-user and per-IP rate limits at the edge and retain RLS as the final authorization boundary.
- User-facing errors do not expose stack traces, SQL, tokens or internal identifiers.

## Deployment checks
Run the JavaScript, Python and browser tests, inspect headers over HTTPS, scan the repository for secret patterns, and run Supabase security/performance advisors after applying migrations.
