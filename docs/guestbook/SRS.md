# SRS — Guest Book

Module: `guestbook`
Design: [View the approved design](http://localhost:8080/design/dd194c58-2a14-4fbd-9edc-83d5736476e4)
Design system: `design/design-system.md`

> One file per module, at `docs/guestbook/SRS.md`. It covers only the functions that belong to this module. Never write `docs/SRS.md`.

## 1. Purpose

Guest Book lets any visitor leave a name and short note, then read earlier notes in newest-first order. The module must keep entries after restart, because the product is a real guest book, not a temporary page.

## 2. Actors

| Actor | Who they are | What they may do in this module |
|---|---|---|
| Visitor | Any person using the public page | View the count and entry list, submit a new entry, see friendly API failure messaging |
| API | Backend service used by the page | Store, return, and count entries |

## 3. Scope

**In scope** — the functions specified below, by their plan titles:

- Build guest book page
- Build guest book API
- Connect page to API

**Out of scope** — name what a reader would reasonably expect here and say where it lives instead.

- Accounts, login, moderation, and payments — deliberately not built for this product.
- Admin controls, deletions, and editing — deliberately not built for this product.
- Mock-only "Simulate API issue" control — appears in approved design as test-only UI, but stakeholder said it must not ship.
- Design changes beyond the approved mockup — belongs to the design process, not this SRS.

## 4. Functional requirements

### 4.1 Build guest book page

**Requirement GUESTBOOK-001 — Public form, count, and list**

*As a* Visitor, *I want to* see a public guest book page with a sign form, a visible visitor count, and a newest-first entry list, *so that* I can read prior notes and leave my own.

Behaviour:

1. Visitor opens page and sees centered one-column layout with a sign form, a visible count, and an entry list.
2. Visitor sees heading, name field, note field, submit button, count, and entry cards as shown in approved design.
3. Page shows content for public reading without sign-in or moderation controls.
4. Page does not show the mock-only "Simulate API issue" control in shipped product.

**Acceptance criteria** — each maps one-to-one onto a test case in `docs/guestbook/test-cases/build-guest-book-page.md`.

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | page loads | visitor views page | sign form, count, and entry list are visible |
| AC-2 | page loads | visitor views entry list | entries appear newest first |
| AC-3 | page loads | visitor views page | no login, account, moderation, payment, or API-issue control is shown |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Not applicable | No roles beyond public visitor | No permission gate; page is public |
| Not applicable | No empty-state variant is shown in approved design | Page uses default screen only |
| Not applicable | Mock-only "Simulate API issue" control was shown in design but stakeholder excluded it from shipping scope | Control is omitted from shipped product |
| API unavailable | Backend cannot be reached | Friendly message is shown instead of a broken page |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| name | text | yes | Displayed from entry data, trimmed value only |
| note | text | yes | Displayed from entry data, trimmed value only |
| created_at | datetime | yes | Displayed as entry date |
| count | number | yes | Displayed as total visitor count |

### 4.2 Build guest book API

**Requirement GUESTBOOK-002 — Store and return entries**

*As the* API, *I want to* validate, store, list, and count guest book entries, *so that* the page can show saved notes that survive restart.

Behaviour:

1. API answers health check with ok status.
2. API accepts name and note only when both are present after trimming and within length limits.
3. API stores trimmed values and returns the saved entry with its id and created_at.
4. API returns stored entries newest first.
5. API returns total count of stored entries.
6. Stored entries remain available after service restart.

**Acceptance criteria** — each maps one-to-one onto a test case in `docs/guestbook/test-cases/build-guest-book-api.md`.

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | API is running | client checks health | response body is `{"status":"ok"}` |
| AC-2 | name and note trim to valid lengths | client creates entry | entry is stored and returned with id and created_at |
| AC-3 | stored entries exist | client lists entries | entries come back newest first |
| AC-4 | stored entries exist | client requests count | count matches stored rows |
| AC-5 | valid entry was stored | service restarts | entry is still available afterward |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Invalid input | name is blank after trimming | request fails with validation error |
| Invalid input | note is blank after trimming | request fails with validation error |
| Boundary | name exceeds 60 characters after trimming | request fails with validation error |
| Boundary | note exceeds 280 characters after trimming | request fails with validation error |
| Boundary | name or note has surrounding spaces | stored value is trimmed |
| Not applicable | No roles or permissions exist | No permission behaviour |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| id | integer | yes | Unique per stored entry |
| name | text | yes | 1-60 characters after trimming |
| note | text | yes | 1-280 characters after trimming |
| created_at | datetime | yes | Set when entry is stored |

### 4.3 Connect page to API

**Requirement GUESTBOOK-003 — Live API-backed updates**

*As a* Visitor, *I want to* submit the form against the live API and see the list refresh without reload, *so that* the page behaves like a real guest book.

Behaviour:

1. Visitor opens page and all visible content is loaded from the API, not hard-coded in the page.
2. Visitor submits valid name and note through the page form.
3. Page sends the entry to the API and waits for the saved record.
4. Page updates entry list so new entry appears at the top without manual reload.
5. Page keeps visitor count visible and in sync with API data after submit and after reload.
6. Page shows friendly failure message when API cannot be reached.

**Acceptance criteria** — each maps one-to-one onto a test case in `docs/guestbook/test-cases/connect-page-to-api.md`.

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | page is connected to API | visitor loads page | every visible item comes from API responses |
| AC-2 | page is connected to API | visitor submits valid form | entry appears at top of list without reload |
| AC-3 | page is connected to API | visitor submits valid form | visible count stays synced with API count |
| AC-4 | API cannot be reached | visitor submits form or page loads data | friendly failure message appears |
| AC-5 | page reloads after a saved entry exists | visitor opens page again | saved entry still appears because it came from the database |

**Failure, boundary and permission behaviour**

| Case | Condition | Expected behaviour |
|---|---|---|
| Upstream failure | API is unreachable | Friendly message is shown; page does not crash |
| Invalid input | Visitor leaves name or note invalid | Browser and API validation keep entry from being saved |
| Not applicable | No sign-in or role checks exist | No permission behaviour |

**Data touched**

| Field | Type | Required | Rule |
|---|---|---|---|
| name | text | yes | Sent trimmed to API |
| note | text | yes | Sent trimmed to API |
| count | number | yes | Displayed from API count data |
| created_at | datetime | yes | Shown for saved entries returned by API |

## 5. Screens

The approved design shows one public screen with one state.

| Screen | Section in the design | Functions it serves | States that must exist |
|---|---|---|---|
| Guest book page | Main page, sign form, latest notes, API state | GUESTBOOK-001, GUESTBOOK-003 | default |

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Submitting a valid entry and refreshing the list completes within 2s at 95th percentile on a 1 Mbps connection after first load |
| Accessibility | Form fields have labels, keyboard focus is visible, and text contrast meets at least 4.5:1 |
| Responsive | Page fits at 320px width with no horizontal scroll |
| Persistence | Stored entries remain available after service restart |

## 7. Dependencies and assumptions

- **Depends on:** PostgreSQL-backed storage, for entry persistence.
- **Depends on:** Guest Book API, for live page data.
- **Assumption:** Public traffic is anonymous and no moderation workflow is required; if that changes, new scope and permissions are needed.

| Open question | Proposed default | Who decides |
|---|---|---|
| None | Not applicable | Stakeholder |

## 8. Traceability

| Plan item | Requirement ids | Test cases |
|---|---|---|
| Build guest book page | GUESTBOOK-001 | `test-cases/build-guest-book-page.md` |
| Build guest book API | GUESTBOOK-002 | `test-cases/build-guest-book-api.md` |
| Connect page to API | GUESTBOOK-003 | `test-cases/connect-page-to-api.md` |