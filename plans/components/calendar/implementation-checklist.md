# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Calendar, `tp-calendar`
- Requested work / claim: bounded change — the Calendar fills a wider inline size, and writing `value` brings the selection into view (user requests 2026-11-11); this record does not certify the rest of the component
- Scope source: user: "Cant this component adapt to occupy the width?", "if the picker day is selected on a different month clicking on a preset should reset the view to that day. This all needs to be in the component", "fix the height on due date so calendar has normal space"
- In-scope changes and existing gaps: fill sizing (columns grow, rows and days keep the cell size), value-write reveal; the docs Presets and Date and time compositions rebuilt on them; older behavior untouched and not re-verified
- Repository baseline / unrelated changes: development after 201c71c0 with uncommitted docs work in the same tree, preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, Component Library doc_8077bf7c…, section `ucl17-calendar`; amendment committed f24236f4 (0.58.1), bump to 0.59.0
- Owning contracts / dependencies / vocabulary: §17.1 Calendar (`calfill-q1`, `calreveal-q1`); Foundation `req-f-calendar-state` (controlled displayed month) unchanged
- Local reference evidence: `../specification/external/ui/apps/v4/registry/bases/base/ui/calendar.tsx` (root `w-fit`, `w-full` stretches the month and its `flex-1` weekdays), `.../blocks/preview-02/cards/upcoming-payments.tsx` (full-width calendar); `examples/base/calendar-presets.tsx` moves the month by hand on every preset press
- Tool readiness: Spec Blocks MCP and Chrome DevTools MCP available
- Browser / server / build under test: Chrome via DevTools MCP, Storybook dev server (source)
- Evidence directory: `tmp/component-verification/calendar/`
- Durable verification fixtures / served URLs: Calendar Docs page `?path=/docs/components-calendar--docs`
- Evidence availability to the next agent: local only

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | A wider inline size is shared by the months and their columns; rows keep the cell height and days the cell size; without one the calendar keeps its natural size | `calfill-q1` | reference `w-full` + `flex-1` weekdays | `styles.ts`: `.month` flex, `minmax(cell, 1fr)` columns, `.day-cell` cell height, centered `.day` | ### Presets, ### Date and time | V-01, V-02 | passed | measured cells 44×28, days 28×28; natural calendars unchanged |
| C-02 | A range interior spans its whole column, so the band stays continuous | `calfill-q1` | range backing rules `recipes/calendar.ts` | `.day-cell[data-range-middle] .day { inline-size: 100% }` | none | V-02 | passed | Stay range stretched to 640 px |
| C-03 | Writing `value`, including the committed value again, brings the selection into view through the cancelable displayed-month proposal | `calreveal-q1` | reference presets set the month by hand | `value` setter marks the write; `willUpdate` → `#revealSelection` → `#requestDisplayedMonth` | ### Presets | V-03 | passed | real clicks: May shown, Today pressed again → February |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | §17.1 said nothing about wider sizes or value writes | docs | add `calfill-q1` and `calreveal-q1` | Spec Blocks 0.59.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged; structural CSS and one private method
- Supported exports / registration / constituent API impact: none; no new property
- Framework bindings: `npm run cem` regenerated, 0 files changed
- Public vocabulary / tokens / parts / presentation review: `--tp-calendar-cell-size` keeps its meaning (day size and row height)

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Month navigation | reference `onMonthChange` | `#requestDisplayedMonth` | reused for the reveal, so controlled months accept or reject it | Presets example; V-03 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Week and weekday columns | reference `flex-1` weekdays, `w-full` days | `.weekdays`, `.week` | `src/components/calendar/styles.ts` | columns grow; days keep the cell size instead of growing square (user: normal height) | V-01 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Docs ### Presets | quick picks row | Toggle group in a horizontal Scroll area with `scroll-edge-fade`, Card | V-03, V-04 | none |
| Docs ### Date and time | times, submit | Form, Field, Input `type="time"`, Button, Card | V-05 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01; layout | every Calendar on the Docs page, the popover Calendar | cards fill; others keep natural size | cards 326 px wide, cells 44×28, days 28×28; others 212 px, 28×28, heights 254 unchanged; popover 212 px | DevTools evaluate, `due-normal-height.png`, `schedule-fill.png` | passed | Date of birth cells 30 px: its dropdown caption is wider than seven cells |
| V-02 | C-02; visual | Stay range calendar stretched to 640 px | continuous band, endpoint squares | as expected | `range-wide.png` | passed | Observed values recorded in Actual result |
| V-03 | C-03; real input | Today pressed, next month ×3, Today pressed again | February shown, Today still pressed | month 2026-05-01 → 2026-02-01, value 2026-02-12 | DevTools click, `due-reveal.png` | passed | Observed values recorded in Actual result |
| V-04 | C-01, C-03; visual | Presets card dark and light, keyboard Tab and arrows in the picks row | row scrolls with edge fades, focus ring whole, track only while scrolling | as expected | `due-row-focus3.png`, `due-row-scrolling.png`, `light-cards.png` | passed | Observed values recorded in Actual result |
| V-05 | C-01; real input | Schedule a call: end before start, Schedule, valid end, Schedule | error and focus on Ends, then "Booked: …" with no size change | as expected; card 352×481 before and after | DevTools type_text, press_key, `schedule-call-invalid.png` | passed | Observed values recorded in Actual result |
| V-06 | C-01, C-02, C-03; docs and suite | `check-docs.mjs components/calendar`; vitest | pass | pass; 6310 tests | node | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | the docs examples dropped their own month writes |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | natural-size calendars unchanged (V-01) |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | fill with ranges, dropdown captions and two months (V-01, V-02) |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec 0.59.0; bounded change from the user requests |
| 1. Capability mapping                 | passed | C-01..C-03 |
| 2. Architecture and composition reuse | passed | displayed-month proposal reused |
| 3. Behavior                           | passed | V-03, V-05 |
| 4. Presentation and customization     | passed | V-01, V-02 |
| 5. Accessibility                      | passed | grid semantics unchanged; keyboard Tab and arrows in V-04 |
| 6. Visual and interaction inspection  | passed | V-01..V-05, dark and light |
| 7. Documentation and demo reuse       | passed | V-06 |
| 8. Regression and reconciliation      | passed | full suite, popover Calendar |

## Documentation synchronization

- [x] `docs/components/calendar.mdx` Presets and Date and time; ledger forced-edit rows; `check-docs.mjs components/calendar` passes.
- [x] JSDoc unchanged; no new API.
- [x] `elementDependencies` unchanged.
- [x] Verification on the Docs page; no separate fixture.
- [x] Previews reuse Card, Toggle group, Scroll area, Form, Field, Input and Button.
- [x] Preview code uses package registration only.

## Completion / handoff

- Change summary: fill sizing and value-write reveal
- Actual delivery claim: both behaviors and the rebuilt docs examples, verified in Chrome (dark, light)
- Record checker: `check-gates.mjs --stage verify`
- Non-browser checks: vitest, typecheck
- Behavior: V-03, V-05
- Accessibility: unchanged semantics; axe not run
- Visual/customization/motion inspection: V-01, V-02, V-04
- Documentation and demo composition reuse: V-06
- Shared-consumer regressions / package boundaries: popover Calendar and every Docs Calendar measured
- Required failures or blocked checks: none
- Older out-of-scope gaps: the component had no record before; its other capabilities are not re-verified here
- Changed source revisions / reopened gates: none
