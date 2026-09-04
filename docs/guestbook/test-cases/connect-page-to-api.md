# Test Cases — Connect page to API

Risk: high. Story wires user input to live persistence and refresh, so cases cover happy path, recovery, and live data display.

## Scenario: Page loads count and entries from API
**Given** API returns `GET /entries/count` with `{ "count": 2 }` and `GET /entries` with two stored entries newest first
**When** visitor opens guest book page
**Then** page shows count `2`, shows both entries from API, and shows newest entry first without hard-coded sample data
**Trace**: GUESTBOOK-001 AC-1, AC-2; GUESTBOOK-003 AC-1
**Check**: render_url

## Scenario: Signing book posts entry and refreshes list without reload
**Given** page is open, API is reachable, and current list shows older entries
**When** visitor types valid name and note, submits form, and API returns saved entry from `POST /entries` plus refreshed `GET /entries` and `GET /entries/count`
**Then** new entry appears at top of list, count increases by `1`, and visible list updates without manual page reload
**Trace**: GUESTBOOK-002 AC-2, AC-3, AC-4; GUESTBOOK-003 AC-2, AC-3
**Check**: interact_page

## Scenario: New entry stays after reload because API persisted it
**Given** visitor has just signed book and API stored entry in database
**When** visitor reloads page
**Then** refreshed page still shows same entry in list and same count from API
**Trace**: GUESTBOOK-002 AC-2, AC-4; GUESTBOOK-003 AC-1, AC-3
**Check**: render_url

## Scenario: API unreachable shows friendly failure message
**Given** page is open and API is unreachable
**When** page tries to load count or entries, or visitor submits form
**Then** page shows friendly API failure message and page remains usable
**Trace**: GUESTBOOK-003 AC-5
**Check**: render_url

## Scenario: Page data comes from API, not hard-coded
**Given** API returns a distinct count and distinct entry text not present in mock seed data
**When** visitor opens page
**Then** page shows only API-provided count and entries, not any fixed starter content
**Trace**: GUESTBOOK-001 AC-1, AC-2; GUESTBOOK-003 AC-1
**Check**: render_url

## Scenario: New entry appears newest first after submit
**Given** API has older entries already stored
**When** visitor submits a new valid entry
**Then** new entry is rendered before older entries
**Trace**: GUESTBOOK-003 AC-2
**Check**: interact_page
