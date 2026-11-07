# Native selection implementation and evidence record

## Delivery and source record

- Component(s) / public identity: shared native selection presentation; Native Select, native text controls, document and mirrored-source editors.
- Requested work / claim: shared theme tokens and native selected paint normalization; preserve native behavior.
- Scope source: user explicitly requests new selected-appearance tokens and browser normalization, including text and native listboxes; repair the reported accumulated listbox spacing.
- Repository baseline / unrelated changes: clean 1bcde24; preserve subsequent unrelated work.
- Live authority: project prj_c5a403a0-d1d5-4487-ac78-f4e545f46483, HEAD 702a150e, 0.56.16; Foundation, Library and Widgets ASTs read through direct MCP. Native-selection amendment committed as de275be8 / 0.56.17 after project validation returned zero issues.
- Owning contracts: cl-native-selection, cl-native-selection-pair/text/controls/boundary; ucl17-native-select-q1/q2; existing token pairing and contrast laws.
- Local reference: ../specification/external/ui HEAD 63c1308d1; registry/bases/base/ui/native-select.tsx and styles/style-nova.css .cn-native-select. Native options keep host rendering; reference uses Canvas/CanvasText and primary text selection. Theme adaptation now uses the requested semantic selection pair.
- Tools: registered direct Spec Blocks and Chrome DevTools available. Chrome 156, existing Storybook 6006, one owned tab. Firefox/Safari execution is unavailable; no identical-browser claim.
- Evidence: tmp/component-verification/native-selection/ is ignored and local to this checkout.
- Framework bindings: no element properties, events, slots or methods change. New required CSS token pair changes complete theme records; manifest generation must show no framework projection drift.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | selection/selection-foreground default to primary pair, independently scoped | cl-native-selection-pair | reference style-nova selection rules | token families, stylesheet and catalog | docs/styling.md; token catalog | V-01 | passed | Verified; see V-01 actual results and the source maps below. |
| C-02 | Native text selection in light and shadow DOM | cl-native-selection-text | reference selection:bg-primary | stylesheet and TpElement shared base | docs/styling.md | V-02 | passed | Verified; see V-02 actual results and the source maps below. |
| C-03 | Focused/unfocused native option selected paint | cl-native-selection-controls | NativeSelectOption native option | shared selection paint + Native Select recipe | docs/styling.md | V-03 | passed | Verified; see V-03 actual results and the source maps below. |
| C-04 | Shared row/container rhythm, small/compact/RTL | cl-native-selection-controls | .cn-native-select + popup row rhythm | existing popup spacing and row recipes | native-select existing multiple demo | V-04 | passed | Verified; see V-04 actual results and the source maps below. |
| C-05 | Native semantics, keyboard, disabled, form values retained | ucl17-native-select-q1/q2 | native select option and optgroup | no behavioral or semantic replacement | native-select existing docs | V-05 | passed | Verified; see V-05 actual results and the source maps below. |
| C-06 | Forced colors uses system selection | cl-native-selection-controls | native control rendering | shared shadow environment policy and selection styles | docs/styling.md | V-06 | passed | Verified; see V-06 actual results and the source maps below. |
| C-07 | Editors retain hidden-selection overlays and mirrored source legibility | cl-native-selection-text | existing adapter CSS + Easing source | adapter hide selectors retain original text color; Easing selected source pair | docs/styling.md | V-07 | passed | Verified; see V-07 actual results and the source maps below. |
| C-08 | Build, docs, token integrity and shared consumers | token vocabulary/pairing | existing owner tests and fixtures | focused regressions, build, lint and fixture | token catalog | V-08 | passed | Verified; see V-08 actual results and the source maps below. |

