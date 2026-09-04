# Story — Connect page to API

## User story
As a Visitor, I want guest book page to load data from live API and refresh after submit, so that page behaves like real guest book and saved entries persist after reload.

## In scope
- Load visible count and entry list from API, not hard-coded data.
- Submit trimmed name and note through page form to live API.
- Refresh entry list after successful submit so newest entry appears at top without manual reload.
- Keep visible visitor count in sync with API after load and after submit.
- Show friendly failure message when API cannot be reached on load or submit.

## Out of scope
- API validation rules, storage, persistence, and endpoint behaviour; covered by `Build guest book API`.
- Visual redesign, motion changes, or layout changes beyond approved mockup.
- Accounts, login, moderation, deletions, edits, and payments.
- Any mock-only debug control; it must not ship.

## UI scope
- Single public guest book page in approved centered one-column layout.
- Touches form, count display, entry list, success refresh state, and API-failure notice state.
- List item fade-in for new entry stays as approved design, with no extra motion.

## Acceptance criteria
1. Given API is reachable, when visitor opens page, then count and entries come from API responses and no hard-coded guest book content appears.
2. Given valid name and note, when visitor submits form, then page posts to API and new entry appears at top of list without reload.
3. Given valid submit completes, when page updates, then visible count matches API count data.
4. Given API cannot be reached, when page loads or submit runs, then friendly failure message appears and page does not crash.
5. Given an entry was saved, when visitor reloads page, then saved entry still appears because it came from database-backed API data.

## Dependencies
- `Build guest book page` must land first.
- `Build guest book API` must land first.
- Live API base URL env wiring must exist for frontend runtime.
- Existing approved design and design system stay unchanged.
