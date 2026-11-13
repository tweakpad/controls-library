# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Calendar, `tp-calendar`
- Requested work / claim: bounded changes — the Calendar fills a wider inline size, and writing `value` brings the selection into view (user requests 2026-11-11); the `strip` variant, a reduced day picker (user request 2026-11-12); this record does not certify the rest of the component
- Scope source: user (2026-11-12): "We want to extend our calendar variants to present a reduced day picker … use our current design system", with a mock of a month caption over five days; decisions: a variant, day arrows shift one day (`paged-navigation` a page), caption = middle day's month, no own surfaces. Earlier: "Cant this component adapt to occupy the width?", "if the picker day is selected on a different month clicking on a preset should reset the view to that day. This all needs to be in the component", "fix the height on due date so calendar has normal space"
- In-scope changes and existing gaps: fill sizing (columns grow, rows and days keep the cell size), value-write reveal; the docs Presets and Date and time compositions rebuilt on them; older behavior untouched and not re-verified
- Repository baseline / unrelated changes: development after 201c71c0 with uncommitted docs work in the same tree, preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, Component Library doc_8077bf7c…, section `ucl17-calendar`; amendment committed f24236f4 (0.58.1), bump to 0.59.0; strip amendment 0.65.41 (1e26572b), no bump
- Owning contracts / dependencies / vocabulary: §17.1 Calendar (`calfill-q1`, `calreveal-q1`); Foundation `req-f-calendar-state` (controlled displayed month) unchanged
- Local reference evidence: no reference under `../specification/external/` has a day strip (searched ui, base-ui, research); the strip is designed here and recorded in §17.1. Earlier: `../specification/external/ui/apps/v4/registry/bases/base/ui/calendar.tsx` (root `w-fit`, `w-full` stretches the month and its `flex-1` weekdays), `.../blocks/preview-02/cards/upcoming-payments.tsx` (full-width calendar); `examples/base/calendar-presets.tsx` moves the month by hand on every preset press
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
| C-04 | `variant="strip"`: `visible-days` (5) consecutive days, a weekday over the number, centered on a middle day that is always in the displayed month; caption, `displayedMonth` and its event name that month | `calstrip-q1`..`q10` | none (designed) | `#renderStrip`, `#syncStripAnchor`, `policy.ts` `calendarStripDates`/`calendarStripStart`/`calendarStripAnchorInMonth` | ### Day strip | V-07, V-08 | passed | policy tests; Oct 31…Nov 4 strip captioned November |
| C-05 | Strip controls move a day (a row with `paged-navigation`); crossing into another month is the cancelable proposal, rejected → unchanged, late owner → requested day; month controls keep the day number, clamped | `calstrip-q1`..`q10` | none | `#moveStrip`, `#proposedStripAnchor`, `#renderStripNavigation` | ### Day strip | V-08, V-09 | passed | scripted presses incl. cancel and a 30 ms late owner |
| C-06 | Navigation bounds keep the strip inside their months; unmovable controls disabled or hidden; min/max and unavailable days as in the grid | `calstrip-q1`..`q10` | none | `calendarStripClamp` | none | V-10 | passed | June-bounded strip: Jun 1–5, earlier control disabled |
| C-07 | Keyboard: arrows, Home/End = first/last shown day, PageUp/Down month; focus past an edge moves the strip just enough, a far jump centers | `calstrip-q1`..`q10` | grid keyboard | `#dayKeyDown` strip branch, `calendarStripReveal`, `#revealAndFocus` | ### Day strip | V-09 | passed | real End, ArrowRight, PageDown |
| C-09 | Strip moves slide the days (user request 2026-11-13): from the seen position, mid-slide included; moves within two strips render the days in between, clipped, dropped in the last frame; longer jumps fade in from their side; claimable `strip` state role; normal duration, standard easing; reduced motion or `motion-policy="reduce"` moves at once; days keyed by date keep focus | `calstrip-q11` (0.65.42), inventory row `calstrip-motion-strip` (0.65.43) | Carousel/Tabs `prepareMotion` + `resolveMotionTiming` | `#prepareSlide`, `#playSlide`, `#endSlide`, `calendarMotionRoles.strip`, `repeat` keyed rows; `.strip-row[data-sliding]` | ### Day strip | V-13, V-14 | passed | 280 ms slide, 6 days then 5; reduce instant |
| C-10 | Single selection in the strip stays in the middle (user request 2026-11-13): controls select the previous/next selectable day (skipping excluded days), a pressed or written selection slides to the middle; range, multiple and readonly keep moving the days | `calstrip-q12` (0.65.44) | none | `#arrowsSelect`, `#arrowDate`, `#stripControl`, `#centerSelection`; `messages.previousDay`/`nextDay` | ### Day strip | V-15 | passed | arrows 10-30 → 10-31 → 11-02 (11-01 unavailable) → 10-31, each centered |
| C-11 | Day decorations (user request 2026-11-13): `crossedOutDates` strikes selectable days; unavailable crossed out at full strength; disabled dimmed; crossed + disabled struck and dimmed; only the number is struck | `caldeco-q1`..`q6` (0.65.45) | reference booked dates (`calendar-example.tsx` line-through, opacity-100) | `crossedOut` state, `data-crossed-out`, `calendar-day-number` recipe, `.day-cell[data-unavailable]:not([data-disabled]) .day { opacity: 1 }` | ### Crossed-out days and markers | V-16 | passed | opacity 1 / 1 / 0.55 / 0.55 for crossed, unavailable, disabled, crossed+disabled |
| C-12 | `today-indicator` fill / underline / dot / none | same | none | `data-today-indicator`, recipe fill and underline rules, today dot first in `markers` | same | V-16 | passed | all four seen in dark and light |
| C-13 | `dayMarkers`: up to 3 passive Status dots centered at the button bottom; selected-day dots take the foreground; labels join the accessible name; grid content rises alike when markers exist | same | none (Status dot reused) | `calendarDayMarkers`, `#renderMarkers`, `#dayName`, `.day-markers`, `.root[data-markers] .grid` | same | V-16, V-17 | passed | dots 2 px above the bottom; underline clears dots; heights unchanged (254) |
| C-08 | Strip layout: days prefer 1.5 cells, shrink to the cell size, share a wider inline size; 2 cells tall; no own surface; selected/today/range recipes reused | `calstrip-q1`..`q10` | mock composition only | `styles.ts` `.strip`, `.days`, `.strip-row`; recipe parts `calendar-strip`, `calendar-day-weekday`, `calendar-day-number` | ### Day strip | V-07, V-11 | passed | columns 42 natural, 34 at 352 px, 31 bare 300 px, 92 wide; no overflow |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | §17.1 said nothing about wider sizes or value writes | docs | add `calfill-q1` and `calreveal-q1` | Spec Blocks 0.59.0 | passed |
| S-2 | §17.1 had no reduced day picker | docs, bindings | strip variant props, parts and behavior amendment (`calstrip-q1`..`q10`, anatomy, props, parts) | Spec Blocks 0.65.41, commit 1e26572b | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged; structural CSS and one private method
- Supported exports / registration / constituent API impact: none; no new property
- Framework bindings: `npm run cem` regenerated, 0 files changed; strip: 7 binding files gain `variant` and `visibleDays`, ledger check passes
- Public vocabulary / tokens / parts / presentation review: `--tp-calendar-cell-size` keeps its meaning (day size and row height)

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Month navigation | reference `onMonthChange` | `#requestDisplayedMonth` | reused for the reveal, so controlled months accept or reject it | Presets example; V-03 |
| Strip month changes | none | `#requestDisplayedMonth`, `#canDisplay` (one month under the strip) | strip moves reuse the proposal; no second month event | V-08 |
| Strip days and controls | none | `#renderDay` (state, markers, day Button), `#renderNavigation` Button pattern, `calendar-day` recipe | reused unchanged; strip passes each day's own month so none is outside | V-07 |

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
| V-07 | C-04, C-08; visual | strip in Cards, dark and light: single, range across Oct/Nov, wide card | weekday over number, primary selected with readable weekday, muted today, continuous range | as expected | DevTools screenshots on the Default story iframe | passed | Observed values recorded in Actual result |
| V-08 | C-04, C-05; behavior | later ×1, earlier ×3 across Nov→Oct, month next from Oct 31, cancelled month next, paged later | Nov 1–5; Oct 30–Nov 3 captioned November → Oct 29–Nov 2 October; Nov 28–Dec 2; unchanged; Dec 3–7 | as expected; events 10-01, 11-01, 12-01 | DevTools evaluate | passed | Observed values recorded in Actual result |
| V-09 | C-05, C-07; real input | End, ArrowRight, PageDown; controlled owner accepting after 30 ms | Dec 7 → Dec 8 strip Dec 4–8 → Jan 8 centered, focus ring whole; late owner lands on Nov 1 | as expected | DevTools press_key, evaluate | passed | Observed values recorded in Actual result |
| V-10 | C-06; behavior and visual | navigation June 2026, min Jun 2, Jun 4 unavailable; RTL ar-EG 7 days | Jun 1–5, earlier disabled, Jun 1 and 4 muted; RTL order and mirrored arrows | as expected | DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-11 | C-08; layout | natural, 352 px card, bare 300 px block, 36 rem card; hover and click a day | no overflow, columns shrink then share | 42/34/31/92 px columns, overflow 0; hover fill, click selects 2025-11-03 | DevTools evaluate, hover, click | passed | Observed values recorded in Actual result |
| V-13 | C-09; motion | next press normal vs `motion-policy="reduce"`; next, next at 90 ms, previous at 180 ms; slowed to 3 s for screenshots | translate 0 → −42 px in 280 ms then settled 5 days; reduce instant; visual start continuous through interruptions and the end | as expected; max per-frame change 0.28 day (easing velocity), end 1.002 → 1 with no snap | DevTools rAF sampling, mid-slide screenshots both directions | passed | Observed values recorded in Actual result |
| V-14 | C-09; real input | focus last day, ArrowRight; PageDown; month next | focus stays on Nov 7 during and after the slide; jumps fade in from 21 px | as expected; no console errors | DevTools press_key, rAF sampling | passed | Observed values recorded in Actual result |
| V-15 | C-10; real input and behavior | arrows, edge-day press, DevTools click on Oct 31, ArrowRight ×2 + Enter; range and `readonly` strips; controlled owner rejecting, accepting, writing 2025-12-25 | selection centered each time; keyboard skips Nov 1; range/readonly arrows move days, value unchanged; rejection leaves strip; write centers December 25 | as expected; focus kept on Nov 3 after it slid to the middle | DevTools click, press_key, evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-16 | C-11..C-13; visual | grid, strip and range calendars with crossed, unavailable, disabled, crossed+disabled days, markers (1–4, variant and color), each today indicator; dark and light | looks as specified, dots visible on the primary fill | as expected after two fixes: dots anchored to the label (label made static) and underline/dot overlap in 28 px cells (grid content lifted 3 px) | DevTools screenshots, measured rects and opacity | passed | Observed values recorded in Actual result |
| V-17 | C-11, C-13; real input and accessibility | snapshot names; DevTools click on crossed-out selectable June 12 in the strip | names "Tuesday, June 9, 2026, Deadline, Payday"; June 12 selected and centered | as expected; build, 6366 tests, docs check pass | DevTools snapshot, click, evaluate; vitest; npm run build | passed | Observed values recorded in Actual result |
| V-12 | C-04..C-08; suite and docs | vitest, typecheck, lint, `npm run build`, `check-docs.mjs components/calendar`, Docs page Day strip | pass | 6363 tests; docs 1 page pass; Docs preview renders | node, DevTools | passed | Storybook dev API table shows the manifest it loaded at startup; dist manifest has the new rows |

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
- [x] 2026-11-12: `### Day strip` appended after the website sections (A heading order); JSDoc for `variant`, `visibleDays`, grid-only settings, strip messages and the six new parts; `check-docs.mjs components/calendar` passes.
- [x] Earlier: JSDoc unchanged; no new API.
- [x] `elementDependencies` unchanged.
- [x] Verification on the Docs page; no separate fixture.
- [x] Previews reuse Card, Toggle group, Scroll area, Form, Field, Input and Button.
- [x] Preview code uses package registration only.

## Completion / handoff

- Change summary: fill sizing and value-write reveal; 2026-11-12 strip variant (C-04..C-08)
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