## Architecture and reuse

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing library owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Native text selection | reference global/field selection rules | TpElement base and document stylesheet | same token pair crosses shadow boundary; local editors retain deliberate hide selectors | all library elements + document V-02/V-07 |
| Native option selection | NativeSelectOption | Native Select presentation dictionary | native option plus shared semantic paint, no custom popup or input listeners | Native Select V-03/V-05/V-06 |
| Listbox inset and rows | reference field preset; existing popup row rhythm | command-surface popup spacing/item spacing | reuse actual shared declarations rather than another option spacing scale | Native Select V-04 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Text highlight | base / nova | .cn-native-select selection primary pair | stylesheet, TpElement | new semantic pair independently themeable | V-01/V-02 |
| Option | base / nova | NativeSelectOption native option | native-select-option | CSS paint layer bypasses UA focused colors where supported; system colors remain accessible | V-03/V-06 |
| Listbox/row | base / nova | native field uses single-select inset | command-surface shared popup inset and row spacing | multiple is an in-flow native listbox, not another single-line field | V-04 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| durable fixture + actual Multiple demo | native selection control | tp-native-select, tp-field, tp-input, tp-text-area | existing register entry; keyboard and value | native option/select and selectable text are required native anatomy |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; tokens | defaults, custom scope and both schemes | complete pair; inherited override independent of primary | Both token roles and foreground pairing registered; alias defaults readable at 4.54:1 light and 5.42:1 dark. Scoped green/white and semantic success overrides do not change primary. | catalog tests + MCP | passed | Chrome MCP output; local command logs |
| V-02 | C-02; behavior/visual | real select-all Input/Text area and nested selectable text | themed text/background in all scopes | Real Home/Shift+End selected Input 0–29, Text area 0–32 and scoped Input 0–24; double-click selected nested document word; custom scope used success pair. Ordinary contenteditable selection used primary pair. | Chrome MCP fixture | passed | Chrome MCP output; local command logs |
| V-03 | C-03; visual | click option, focus/blur, custom pair | selected fill/content stable, no OS blue | Actual Multiple docs in source, static Storybook and built website: real click/Shift+ArrowDown selected review/mention with themed inset fill and text in focused/blurred states. No OS blue in inspected images. | Chrome MCP actual docs | passed | Chrome MCP output; local command logs |
| V-04 | C-04; geometry/visual | default/sm, compact, RTL and groups | one outer inset, shared row inset; disabled text visible | Chrome geometry default outer 4px/rows 28px, sm rows 24px, compact outer 3px/rows 21px; grouped RTL, disabled instance and custom scope inspected. | Chrome MCP fixture | passed | Chrome MCP output; local command logs |
| V-05 | C-05; behavior/accessibility | real Shift+Arrow selection, form values, focus + axe | native values/roles/submission and disabled behavior | Real selection submitted events=review and events=mention; Reset restored deploy/failed. End/ArrowDown skipped disabled final option, native scrollTop 28px. Native listbox and selected states in AX tree. Axe scoped fixture excluding unrelated Easing UI: 0 violations, 22 passes. | Chrome MCP fixture | passed | Chrome MCP output; local command logs |
| V-06 | C-06; accessibility/visual | forced-colors active, focused and blurred | system selection visible; paint layer removed | Chrome forced-colors emulation: focused and blurred selected options use system Highlight/HighlightText and computed shadow none, including custom token scope. Easing selection uses same system pair. | Chrome MCP emulation | passed | Chrome MCP output; local command logs |
| V-07 | C-07; editor regression | Easing mirrored source selected, contenteditable + adapter hide CSS | selected text readable; hidden editor-selection regions remain hidden | Real Easing output selection 0–38 shows selection pair despite normally transparent source text. Both live editor engines: real drag selects two cells; transparent native highlight and currentColor keep origin foreground (250,250,250) in dark scheme. Real ordinary paragraph selection uses selection pair instead. | Chrome MCP + adapter source checks | passed | Chrome MCP output; local command logs |
| V-08 | C-08; regression/docs | tests, build, lint, docs checker/catalog and rendered fixture | pass applicable checks | Full suite 442 files, 6260 passed/3 skipped in 155.04s; final adapter repair rerun 5 files/192 tests passed. Final library/Storybook/isolated website builds pass; source and five framework type checks, lint, native-select docs checker and token catalog pass. Official size report regenerated; 97 independent consumer bundles passed tree-shaking and binding budgets. | resource-capped commands; one heavy stage at a time | passed | Chrome MCP output; local command logs |

## Early integration checkpoint

