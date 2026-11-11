# Schrute Security
https://schrute-security.vercel.app/

Schrute Security is a Dunder Mifflin inspired cybersecurity learning app. It includes five feature areas, local simulations, browser-only AES-GCM tools, and a Global Threat Watch backed by the CISA Known Exploited Vulnerabilities catalog. Classroom scenarios remain clearly labeled as fictional demo data.

## Run locally

1. Install Node.js 20 or later.
2. Run npm install.
3. Copy .env.example to .env.local. The app starts in demo mode without credentials.
4. Run npm run dev and open http://localhost:3000.
5. Use npm run build for a production build and npm test for unit tests.

## Supabase setup

Create a Supabase project, then configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and the server-only SUPABASE_SERVICE_ROLE_KEY. Apply supabase/migrations/202611100001_initial_schema.sql with the Supabase CLI (supabase db push) or a reviewed migration workflow. The migration enables RLS; public clients can read reference data, while there are no public write policies. Never expose the service role key in browser code.

The application currently uses a local demo data adapter. Supabase persistence and source ingestion require server credentials and are not active in demo mode.

## Threat data and source configuration

The Global Threat Watch reads Ransomwhere.org's cached ransomware victim feed and the CISA Known Exploited Vulnerabilities catalog through server-side endpoints. Ransomware claims are marked unverified; country markers show approximate reported victim-country centres, not precise incident or attacker locations. CISA vulnerability entries remain a separate stream.

Optional configuration placeholders are provided for OTX (OTX_API_KEY) and AbuseIPDB (ABUSEIPDB_API_KEY). They are deliberately not called from the browser. CISA publishes its KEV catalog as public data; before enabling ingestion, validate the current format, licensing, and update cadence against [CISA's KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog). OTX offers API/TAXII access in its [official API documentation](https://otx.alienvault.com/api); AbuseIPDB documents API v2 at [docs.abuseipdb.com](https://docs.abuseipdb.com/). No provider is represented as synchronized until a source adapter persists a successful sync.

POST /api/ingestion/sync is protected by the server-only INGESTION_SECRET; it returns a clear not-configured response until a persistence adapter is installed. Do not expose this secret to client code. A scheduled GitHub Actions workflow should call a deployed protected endpoint only after provider adapters, Supabase persistence, and operational limits are configured.

## Features

- / — story-led homepage and department directory.
- /threat-watch — country-level ransomware-claim map and searchable victim feed, with a separate searchable CISA KEV catalog.
- /threat-intelligence — learning modules, quiz, and browsable daily tips.
- /attack-simulator — local phishing, password, interception, tampering, and malware-awareness scenarios.
- /encryption-lab — classical ciphers, SHA-256, and browser-local AES-GCM text/file encryption.
- /defense-center — interactive checklists and knowledge assessment.

Map tiles use OpenFreeMap's Liberty style by default. Keep map attribution visible and review the provider's current [usage terms](https://openfreemap.org/).

## Testing and deployment

Run npm test for data tests; npm run build checks production compilation. Playwright is included for browser journeys, but a browser suite has not yet been authored. Deploy the Next.js app on Vercel, configure environment variables in project settings, and connect Supabase separately. Configure a scheduled workflow only after ingestion adapters are implemented and tested.

## Security notes

Passwords are scored only in local component state. File cryptography runs in the browser with Web Crypto AES-GCM, random 96-bit IVs, and authenticated decryption. Encryption keys are not persisted. Do not reuse production secrets in this learning application.
