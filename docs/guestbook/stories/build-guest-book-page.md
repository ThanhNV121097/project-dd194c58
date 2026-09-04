# Story — Build guest book page

## User story
As a Visitor, I want a public guest book page with a sign form, a visible visitor count, and a newest-first entry list, so that I can read prior notes and leave my own.

## In scope
- One public page for Guest Book.
- Centered one-column layout from approved design.
- Sign form with name and note fields plus submit action.
- Visible visitor count.
- Entry list rendered newest first.
- Friendly API-unavailable message state.
- No hardcoded entry content in the shipped UI; page state is driven by data passed into the component/mock for this story slice.

## Out of scope
- Backend API and database persistence.
- Live network wiring to the API.
- Accounts, login, moderation, editing, deletions, and payments.
- Mock-only "Simulate API issue" control.
- Any design changes beyond approved mockup.

## UI scope
- Main Guest Book page only.
- Default screen shown in approved design: warm paper background, centered column, serif heading, clean sans body, simple entry cards, and light fade-in for new entries.
- States covered here: normal page and API-unavailable notice shell.
- No extra screens, no modal, no admin UI.

## Acceptance criteria
1. Given page data is available, when visitor opens page, then sign form, visitor count, and entry list are visible in centered one-column layout.
2. Given entry data contains multiple items, when visitor views list, then entries render newest first.
3. Given page renders, when visitor views it, then no login, account, moderation, payment, or API-issue control is shown.
4. Given API data is unavailable for this slice, when page shows failure state, then a friendly message appears instead of broken UI.

## Dependencies
- Approved design and design system.
- Guest Book API story for live data and persistence.
- Backend persistence layer for future live entries.
- No external accounts or credentials.
