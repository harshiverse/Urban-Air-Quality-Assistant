# Initial Security and Privacy Threat Model

- **Status:** Initial design-stage assessment; no application code exists to audit
- **Review cadence:** Revisit when APIs, storage, authentication, AI tools, or deployment change

## 1. Scope and assumptions

The planned application is a web app that calls external environmental data providers and an LLM provider from server-side code. Users can search for locations and may optionally grant browser geolocation. The first release should avoid accounts and persistent personal histories unless required.

This document is a threat-model starting point, not a penetration test, security certification, or proof that the eventual application is secure.

## 2. Assets to protect

- Provider API keys and LLM credentials.
- Database credentials and deployment secrets.
- Environmental data integrity and source provenance.
- Any user-supplied question or location identifier.
- Precise geolocation if the user grants it.
- Logs, error traces, and internal service metadata.
- Availability and cost limits of public/AI endpoints.

## 3. Trust boundaries

1. Browser to application server.
2. Application server to external data provider.
3. Application server to LLM provider.
4. Application server to database/cache.
5. Build/deployment pipeline to production runtime.

All data crossing these boundaries must be validated and treated as untrusted unless authenticated and verified under an explicit trust model.

## 4. Threat register

| ID | Threat | Potential impact | Primary mitigations | Verification |
|---|---|---|---|---|
| T-01 | API key committed or leaked to browser bundle/logs | Provider abuse, cost, unauthorized access | Server-only secrets, ignored env files, secret scanning, log redaction | Inspect bundle, repository history, logs, secret scanner |
| T-02 | Malformed or malicious user input | Injection, crashes, resource exhaustion | Runtime schema validation, length/range limits, safe rendering, parameterized queries | Unit/integration tests and security testing |
| T-03 | Server-side request forgery via user-controlled URL | Internal network/service access | Fixed provider base URLs, allowlisted destinations, validated IDs, no arbitrary fetch URL | SSRF test cases and code review |
| T-04 | Cross-site scripting from provider/model/user text | Script execution in user browser | Render as text, avoid unsafe HTML, sanitize only if rich HTML is required, CSP | Component tests and browser security checks |
| T-05 | CSRF for state-changing authenticated actions | Unauthorized state change | Avoid cookie-auth state changes unless needed; use appropriate CSRF protections and SameSite cookies | Integration tests |
| T-06 | Unauthorized access to user-specific data | Privacy breach | Minimize personal data; enforce authorization at server boundary | Authorization tests |
| T-07 | Public endpoint or AI abuse | Cost escalation, denial of service | Rate limits, request size limits, timeouts, quotas, usage monitoring | Load/rate-limit tests |
| T-08 | Prompt injection in user question or retrieved content | Unsafe or misleading output, context leakage | Treat input/retrieval as data, strict system boundary, minimal context, no privileged tools, output validation | Adversarial prompt tests |
| T-09 | LLM invents measurements or claims | Misleading public environmental advice | Server-grounded facts, deterministic AQI, required source/timestamp, uncertainty, missing-data response | Grounding evaluation suite |
| T-10 | Poisoned/abnormal upstream measurement | Incorrect AQI and public misinformation | Schema/range/plausibility checks, quality flags, provenance, no silent correction | Data fixture and anomaly tests |
| T-11 | Stale data presented as current | Poor decisions and loss of trust | First-class observation/retrieval timestamps, freshness policy, stale UI state | Stale-cache tests |
| T-12 | Sensitive location retained or disclosed | Privacy harm | Explicit permission, manual selection, coarse location where possible, no default history, redacted logs | Privacy review and storage inspection |
| T-13 | Dependency or build-supply-chain compromise | Code execution/data exposure | Lockfile, minimal dependencies, update review, vulnerability scan, trusted package sources | Dependency audit and review |
| T-14 | Overly permissive CORS/security headers | Cross-origin abuse or browser exposure | Restrictive origin policy, CSP, frame protection, safe headers | Header verification |
| T-15 | Logs expose tokens, coordinates, questions, or provider payloads | Privacy/credential leakage | Structured logging, field allowlist, redaction, retention limits | Automated log tests and review |

## 5. Security requirements before release

- No known critical or high-severity unresolved vulnerabilities.
- No committed secrets in current repository or newly added history.
- Provider/LLM credentials are server-only and managed by the deployment secret store.
- All public request fields are validated and bounded.
- External fetch destinations are fixed/allowlisted.
- API and AI routes have rate and payload limits.
- Errors returned to users are safe and do not reveal internal details.
- Security headers are configured and verified for the production origin.
- AI context is minimal, server-derived, and does not grant privileged tools.
- Geolocation processing and retention are documented and consent-based.
- Dependency and static security checks are recorded.

## 6. Security review method

Use OWASP ASVS as a structured reference and map applicable controls to the actual application. Also review relevant OWASP guidance for API security, SSRF, XSS, and LLM applications. Do not claim ASVS compliance without an explicit assessment and evidence.

## 7. Open questions

- Will user accounts exist?
- Will AI conversations be stored?
- Which provider/LLM services will process location or user questions?
- What is the production hosting environment and its network boundary?
- Are alerts delivered externally (email/push/SMS)?
- What retention policy is required by the challenge?
