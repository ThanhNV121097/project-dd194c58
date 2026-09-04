# Test Cases — Build guest book API

Risk: high. Backend writes durable data, so cases cover health, validation, persistence, ordering, error contract, and restart survival.

## Scenario: health endpoint reports service ready
**Given** Guest Book API is running and PostgreSQL is available.
**When** client sends `GET /health`.
**Then** response status is `200`, body is `{"status":"ok"}`, and response `Content-Type` is JSON.
**Trace**: GUESTBOOK-002 AC-1
**Check**: fetch_url

## Scenario: post entry stores trimmed values and returns saved row
**Given** Guest Book API is running with empty `guestbook_entries` table.
**When** client sends `POST /v1/entries` with JSON body `{"name":"  Ada  ","note":"  Lovely shop.  "}`.
**Then** response status is `201`, body returns an `id`, `created_at`, `name` equal to `Ada`, and `note` equal to `Lovely shop.`; stored row uses trimmed values, not padded values.
**Trace**: GUESTBOOK-002 AC-2
**Check**: fetch_url

## Scenario: post entry rejects blank name or note after trim
**Given** Guest Book API is running.
**When** client sends `POST /v1/entries` with JSON body `{"name":"   ","note":"Nice place."}`.
**Then** response status is `422`, body uses error envelope with `error.code` `VALIDATION_FAILED`, `details` includes `name` with detail code `REQUIRED`, and no row is stored.
**Trace**: GUESTBOOK-002 invalid input
**Check**: fetch_url

## Scenario: post entry rejects over-length trimmed input
**Given** Guest Book API is running.
**When** client sends `POST /v1/entries` with JSON body where `name` is 61 characters after trim.
**Then** response status is `422`, body uses error envelope with `error.code` `VALIDATION_FAILED`, `details` includes `name` with detail code `TOO_LONG`, and no row is stored.
**Trace**: GUESTBOOK-002 boundary
**Check**: fetch_url

## Scenario: post entry rejects malformed JSON and wrong content type
**Given** Guest Book API is running.
**When** client sends `POST /v1/entries` with malformed JSON or with non-JSON `Content-Type`.
**Then** response status is `400`, body uses error envelope with `error.code` `BAD_REQUEST`, and no row is stored.
**Trace**: service contract for malformed request handling
**Check**: fetch_url

## Scenario: list entries returns newest first
**Given** table contains three committed rows with distinct `created_at` values, newest row inserted last.
**When** client sends `GET /v1/entries`.
**Then** response status is `200`, body is `{ "data": [ ... ] }`, and first item is newest row with order `created_at DESC, id DESC`.
**Trace**: GUESTBOOK-002 AC-3
**Check**: fetch_url

## Scenario: list entries returns empty array when no rows exist
**Given** `guestbook_entries` table is empty.
**When** client sends `GET /v1/entries`.
**Then** response status is `200`, body is `{ "data": [] }`.
**Trace**: GUESTBOOK-002 AC-3
**Check**: fetch_url

## Scenario: count endpoint returns total rows
**Given** table contains 3 committed rows.
**When** client sends `GET /v1/entries/count`.
**Then** response status is `200`, body is `{"count":3}`.
**Trace**: GUESTBOOK-002 AC-4
**Check**: fetch_url

## Scenario: saved entry survives restart and remains visible
**Given** client has already created one entry through `POST /v1/entries`, backend process is restarted, and database volume remains intact.
**When** client sends `GET /v1/entries` and `GET /v1/entries/count` after restart.
**Then** response status is `200` for both requests, the saved entry is still present in `data`, and count includes that row.
**Trace**: GUESTBOOK-002 AC-5
**Check**: fetch_url

## Scenario: unavailable database returns service unavailable error
**Given** API is running and PostgreSQL is unreachable.
**When** client sends `GET /v1/entries`.
**Then** response status is `503`, body uses error envelope with `error.code` `UNAVAILABLE`, and body does not expose SQL, stack traces, file paths, or hostnames.
**Trace**: dependency failure handling
**Check**: fetch_url

## Scenario: read rate limit returns 429 with retry hint
**Given** anonymous read traffic has exceeded configured limit for the caller IP.
**When** client sends `GET /v1/entries/count`.
**Then** response status is `429`, body uses error envelope with `error.code` `RATE_LIMITED`, and response includes `Retry-After` header.
**Trace**: service contract rate limiting
**Check**: fetch_url
