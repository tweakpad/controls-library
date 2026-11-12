# Tooltip width and wrapping

## Delivery and source record

- Requested work / claim: Tooltip exposes `wrap` and `max-width`; default no limit and no wrap; a line is cropped when wrap is off with a limit; long text never overflows the surface.
- Scope source: user 2026-11-12: "tootip should expose an attribute for disabling/enabling this as well as a width. Crop happens if wrap is disabled with a limit. Default is no limit, no wrap." Found while building the Color palette status bar (550 px text in a 300 px body).
- Repository baseline / unrelated changes: shared worktree with the uncommitted Color palette widget work; only `src/components/tooltip/tooltip.ts`, the tooltip rules in `src/presentation/recipes/core/anchored.ts`, its unit test, fixture, docs and generated bindings change here.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; Component Library doc_8077bf7c-0361-48f3-ac87-53b983bd89b3; committed 9ce142e0 (0.65.13): ucl19-tooltip-props-wrap, ucl19-tooltip-props-max-width, ucl19-tooltip-q4; reviews media-player-component-dependency-5 and ucl22-text-transform-dep-1 approved.
- Owning contracts / dependencies / vocabulary: CL Tooltip section; anchored surface layout (TpHoverSurface popup, body, scroll-content) unchanged; vocabulary `wrap` follows Code Block's Boolean `wrap`.
- Local reference evidence: anchored-surface.ts `.body` / `.scroll-content` flex layout (scroll layer `flex: 0 0 auto` kept the row at max-content); tooltipCoreAppearance `max-inline-size` 20rem rule.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP available; Vite dev server on 5191 for fixtures.
- Evidence directory: tmp/component-verification/tooltip/ (local only); tracked fixture rows `#long`, `#wrapped`, `#cropped`.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | `wrap` Boolean false, reflected; `max-width` CSS length, empty default | CL Tooltip amendment | TpTooltip properties | `wrap`, `maxWidth`; popup `data-wrap` and `--_tp-tooltip-max-width` | Width and wrapping; generated API | V-01, V-03 | passed | Unit tests for defaults and trimmed limit; bindings regenerated (7 files) |
| C-02 | Default: one line, as wide as the text, capped by the available width | CL Tooltip amendment | tooltipCoreAppearance | `max-inline-size: min(var(--_tp-tooltip-max-width, 100vw), var(--tp-available-width))`, `white-space: nowrap` | Width and wrapping | V-01 | passed | `#long` 344 px wide, one line |
| C-03 | `wrap` breaks at the limit; without `wrap` a longer line is cropped inside the padding | CL Tooltip amendment | anchored `.body`, `.scroll-content` | Tooltip `.scroll-content` `flex: 0 1 auto; min-inline-size: 0`; `.body` `overflow: hidden`; `[data-wrap]` `white-space: normal` | Width and wrapping | V-01, V-02 | passed | `#wrapped` 192×66 px; `#cropped` 192×30 px, scroll layer 168 = body |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| --- | --- | --- | --- | --- | --- |
| S-01 | CL Tooltip capped width at 20rem with no wrapping control; content overflowed | Tooltip, every tooltip consumer | `wrap` + `max-width`, default no limit and no wrap | User decision 2026-11-12; committed 9ce142e0 (0.65.13) | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: existing tooltip folder; two properties and popup attributes. Anchored surface layout untouched; overrides live in the tooltip recipe only.
- Supported exports / registration / constituent API impact: unchanged tag and exports; two new properties.
- Framework bindings: regenerated with `npm run cem` (7 files).
- Public vocabulary / tokens / parts / presentation review: no new parts or tokens; private custom property `--_tp-tooltip-max-width`.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Surface layout | anchored-surface `.popup`, `.body`, `.scroll-content` | TpHoverSurface | Reused; tooltip recipe lets the row shrink and clip | TpTooltip, Color palette source info / V-01, V-02 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| tooltip-content | library tooltip surface | anchored.ts tooltipCoreAppearance | tooltipCoreAppearance | Width from `max-width`, nowrap default, `[data-wrap]` normal | V-01, V-02 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Width and wrapping docs example, fixture rows | Button triggers | tp-tooltip, tp-button | Default register / V-01 | None |
| Color palette source info | Icon trigger | tp-tooltip `wrap max-width="18rem"` | Widget registration / V-02 | None |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01, C-02, C-03; geometry, visual | Tooltip fixture `#long`, `#wrapped`, `#cropped`, `#basic`, opened by keyboard focus | One line by default; wrapped at 12rem; cropped at 12rem | long 344×30 nowrap; wrapped 192×66 normal; cropped 192×30 nowrap with the line clipped inside the padding; basic unchanged; screenshots inspected | Chrome DevTools evaluate, screenshots | passed | Observed values recorded in Actual result |
| V-02 | C-03; integration | Color palette `?only=collections` with a long source and license | Source info wraps at 18rem | 288×66 px, license on two lines | Chrome DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-03 | C-01; unit, regression | vitest, lint, typecheck, build, docs check, tooltip regressions page | All pass except a pre-existing regression check | 455 files / 6339 tests pass; docs check passes; `triggerReplacement` fails `newTriggerDescribed` on the built package from before this change too | vitest; npm scripts; check-docs; Chrome `regressions.html?built` | passed | Pre-existing `triggerReplacement` failure, unrelated, reported to the user |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Color palette dropped its own 18rem content cap and uses the Tooltip attributes |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Same surface, padding, colors and arrow; only width and wrapping rules change |
| I-03 | Independent constituent options work, including placement separately from action behavior | passed | `wrap` and `max-width` act independently: limit only, wrap only, both |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | User request and root cause in the anchored layout recorded |
| 1. Capability mapping | passed | C-01 to C-03 mapped to V-01 to V-03 |
| 2. Architecture and composition reuse | passed | Anchored surface reused; tooltip recipe only |
| 3. Behavior | passed | Properties reflect and reach the popup; unit tests |
| 4. Presentation and customization | passed | Three sizing modes measured in Chrome |
| 5. Accessibility | passed | Description wiring unchanged; cropping is visual only and the full text stays the trigger's description |
| 6. Visual and interaction inspection | passed | Screenshots of wrapped and cropped tooltips inspected |
| 7. Documentation and demo reuse | passed | Width and wrapping section with a live preview; docs check passes |
| 8. Regression and reconciliation | passed | Full suite, lint, typecheck, build pass; pre-existing regression failure noted |

## Documentation synchronization

The merged Tooltip page keeps its website sections; the library-only Width and wrapping section is appended after Disabled. Generated API comes from the property JSDoc.

## Completion / handoff

Implementation: `wrap` and `max-width` on TpTooltip, tooltip recipe sizing. Nothing committed; the user commits.
