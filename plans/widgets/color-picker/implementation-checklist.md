# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Color picker, `tp-color-picker`
- Requested work / claim: bounded change — the swatches view composes the Color palette, the schemes view and `schemes` property are removed, `collections` is added, and the recent strip becomes gapless (user request 2026-11-11); this record does not certify the rest of the widget
- Scope source: user: "Our current implementation has several issues … in terms of the borders but also, on the limited way it has to present the colors"; plan approved 2026-11-11
- In-scope changes and existing gaps: swatches view, recent strip, removed schemes view; other views untouched and not re-verified beyond the fixture helpers listed below
- Repository baseline / unrelated changes: development at ca72307d with the session's earlier uncommitted work preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, UI Widgets Specification §6.1 anatomy r11d, r12 (r13 removed), properties r6, r12–r14, a11y-2, key-3, pres-3; committed 0e88bd9a (0.59.1), a789ad8c (0.60.0)
- Owning contracts / dependencies / vocabulary: §6.1 Color picker; Color palette `uwg-pal-sec`; §17.12 `cinp-q8`
- Local reference evidence: the color picker's own former swatches and schemes views (`views/swatches.ts`, `color/scheme.ts`)
- Tool readiness: Spec Blocks MCP and Chrome DevTools MCP available
- Browser / server / build under test: Chrome via DevTools MCP, Vite dev server (source) on port 5191
- Evidence directory: `tmp/component-verification/color-palette/first/`
- Durable verification fixtures / served URLs: `tests/fixtures/widgets/color-picker/` (`#swatches`, `#popup`)
- Evidence availability to the next agent: local only

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | Swatches view is a Color palette of the saved and recent colors and `collections` | `uwg-cp-tab-anatomy-r12`, props r12–r14 | former `#renderSwatchesView` | `#paletteCollections`, `#paletteChange` | ### Swatches and collections | V-01, V-03 | passed | `assertSwatches` passes |
| C-02 | Recent strip gapless with one edge | `uwg-cp-tab-anatomy-r11d`, `cinp-q8` | `views/swatches.ts` | ghost joined Toggle group, `color-picker-swatch-grid` recipe | ### Swatches and collections | V-02 | passed | 140 px strip of five cells |
| C-03 | Schemes view removed | props r6, r14 | `#renderSchemesView` | deleted; `ColorPickerView` without `schemes` | ### Views | V-04 | passed | suite and bindings |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | Schemes view replaced by the palette's gradients and combinations | docs, stories, fixture | remove without shims | Spec Blocks 0.60.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged except `color/scheme.ts` and `color/contrast.ts` moved to `src/foundation/color/` (re-exported)
- Supported exports / registration / constituent API impact: `schemes` removed, `collections` added; `ColorPalette`/`ColorScheme` types removed
- Framework bindings: `npm run cem` regenerated; `tp-color-picker` row unchanged in status
- Public vocabulary / tokens / parts / presentation review: parts `color-picker-schemes`, `-scheme`, `-scheme-item`, `-template`, `-generate` removed

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Swatch browsing | former Toggle group rows | `tp-color-palette` | composed with a controlled value; proposals re-proposed on the picker's lane | V-01 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Recent strip | swatch toggles | `color-picker-swatch-item`, `-swatch-grid` | `recipes/color-picker.ts` | gapless cells, strip edge from the float edge | V-02 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Swatches view | palette | Color palette | V-01 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01; behavior | fixture `assertSwatches`, `assertRecent` | saved, brand and recent colors listed; pick commits once with the swatch surface | pass | DevTools evaluate | passed | Observed values recorded in Actual result |
| V-02 | C-02; visual | popup with five recent colors | one gapless strip with one edge | as expected | `first/picker-recent.png` | passed | Observed values recorded in Actual result |
| V-03 | C-01; visual | `#swatches` view | palette inside the picker, labels on the picker surface | as expected | `first/picker-swatches.png` | passed | Observed values recorded in Actual result |
| V-04 | C-03; suite | vitest, typecheck, `assertValueLanes`, `assertPopup`, `assertPopupHeader`, `assertNestedEventBoundary` | pass | pass | node, DevTools | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | schemes rows removed; generation lives in foundation |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | V-02, V-03 |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | recent strip and swatches view independent (V-01) |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec 0.60.0; bounded change |
| 1. Capability mapping                 | passed | C-01..C-03 |
| 2. Architecture and composition reuse | passed | palette composed |
| 3. Behavior                           | passed | V-01 |
| 4. Presentation and customization     | passed | V-02, V-03 |
| 5. Accessibility                      | passed | palette accessibility (palette record V-07) |
| 6. Visual and interaction inspection  | passed | V-02, V-03 |
| 7. Documentation and demo reuse       | passed | `check-docs.mjs widgets/color-picker` with ledger forced edits |
| 8. Regression and reconciliation      | passed | V-04 |

## Documentation synchronization

- [x] `docs/widgets/color-picker.mdx` ### Swatches and collections; ledger forced-edit rows; docs check passes.
- [x] JSDoc for `collections`.
- [x] `elementDependencies` lists `TpColorPalette`.
- [x] Fixture `#swatches` instance and helpers updated.
- [x] Previews reuse library components.
- [x] Preview code uses package registration only.

## Completion / handoff

- Change summary: swatches view composes the Color palette; schemes view removed; recent strip gapless
- Actual delivery claim: those changes, verified in Chrome (dark)
- Record checker: `check-gates.mjs --stage verify`
- Non-browser checks: vitest, typecheck, lint
- Behavior: V-01
- Accessibility: through the palette record
- Visual/customization/motion inspection: V-02, V-03
- Documentation and demo composition reuse: docs check
- Shared-consumer regressions / package boundaries: text editor swatch recipe unchanged
- Required failures or blocked checks: none
- Older out-of-scope gaps: the widget had no record before; other views not re-verified here
- Changed source revisions / reopened gates: none
