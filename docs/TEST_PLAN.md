# Quality Assurance and Test Plan

- **Status:** Test strategy; tools not yet installed

## 1. Quality objective

Prove that the application reports only supported environmental facts, calculates CPCB AQI correctly when sufficient valid data exists, handles provider/AI failure safely, protects secrets and user privacy, and supports core user journeys across screen sizes.

## 2. Test layers

### Unit tests

Test pure domain logic without network or database dependencies:

- CPCB category mapping and pollutant sub-index interpolation.
- Official breakpoint boundaries and rounding.
- Data sufficiency and averaging windows.
- Unit conversion and parameter mapping.
- Freshness classification.
- Timestamp parsing and timezone behavior.
- Recommendation/category mapping.
- Provider response normalization and validation helpers.

### Component tests

Test:

- AQI indicator labels and accessible output.
- Pollutant detail values and units.
- Loading, error, empty, partial, stale, and insufficient-data states.
- Location search validation and permission-denied handling.
- Chart labels, descriptions, and missing-data representation.
- Assistant responses with source/freshness disclosures.

### Integration tests

Test boundaries between:

- API handlers and validation schemas.
- API handlers and provider adapters.
- Provider adapters and normalized domain types.
- Domain calculations and persisted observations.
- AI context retrieval and model adapter.
- Repositories and database migrations/constraints.

Use deterministic fixtures and mocked external services. Never make test success depend on an uncontrolled live API.

### End-to-end tests

Core journey:

1. Open the dashboard.
2. Search for a supported location.
3. Select a location/station.
4. View the available AQI/observations and provenance.
5. Open pollutant details.
6. View historical data or an explicit unavailable state.
7. Ask a question in the assistant.
8. Verify that the answer is grounded in supplied context and discloses limitations.
9. Simulate a provider outage and verify graceful failure.
10. Verify responsive layout and basic keyboard navigation.

## 3. Domain test matrix

| Area | Required cases |
|---|---|
| AQI categories | 50/51, 100/101, 200/201, 300/301, 400/401 and valid outer bounds |
| Pollutant sub-index | Each official breakpoint, interpolation, out-of-range, rounding |
| Data sufficiency | Fewer than three pollutants; three without PM2.5/PM10; valid minimum set; less than required duration |
| Averaging | 24-hour pollutant averages; 8-hour CO/O3; running average behavior where relevant |
| Missing data | Missing pollutant is not zero; individual sub-index may exist without overall AQI |
| Data provenance | Source/station/time/unit preserved end-to-end |
| Freshness | Fresh, stale, cached, historical, future/invalid timestamp |
| Provider robustness | Timeout, 429, 5xx, malformed JSON, missing fields, abnormal measurement |
| AI grounding | Correct context, no context, stale context, contradictory prompt, unsupported causal claim, malicious retrieved text |
| Security | Oversized body, invalid ID, injection strings, SSRF attempt, rate limit, secret exposure checks |

Exact breakpoint fixtures must be derived from the verified official CPCB document/calculator, not guessed.

## 4. Browser and accessibility checks

- Desktop, tablet, and narrow mobile viewports.
- Keyboard-only primary journey.
- Visible focus and semantic labels.
- AQI category communicated with text as well as colour.
- Chart axis labels, units, and accessible descriptions.
- Reduced-motion preference where animation exists.
- No uncaught console errors or failed required network requests in core flows.

## 5. Performance and reliability checks

- Provider requests use timeouts.
- Retry is bounded and does not amplify load.
- API history ranges and result counts are bounded.
- Caching preserves observation time and freshness.
- AI provider failure does not break non-AI monitoring.
- No unnecessary high-frequency polling.
- Production bundle and page behavior are reviewed for avoidable regressions.

## 6. Proposed quality commands

Add scripts only after the relevant tooling has been selected and configured. Expected command concepts:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm audit
```

Do not document a command as available until it exists in `package.json`. Record exact commands and actual results in each milestone report.

## 7. Release gate

A release candidate is not ready if:

- AQI methodology or data sufficiency tests fail.
- Any displayed data lacks adequate provenance or is falsely labelled current.
- Core user journeys fail.
- A critical or high security issue is unresolved.
- The production build fails.
- A secret is exposed or committed.
- Documentation materially misrepresents implemented behavior.
