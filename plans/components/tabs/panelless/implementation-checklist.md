# Tabs without panels

## Delivery and source record

- Requested work / claim: Tabs with no panels render no panels box, so no gap sits below the tab list and the component is as tall as its list.
- Scope source: user 2026-11-12: "yeah fix the empty gap as well", after the Color palette toolbar showed a 40 px Tabs host around a 32 px tab list.
- Repository baseline / unrelated changes: shared worktree with the uncommitted Color palette widget work; only `src/components/tabs/tabs.ts`, the Tabs docs sentence and this record change here.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; Component Library doc_8077bf7c-0361-48f3-ac87-53b983bd89b3; committed 9ce142e0 (0.65.13): ucl16-tabs-no-panels.
- Owning contracts / dependencies / vocabulary: CL ucl16-tabs; Foundation sec-134-tabs panel lifecycle unchanged.
- Local reference evidence: tabs.ts `.root` column with the presentation gap, `.panels` box always rendered; TabsPanel detaches inactive panels.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP available; Vite dev server on 5191.
- Evidence directory: tmp/component-verification/tabs/panelless/ (local only).

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | No panels registered or slotted: no panels box and no gap; the box returns with a panel | CL ucl16-tabs amendment | TpTabs render, #sync | `#panelless()` read in render; `.panels[hidden]`; #sync re-renders when it changes | Panel mounting sentence | V-01, V-02 | passed | Palette Tabs host 32 px = list; panels hidden |
| C-02 | Tabs with panels keep their layout | ucl16-tabs | TabsPanel | Unchanged when panels exist | Existing docs | V-03 | passed | Color picker (has panels) and Tabs unit/story tests pass |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| --- | --- | --- | --- | --- | --- |
| S-01 | Panel-less Tabs kept an empty panels box and its gap | Toolbars composing Tabs | Hide the box while there are no panels | User decision 2026-11-12; committed 9ce142e0 (0.65.13) | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: existing tabs folder; render reads the panels state, sync requests a render when it changes.
- Supported exports / registration / constituent API impact: none; no new property.
- Framework bindings: unchanged.
- Public vocabulary / tokens / parts / presentation review: no new parts or tokens.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Panels lifecycle | tabs.ts #panels, TabsPanel | TpTabs | Reused; the box follows the registered and slotted panels | Color palette, easing editor, emoji picker, Flow inspector / V-01, V-02 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Panels box | structural `.panels` | tabs.ts styles | tabsAppearance root gap | `.panels[hidden] { display: none }` removes the gap with the box | V-01 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Widget toolbars | Mode and category switches | tp-tabs without panels | Widget fixtures / V-01, V-02 | None |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; geometry | Color palette `?only=collections` | Tabs host as tall as the list; options button level | host 260.7–292.7 = list = options button; panels hidden; toolbar back to `align-items: center` | Chrome DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-02 | C-01; consumers | Easing editor and emoji picker fixtures; built package for comparison | No overlap; spacing that relied on the gap shrinks by 8 px | Easing editor header 32 px, buttons centered (were 4 px low); emoji picker 403 vs 411 px, search 8 px closer to the categories; Flow inspector body keeps its own top padding (code read) | Chrome DevTools evaluate, screenshots, `?built` comparison | passed | Spacing shift reported to the user |
| V-03 | C-02; regression | vitest, lint, typecheck, build | All pass | 455 files / 6339 tests pass | npm scripts | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Color palette removed its top-align workaround |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Tabs with panels unchanged |
| I-03 | Independent constituent options work, including placement separately from action behavior | passed | The box follows panels being added and removed through #sync |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | User request and measured cause recorded |
| 1. Capability mapping | passed | C-01, C-02 mapped to V-01 to V-03 |
| 2. Architecture and composition reuse | passed | Existing panels lifecycle reused |
| 3. Behavior | passed | Box hidden without panels, shown with them |
| 4. Presentation and customization | passed | Geometry measured in Chrome |
| 5. Accessibility | passed | Tablist and tab semantics unchanged |
| 6. Visual and interaction inspection | passed | Palette, easing editor and emoji picker inspected |
| 7. Documentation and demo reuse | passed | Panel mounting sentence; docs check passes |
| 8. Regression and reconciliation | passed | Full suite, lint, typecheck, build pass |

## Documentation synchronization

One sentence appended to the Panel mounting section of the Tabs page.

## Completion / handoff

Implementation: panel-less Tabs hide their panels box. Nothing committed; the user commits.