| ID | Required observation | Status | Evidence / correction needed |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Shared TpElement covers native editors; document stylesheet uses same semantic pair; Native Select delegates to shared option paint and popup spacing. |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Actual Multiple demo in Chrome: focused selection paints theme purple; default rows 28px after explicit native border-box normalization, outer inset 4px and row inline inset 6px. |
| I-03 | Independent composition options work, including placement separately from action behavior | passed | Scoped green/white pair honored during real focus; sm rows 24px; forced colors uses system Highlight/HighlightText with computed shadow none. |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | fresh live documents, reference revision, exact user scope and native limitation mapped |
| 1. Capability mapping | passed | C-01 through C-08 map all requested behavior and presentation; candidate spec amendment valid |
| 2. Architecture and composition reuse | passed | TpElement/document shared selection and existing native/popup presentation owners; no new behavior owner |
| 3. Behavior | passed | Real keyboard, pointer, submit/reset and disabled navigation checks passed; native hosts and state retained. |
| 4. Presentation and customization | passed | Semantic pair, custom scopes, light/dark, flat/default, compact/small, grouped RTL and forced colors verified. |
| 5. Accessibility | passed | Native AX listbox/options and textboxes retained; real input and axe 0 violations/22 passes, separate from visual evidence; no screen-reader claim. |
| 6. Visual and interaction inspection | passed | Source and built controls and actual docs inspected in Chrome 156, including both editor cell-selection overlays and native text selection. |
| 7. Documentation and demo reuse | passed | Styling guide, generated catalog and durable native-selection fixture updated; existing component page unchanged and checker passes. Static Storybook and website rendered; new pair and contrast shown. |
| 8. Regression and reconciliation | passed | Full suite plus final adapter rerun, final library/Storybook/site builds, source/framework types, lint and 97-bundle budgets pass; generated size report refreshed by command. |

## Documentation synchronization

Existing native-select page remains unchanged unless the public component API changes; styling guide and generated design-token catalog own the new shared color roles. Fixture stays outside curated docs and uses existing library controls. All new theme records must include both roles. No framework properties change.

## Completion / handoff

Implemented the shared selection pair, native listbox paint/spacing and dependent editor suppression repair. Browser, documentation and regression checks passed. This feature does not certify full component conformance; browser normalization does not mean an identical operating-system picker.

### Dependent editor repair

The shared foreground exposed a missing part of existing native-selection suppression: transparent highlight backgrounds alone left the new selected foreground on top of ordinary document text. Both existing adapter CSS owners now use currentColor in those suppression rules. inherit is unsuitable because highlight inheritance takes the parent highlight foreground; Chrome verified currentColor resolves to the originating text. Adapter reviewed CSS expectations and mechanics-only assertions were updated. This retains existing overlay ownership and adds no engine appearance palette. Gates 1/2 were reviewed with this dependency before the repair.

### Final evidence boundary

New native option paint lives in the shared presentation recipe; TpElement only
installs that recipe for its shadow root. The document stylesheet projects the
same text token pair into the light DOM. No new input listeners, timers, custom
popup, or parallel selection-state owner were added. Native platform popups that
do not expose CSS remain native and are explicitly documented; Chrome checks do
not establish Firefox/Safari or OS-picker pixel parity.

Full-suite evidence precedes the final currentColor adapter correction; the five
affected adapter test files were rerun afterward. Final build and lint include
that correction. All heavy checks ran one stage at a time, at nice priority 15
with a capped heap (1 GB tests, 2 GB builds) and one test worker.

### Completion / cleanup

- Spec amendment: committed de275be8, project 0.56.17, clean and zero issues.
- Source/framework type checks pass; manifest projection updated 0 of 207 binding files. No element API was introduced that requires new framework interaction scenarios.
- Full-suite result: 442 files / 6260 passed / 3 skipped in 155.04s. Five final adapter files rerun: 192 tests passed. Focused native-selection/presentation/token checks: 26 files / 210 tests passed.
- Library, Storybook and isolated website builds pass. Native Select docs checker passes (20 checks), as do formatting, ESLint, Stylelint and diff whitespace checks. The final shared base-style extraction and adapter correction are included in build/lint.
- Official size-report command passes tree-shaking/binding budgets for 97 independent bundles and updates src/stories/size-report.json. This is not an additive total of gzipped modules.
- Source and built fixture, actual static Storybook Multiple preview, website Multiple preview and both token catalogs inspected in Chrome. The website reports 5.42:1 selection contrast in dark mode; Storybook 4.54:1 in light mode.
- Closed only owned verification tab 136 and stopped task-owned servers 5391/5392/5393. Existing user tabs and Storybook 6006 were preserved.
- Local logs: tmp/component-verification/native-selection/. Browser screenshots were inspected in MCP outputs; these logs are local and ignored by git.
- Supported normalized CSS states were verified in Chrome 156. Native OS picker presentation and Firefox/Safari pixel parity are not claimed.

The final standard-color fallback now uses the same forced-colors foreground as
the prefixed text-fill channel. Targeted formatting/ESLint and the library build
were rerun afterward. The rendered Chrome paint remains the already-verified
text-fill channel; this adds the same system foreground to the standard CSS path.
