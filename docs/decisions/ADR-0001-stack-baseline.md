# ADR-0001: Proposed Initial Technology Stack

- **Status:** Proposed; approval and compatibility validation pending
- **Date:** 2026-11-17

## Context

The project is a greenfield, AI-assisted web application for an engineering-evaluated challenge. It requires an interactive dashboard, server-side integrations with environmental data providers, a secure server-side AI adapter, automated testing, and maintainable documentation. The first release should avoid unnecessary services and operational complexity.

## Proposed decision

Use a modular monolith with this baseline:

| Concern | Proposed technology | Rationale |
|---|---|---|
| Web framework | Next.js App Router | Integrated routing, server rendering, and server-side route handlers |
| UI | React + TypeScript strict mode | Component model and static type checking |
| Styling | Tailwind CSS | Consistent utility-based styling and responsive design |
| Accessible primitives | Radix UI / shadcn/ui where appropriate | Reusable accessible interaction primitives; verify each component's accessibility needs |
| Charts | Recharts | React-oriented charts for time-series and pollutant views |
| Validation | Zod | Runtime validation for untrusted request/provider/model data |
| Database | PostgreSQL, if persistence is justified | Relational storage for stations, observations, and history |
| ORM | Prisma, subject to compatibility review | Typed schema and migration workflow |
| Package manager | pnpm | Reproducible dependency management via lockfile |
| Unit/component tests | Vitest + React Testing Library | Fast logic and component verification |
| E2E tests | Playwright | Browser journey validation |

LLM provider remains an adapter choice. Do not select or commit to a paid model/service until the challenge requirements, budget, data handling terms, and credentials are understood.

## Alternatives considered

- **Separate FastAPI/Python backend:** valuable if substantial Python ML work is proven necessary, but it adds deployment and API complexity before such a need is established.
- **Microservices:** rejected for initial scope because separate deployment, networking, observability, and data consistency are not justified yet.
- **Client-only app:** rejected because provider/LLM secrets must remain server-side and external integrations need controlled server validation.
- **No database initially:** remains a viable option if the first milestone only needs provider reads and bounded caching. Database introduction requires a concrete history/persistence use case.

## Consequences

Positive:

- One primary application and deployment unit.
- Strong boundary between client UI and server-only integrations.
- Shared TypeScript contracts across app layers.
- Straightforward automated test strategy.

Trade-offs:

- Next.js server runtime and deployment behavior must be understood.
- React charting may need performance care for large histories.
- PostgreSQL/Prisma add setup/migration work and should be introduced only when persistence is needed.
- TypeScript does not replace runtime validation of external data.

## Validation required before dependency installation

- Check the challenge's mandated technology stack and scoring criteria.
- Verify the current supported Node.js LTS and compatible versions from official framework/package documentation.
- Verify Next.js, React, Prisma, Tailwind, Radix/shadcn, testing library, and Playwright compatibility.
- Verify intended deployment supports required Next.js server features.
- Confirm whether PostgreSQL is required for the MVP.
- Record any change in a new ADR rather than silently changing the stack.
