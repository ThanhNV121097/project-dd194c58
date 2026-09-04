# Story — Build guest book API

## User story
As a Visitor, I want public API endpoints to validate, store, list, and count guest book entries, so that the page can show saved notes that survive restart.

## In scope
- `GET /health` returns `{"status":"ok"}`.
- `POST /entries` trims `name` and `note`, validates length rules, stores one row, and returns saved entry with `id` and `created_at`.
- `GET /entries` returns stored entries newest first.
- `GET /entries/count` returns total count.
- Entry data persists in PostgreSQL and remains after restart.
- Validation rejects blank or over-length `name` or `note` with a validation error.

## Out of scope
- Public page UI, form handling, list rendering, count display, and API error messaging in the browser.
- Accounts, login, moderation, editing, deletions, and payments.
- Mock UI controls or design changes.
- Any endpoint beyond the four API routes above.

## UI scope
No direct UI in this story. Backend-only work. Frontend stories will consume this contract.

## Acceptance criteria
1. Given API is running, when client calls `GET /health`, then response body is `{"status":"ok"}`.
2. Given valid `name` and `note` after trimming, when client calls `POST /entries`, then API stores trimmed values and returns saved entry with `id` and `created_at`.
3. Given stored entries exist, when client calls `GET /entries`, then entries return newest first.
4. Given stored rows exist, when client calls `GET /entries/count`, then response count matches stored rows.
5. Given a valid entry was stored, when service restarts, then entry is still available afterward.
6. Given `name` is blank after trimming or longer than 60 characters, when client calls `POST /entries`, then request fails with validation error.
7. Given `note` is blank after trimming or longer than 280 characters, when client calls `POST /entries`, then request fails with validation error.

## Dependencies
- PostgreSQL-backed storage and migrations.
- Guest book service contract for frontend and backend implementation.
- No external accounts or secrets required.
