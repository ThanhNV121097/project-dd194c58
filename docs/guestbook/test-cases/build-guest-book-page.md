# Test Cases — Build guest book page

Risk level: medium. Public page, no auth, no data writes in this story. Main risk is missing required visible UI, wrong order, or shipping excluded control.

## Acceptance coverage

### Scenario: Public sign form, count, and entry list visible
**Given** page loads on public visitor screen with approved guest book design
**When** visitor views page
**Then** sign form, visible visitor count, and entry list are shown in centered one-column layout with heading, name field, note field, submit button, and entry cards
**Check:** render_url

Trace: GUESTBOOK-001 AC-1, AC-2

### Scenario: Entry list shows newest first
**Given** API data includes at least two entries, one older and one newer
**When** visitor views entry list
**Then** newer entry appears before older entry
**Check:** render_url

Trace: GUESTBOOK-001 AC-2

### Scenario: Public page shows no login, account, moderation, payment, or API-issue control
**Given** page loads on public visitor screen with approved guest book design
**When** visitor views page
**Then** no login, account, moderation, payment, or API-issue control is shown
**Check:** render_url

Trace: GUESTBOOK-001 AC-3, plus shipped-scope exclusion for mock-only control

## Failure coverage

### Scenario: Friendly message shown when API cannot be reached
**Given** page tries to load or refresh data while API is unreachable
**When** visitor views page
**Then** friendly API failure message is shown instead of broken page
**Check:** render_url

Trace: GUESTBOOK-001 failure behavior; GUESTBOOK-003 AC-4

## Notes

- No manual cases. All checks are visible UI states.
- No permission-denial cases. Product has no accounts, login, moderation, or payments.
- No boundary cases beyond excluded control and public-only scope, because page story does not own validation or persistence.
