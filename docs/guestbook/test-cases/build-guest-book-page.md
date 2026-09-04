# Test Cases — Build guest book page

Risk level: medium. Public UI writes no auth, no payments, but it must preserve user input, show newest-first data, and handle API failure state.

## Scenario: Centered welcoming page shows sign form, count, and entry list
**Given** guest book page opens with mock data available
**When** page finishes loading
**Then** one centered column shows serif heading, sign form, visible visitor count, and entry list cards; no hard-coded placeholder text appears outside mock-driven content
**Check:** render_url

## Scenario: Page uses API-driven data for count and entries it displays
**Given** mock API returns count 3 and 3 entries in newest-first order
**When** page finishes loading
**Then** visible visitor count is 3 and list shows those 3 entries in same newest-first order; none of entries are hard-coded in page source
**Check:** render_url

## Scenario: Signing form submits name and note and adds new entry at top of list
**Given** page shows existing entries and form inputs are empty
**When** visitor types valid name and note, submits form, and mock API returns saved entry
**Then** new entry appears at top of list without manual reload, form clears or resets after success, and count increases by 1
**Check:** interact_page

## Scenario: List stays newest-first after a new submission
**Given** page already shows at least 2 existing entries in newest-first order
**When** visitor submits a new entry and mock API returns it with newest timestamp
**Then** new entry is shown before older entries, and order of previous entries stays newest-first below it
**Check:** interact_page

## Scenario: Friendly message appears when API cannot be reached
**Given** page cannot reach mock API for load or submit
**When** page tries to fetch count or entries, or submit form
**Then** visible friendly message explains API is unavailable, page remains usable, and existing typed name and note stay in form
**Check:** interact_page

## Scenario: Warm design tokens are applied
**Given** page is rendered
**When** computed styles are inspected
**Then** background is off-white paper, primary accent is deep green, body text is dark readable, page is centered in one column, and new entry animation is limited to fade-in only
**Check:** measure_styles

## Scenario: Empty or failing state still renders page shell
**Given** mock API returns no entries or fails on initial load
**When** page finishes loading
**Then** form, count area, and page shell still render, and entries area shows either empty state or friendly failure state instead of breaking
**Check:** render_url
