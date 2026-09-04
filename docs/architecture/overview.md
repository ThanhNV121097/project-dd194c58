# Architecture — Guest Book

## Shape and stack

- Shape: fullstack. Ships `code/frontend/`, `code/backend/`, PostgreSQL.
- Frontend: Next.js 15 App Router, TypeScript, Tailwind v3, ESLint.
- Backend: Go 1.22+ HTTP API, PostgreSQL driver, self-applied SQL migrations.
- Runtime: `docker compose --profile local up` from repo root boots Postgres, backend, frontend.
- CI gate: `.github/workflows/ci.yml` runs Go build/vet/test, frontend install/lint/build/test, and CSS token checks.

## Folder ownership

| Path | Owner | Purpose |
|---|---|---|
| `docs/guestbook/SRS.md` | PM | Approved requirements |
| `docs/architecture/overview.md` | TL | Shared stack and conventions |
| `code/backend/cmd/api/` | Dev | API entrypoint and handlers |
| `code/backend/migrations/` | TL/Dev | Ordered `.up.sql` / `.down.sql` schema migrations |
| `code/frontend/app/page.tsx` | TL + story mount only | Server Component composition root |
| `code/frontend/app/globals.css` | TL | Frozen shared tokens and base styles |
| `code/frontend/components/` | Dev | One default-export component per story |
| `code/frontend/lib/mock/` | Dev | Temporary UI fixtures, removed when API connects |

## Backend contract

- Read `DATABASE_URL` from env; do not assemble DSN from separate DB vars.
- Read `PORT`, fallback to `APP_PORT`, then `8080`.
- Apply every pending migration before serving traffic.
- `/healthz` returns 200 only after migrations succeeded and `SELECT 1` works.
- Product endpoints come later: `GET /health`, `POST /entries`, `GET /entries`, `GET /entries/count`.
- Validation belongs at API boundary: trim `name` and `note`, enforce `name` 1-60 and `note` 1-280.

## Frontend contract

- `app/page.tsx` stays a Server Component and only composes story components.
- Any component using state, effects, events, refs, or browser APIs starts with literal first line `"use client"`.
- Components use `export default function ComponentName()`.
- No hardcoded visual values in CSS modules; use tokens from `app/globals.css`.
- API wiring uses env: browser code reads `NEXT_PUBLIC_API_URL`; server code reads `API_ORIGIN`.

## Env vars

| Service | Key | Required | Notes |
|---|---|---|---|
| backend | `DATABASE_URL` | yes | PostgreSQL URL injected by runtime or compose |
| backend | `PORT` | yes | HTTP port, default `8080` |
| backend | `APP_PORT` | no | Secondary fallback for platform compatibility |
| frontend | `NEXT_PUBLIC_API_URL` | yes | Browser-visible API base URL |
| frontend | `API_ORIGIN` | yes | Container/server-side API base URL |
| root compose | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | local only | Local Postgres setup |

## Design tokens

- Source: `design/design-system.md`, extracted from approved `design/index.html`.
- Colors: off-white paper `#F7F3EA`, green `#24533D`, dark text `#1F2933`, line `#E7DDCF`, accent `#C9B38C`.
- `globals.css` defines color, spacing, typography, radius, border, shadow, motion.
- Motion is limited to entry fade-in and respects `prefers-reduced-motion`.

## Decisions

| Decision | Kept | Rejected | Tradeoff |
|---|---|---|---|
| Self-migrating backend | Boot applies SQL migrations | Manual DB setup | More startup code, fewer broken deploys |
| App Router Server root | Thin `page.tsx` | Client page with form logic | Fewer story conflicts, stricter client boundaries |
| CSS tokens only | Shared values in `globals.css` | Per-story hardcoded CSS | More up-front tokens, consistent UI and CI checks |
| Anonymous public API | No auth layer | Accounts or moderation scaffold | Less code and attack surface; add auth only if scope changes |

## Run

1. Copy `.env.example` to `.env` for local overrides if needed.
2. Run `docker compose --profile local up --build`.
3. Open frontend at `http://localhost:3000`.
4. Backend health: `http://localhost:8080/healthz`.

## Risks and unknowns

- Product API schema and endpoint details are finalized in ERD/service design tasks, not here.
- No moderation means abusive entries can be stored; stakeholder explicitly excluded moderation.
- Local compose profile includes Postgres; deployed runtime injects its own `DATABASE_URL`.
