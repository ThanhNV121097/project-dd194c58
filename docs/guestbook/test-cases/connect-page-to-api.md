# Test Cases — Connect page to API

Risk: medium. Public UI writes data, must keep list/count live, and must fail friendly on API outage. Coverage focuses on visible API-backed behavior, write refresh, persistence after reload, and failure state.

## Cases

### Scenario: Page loads from API data
**Given**: API returns count and entry list data, and page is opened with no cached hard-coded entries
**When**: visitor loads page
**Then**: every visible item on page is sourced from API response, including form-connected count and list entries; no visible content depends on hard-coded page data
**Check**: render_url

### Scenario: Submit valid entry and show it at top without reload
**Given**: page is connected to API, and API accepts a valid name and note
**When**: visitor enters valid name and note, then submits form
**Then**: API receives POST, saved entry appears at top of entry list without manual reload, and list remains newest-first with submitted entry visible first
**Check**: interact_page

### Scenario: Count stays synced after submit
**Given**: page is connected to API, count is visible, and API count increases after save
**When**: visitor submits valid entry through form
**Then**: visible count updates to match API count after save and stays visible on page
**Check**: interact_page

### Scenario: Friendly failure message on API outage
**Given**: API cannot be reached when page loads or when form submits
**When**: visitor loads page or submits form
**Then**: friendly failure message appears, page does not crash, and existing typed input is not lost
**Check**: interact_page

### Scenario: Saved entry persists after reload
**Given**: a valid entry was already saved in database through API
**When**: visitor reloads page and opens it again
**Then**: saved entry still appears in list because page loads it from API-backed data, not from in-memory state
**Check**: render_url

### Scenario: Invalid input stays blocked by browser and API validation
**Given**: page is connected to API
**When**: visitor submits invalid name or note
**Then**: entry is not saved, and page keeps form usable without navigating away
**Check**: interact_page
