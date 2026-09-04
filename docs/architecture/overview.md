# Architecture Overview — Guest Book

## Shape and stack

Guest Book is fullstack: Next.js UI, Go HTTP API, PostgreSQL database. Entries must survive restart, so persistence is not optional.

| Part | Choice | Why | Rejected alternative |
|---|---|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind v3 | Matches repository Dockerfile and gives one-page UI with typed components | Static HTML: cannot call API cleanly or share build gate |
| Backend | Go 1.22+ service under `code/backend/cmd/api` | Small stdlib HTTP server, one deployable binary | Node API: second runtime and conflicts with fixed Go Dockerfile |
| Database | PostgreSQL | Required durable entries and compose already provides it | In-memory storage: fails restart requirement |
| Styling | CSS variables in `app/globals.css` plus Tailwind | Enforces approved tokens and CI token checks | Per-component hardcoded values: causes drift and CI failures |

## Repository layout

```text
docs/guestbook/SRS.md

docs/architecture/overview.md
code/backend/
  cmd/api/main.go
  internal/migrations/migrations.go
  internal/migrations/sql/*.up.sql
  internal/migrations/sql/*.down.sql
  .env.example
code/frontend/
  app/layout.tsx
  app/page.tsx
  app/globals.css
  components/
  lib/mock/
  .env.example
```

`code/backend/Dockerfile`, `code/frontend/Dockerfile`, `docker-compose.yml`, and `.github/workflows/ci.yml` are fixed scaffold files. Do not edit them for feature work.

## Backend foundation

- `cmd/api/main.go` owns process startup only: read env, connect DB, apply migrations, expose health.
- Health route is `/healthz` for compose and returns `200` only after migrations pass and `SELECT 1` succeeds.
- Product API will add `/health`, `/entries`, and `/entries/count` in story work; scaffold does not implement feature endpoints.
- Migrations are embedded from `internal/migrations/sql`, sorted by filename, and tracked in `schema_migrations`.
- Use `DATABASE_URL` only. Do not assemble DSNs from `DB_*` parts.
- Use parameterized SQL for every future entry query. No string-built SQL with user input.

## Frontend foundation

- `app/page.tsx` is a Server Component composition root. Story components add imports plus elements there.
- Components that use hooks, event handlers, or browser APIs must begin with first line `"use client"`.
- Shared visual values live in `app/globals.css`: colour, spacing, typography, radius, shadow, and motion tokens.
- Story CSS modules may use tokens only. No hex values, px spacing, or token fallbacks.
- API URL contract: browser code reads `NEXT_PUBLIC_API_URL`; server-side frontend code reads `API_ORIGIN`.

## Environment variables

Backend `.env.example`:

| Key | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string injected by runtime |
| `PORT` | yes | HTTP listen port, default `8080` |
| `APP_PORT` | no | Legacy fallback if `PORT` missing |

Frontend `.env.example`:

| Key | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Browser-visible API origin, local default `http://localhost:8080` |
| `API_ORIGIN` | yes | Server-side API origin inside compose, local default `http://backend:8080` |

Root `.env.example` documents compose-only database and port values.

## Run and verify

```bash
cp .env.example .env
docker compose --profile local up --build
```

Local URLs: frontend `http://localhost:3000`, backend health `http://localhost:8080/healthz`.

CI gate in `.github/workflows/ci.yml` runs `go build ./...`, `go vet ./...`, `go test ./...`, `npm ci`, `npm run lint`, `npm run build`, `npm test --if-present`, and CSS token checks.

## Naming conventions

- Go packages: short lowercase names; entry point stays `cmd/api`.
- Migration names: UTC timestamp prefix plus action, e.g. `20250814000000_bootstrap.up.sql`.
- React components: PascalCase, default export function declarations only.
- Story mocks: `code/frontend/lib/mock/{story-slug}.ts`, deleted when live API replaces them.
- Env vars: `UPPER_SNAKE_CASE`; tracked examples contain comments and no secrets.

## Risks and constraints

- Compose starts empty DB; self-migration on backend boot is required.
- `/healthz` must prove DB readiness, not process liveness only.
- App Router server/client boundary is strict; keep `page.tsx` event-free.
- Approved design has mock-only API issue control; shipped UI must omit it per SRS.
