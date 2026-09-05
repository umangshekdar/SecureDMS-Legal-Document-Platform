# SecureDMS

SecureDMS is a Smart India Hackathon prototype for secure, intelligent, traceable, and verifiable legal and investigative document management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/secure-dms run dev` — run the SecureDMS web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/secure-dms/src/App.tsx` — frontend routes, shell, and demo interactions
- `artifacts/secure-dms/src/index.css` — SecureDMS visual system and responsive styles
- `artifacts/api-server/src/routes/securedms.ts` — prototype API and seeded demo data
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/src/generated/` — generated React Query hooks

## Architecture decisions

- The first build uses an in-memory API seed so the hackathon demo starts populated without requiring a production data service.
- Integrity verification is deterministic SHA-256 over demo metadata and supports a real stateful tamper simulation.
- AI/OCR output is clearly simulated and structured behind API fields that can later be replaced by OCR/LLM services.
- Government ecosystem references are positioning-only; no CCTNS, ICJS, eSakshya, DEMS, or e-Courts integration is implemented.

## Product

The product provides prototype role-aware login, case management, document upload processing, SHA-256 integrity verification, tamper alerts, immutable version history, digital signature simulation, searchable OCR text, append-only audit logs, security analytics, and demo user management.

## User preferences

The requested experience is a credible government/legal-tech dashboard for SIH demonstration, not a generic startup dashboard.

## Gotchas

- Demo authentication is intentionally local and should not be presented as production identity management.
- The upload endpoint accepts metadata JSON for the prototype; it does not persist raw file bytes.
- API routes are mounted below `/api` and the web artifact is served at `/`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
