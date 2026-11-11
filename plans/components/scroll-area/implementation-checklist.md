# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Scroll area, `tp-scroll-area`
- Requested work / claim: bounded change — tracks show only while scrolling by default (user request 2026-11-11); this record does not certify the rest of the component
- Scope source: user: "for the scroll component, lets change so it is auto by default, meaning the scroll is only visible when scrolling."
- In-scope changes and existing gaps: `scrollbarVisibility` default `automatic` → `while-scrolling`; other modes unchanged
- Repository baseline / unrelated changes: development after 201c71c0 with uncommitted docs work in the same tree, preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, Component Library doc_8077bf7c…, section `ucl21-scroll-area` props row "Scrollbar visibility"; Carousel dependency review approved; committed f24236f4 (0.58.1), bump to 0.59.0
- Owning contracts / dependencies / vocabulary: §21 Scroll area properties; Foundation common scrollbar visibility scheduling unchanged
- Local reference evidence: the shared scrollbar controller `src/foundation/scrollbar.ts` already schedules `while-scrolling` (shown while scrolling, dragged or focused)
- Tool readiness: Spec Blocks MCP and Chrome DevTools MCP available
- Browser / server / build under test: Chrome via DevTools MCP, Storybook dev server (source)
- Evidence directory: `tmp/component-verification/calendar/`
- Durable verification fixtures / served URLs: Calendar Docs page, Presets quick picks row
- Evidence availability to the next agent: local only

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | `scrollbar-visibility` defaults to `while-scrolling` | `ucl21-scroll-area-props` row 1 | `ScrollbarController.visible` | `scrollbarVisibility = 'while-scrolling'`; story default | ### Scrollbar visibility | V-01 | passed | opacity 0 at rest, 1 while scrolling, 0 about 0.5 s after |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | Default was `automatic` | Carousel (own visibility, unaffected) | change the default | Spec Blocks 0.59.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged; one default
- Supported exports / registration / constituent API impact: none
- Framework bindings: `npm run cem` regenerated, 0 files changed
- Public vocabulary / tokens / parts / presentation review: unchanged

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Track visibility | Foundation common scrollbar | `src/foundation/scrollbar.ts` | reused unchanged | Calendar Presets row; V-01 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Scrollbar | shared scrollbar recipe | `scroll-area-scrollbar` | `recipes/shared/scrollbar.ts` | unchanged | V-01 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Calendar Docs ### Presets | quick picks row | Toggle group | V-01 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01; visual and timing | horizontal row at rest, then scrolled | hidden at rest, shown while scrolling, hidden after | track opacity 0 → 0.95 at 150 ms → 1 → 0 by 770 ms | DevTools evaluate, `due-row-scrolling.png` | passed | Observed values recorded in Actual result |
| V-02 | C-01; docs and suite | `check-docs.mjs components/scroll-area`; vitest | pass | pass; 6310 tests | node | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | shared controller unchanged |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | V-01 |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | explicit modes unchanged; docs Visibility preview sets its own |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec 0.59.0 |
| 1. Capability mapping                 | passed | C-01 |
| 2. Architecture and composition reuse | passed | shared controller |
| 3. Behavior                           | passed | V-01 |
| 4. Presentation and customization     | passed | unchanged recipes |
| 5. Accessibility                      | passed | focused viewport keeps its track (controller rule) |
| 6. Visual and interaction inspection  | passed | V-01 |
| 7. Documentation and demo reuse       | passed | V-02 |
| 8. Regression and reconciliation      | passed | full suite |

## Documentation synchronization

- [x] `docs/components/scroll-area.mdx` ### Scrollbar visibility names the default; ledger forced-edit row; docs check passes.
- [x] JSDoc for `scrollbarVisibility`.
- [x] `elementDependencies` unchanged.
- [x] Verification on the Calendar Docs page.
- [x] Previews unchanged.
- [x] Preview code uses package registration only.

## Completion / handoff

- Change summary: `while-scrolling` default
- Actual delivery claim: the new default, verified in Chrome
- Record checker: `check-gates.mjs --stage verify`
- Non-browser checks: vitest
- Behavior: V-01
- Accessibility: unchanged
- Visual/customization/motion inspection: V-01
- Documentation and demo composition reuse: V-02
- Shared-consumer regressions / package boundaries: consumers of the default now hide tracks at rest by design
- Required failures or blocked checks: none
- Older out-of-scope gaps: the component had no record before; its other capabilities are not re-verified here
- Changed source revisions / reopened gates: none
