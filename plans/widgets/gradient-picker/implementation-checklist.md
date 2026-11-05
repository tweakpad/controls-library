# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Gradient picker, `tp-gradient-picker` (widget; first delivered as `tp-color-gradient-input`, renamed on the user's request 2026-11-05).
- Requested work / claim: complete widget: a gradient stop editor decoupled from the color picker, under `tp-gradient-picker` (user request with a reference image, 2026-11-05).
- Scope source: user instruction, 2026-11-05, with the user's answers: stops and midpoints only (no gradient type or angle); it opens nothing, and a stop's color, location, rotation and transparency are separate controls the app composes; the value is renderer-agnostic structured data, not a CSS string.
- Field variant (2026-11-05): "extend this picker with another variant … extract the logic for field gradient" from the user's `vanrez-nez/skybox-studio` (`src/components/ui/composables/field-gradient-group.tsx`, `src/effects/layers/field-gradient/{state,operations}.ts`, branch `development`): anchors on an equirectangular field blended by angular distance (inverse-distance or Gaussian falloff, power), a sine/cosine domain warp (amplitude, frequency), 1–8 anchors, drag, double press to add, remove the selected one. Its mode, power and warp sliders and color picker stay app-composed, as for the linear variant.
- In-scope changes and existing gaps: the widget, its model and sampling helpers, family and recipe, catalog/register/bindings, docs page, story, widget fixture, unit tests. No live spec section exists yet (S-01).
- Repository baseline / unrelated changes: `development` at `151e680` plus later user commits; the shared worktree's other changes preserved.
- Live project / document IDs and revisions: UI Library `prj_c5a403a0-d1d5-4487-ac78-f4e545f46483`, head `4d63a66b`; UI Widgets Specification §6 searched for "gradient": no match.
- Owning contracts / dependencies / vocabulary: Widgets §5 shared behavior (dimension inputs, keyboard steps), Foundation color model (`src/foundation/color/`), ControllableState lanes, Button.
- Local reference evidence: no gradient editor in `../specification/external/` (searched every library); Base UI multi-thumb Slider covers positions only. The interaction model follows the library's Easing editor graph.
- Tool readiness: Spec Blocks and Chrome DevTools MCP available.
- Browser / server / build under test: Chrome through DevTools MCP; Storybook on 6006; Vite on 5173 for the widget and framework fixtures.
- Evidence directory: `tmp/component-verification/gradient-picker/`
- Durable verification fixtures / served URLs: `tests/fixtures/widgets/gradient-picker/` (`assertPointer`, `assertControlled`, `assertForm`, `assertStates`); `tests/unit/widgets/gradient-picker/model.test.ts`; lane row in `tests/fixtures/frameworks/lanes.ts`.
- Evidence availability to the next agent: fixtures and tests in the repository; screenshots local only.

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | Value: stops `{ position 0–1, color (CSS Color 4 text), midpoint? (0.05–0.95, default 0.5) }`, normalized sorted; `value`/`defaultValue` (JSON `default-value`), `tp-value-change` live, `tp-value-commit` once per gesture, `tp-field-value`; form value JSON under `name`, reset, restore | pending spec section (user request 2026-11-05) | Easing editor value lane | `ControllableState`, `normalizeGradientStops`, `setFormValue`, `stopsConverter` | ## Usage | V-01, V-04, V-05 | passed | fixture `assertPointer`, `assertForm` |
| C-02 | Selection lane: `selected`/`defaultSelected` (index, -1 none), `tp-selection-change`; press, focus and keyboard select; a moved stop keeps its selection | pending spec section | color picker format/view lanes (`eventFactory`) | `#selectedState`, `#select` | ## Usage | V-01, V-02 | passed | real keys and fixture |
| C-03 | Pointer: a track press adds a stop in the sampled color (hex) and drags it; a stop drags past neighbors; a diamond moves its midpoint; Escape restores stops and selection; one commit per gesture | pending spec section | Easing editor graph `#begin`, `#insertPoint` | `PointerDrag` with `grip`, `#begin`, `#moveTo`, model `insert/move*` | ## Usage | V-01 | passed | midpoint hit area over the track found and fixed |
| C-04 | Keyboard: every stop and midpoint is a hidden range input (slider); arrows by `step`, Shift ×10, Alt ÷10, Home/End; RTL-aware; Delete/Backspace removes; focus follows a reordered stop | pending spec section | `dimension-step` `stepForKey` | `#keyDown`, `#focusLater`, `rangeHandleStyles` | ### Keyboard | V-02 | passed | real keys in DevTools |
| C-05 | Remove Button (`removable`, default true) for the selected stop; `min-stops` (default 2) refuses below it; focus moves to the stop when the Button disables | pending spec section | Easing editor remove point | `tp-button` + `trashIcon`, `#removePress`, `removeGradientStop` | ## Usage | V-02 | passed | real click |
| C-06 | Renderer-agnostic sampling: `interpolation` (`oklab` default, `srgb`), midpoint hint curve, `sample(t)`, exported `sampleLinearGradient`; the track paints from the model | pending spec section | foundation `mixColors` | `sampleLinearGradient`, `midpointWeight`, `gradientTrackPaint` | ### Interpolation and sampling | V-03 | passed | unit tests |
| C-07 | Composition API: `setValue(stops)`, `setStop(index, changes)` (moved stop stays selected), `setSelected(index)`, in controlled and uncontrolled use | pending spec section | Color input `setValue` | public methods | ### Composing a stop editor | V-06 | passed | docs composition edited in DevTools |
| C-09 | `variant` (`linear` default \| `field`); value is stops or anchors `{ x, y, color }` (0–1 from the top start, order kept); a variant change reconciles an uncontrolled value to its shape | pending spec section (user request 2026-11-05) | skybox-studio `FieldGradientState.anchors` | `variant`, `#normalize`, `normalizeFieldAnchors`, `sameEntries` | ### Field gradients | V-08 | passed | fixture `assertField` |
| C-10 | Field sampling extracted from skybox-studio: equirectangular directions, angular distance `1 − cos`, inverse-distance `1/(d+0.0005)^p` or Gaussian `σ = 0.46/p`, domain warp, ranges power 0.4–6, amplitude 0–0.6, frequency 0.3–4; added `projection="plane"` and `interpolation`; `createFieldGradientSampler`, `sampleFieldGradient`, `renderFieldGradient` (RGBA rows from the top) | pending spec section | `field-gradient-group.tsx` `sampleFieldColor`, `warpDirection`, `drawFieldPreview` | `field.ts` | ### Field gradients | V-09 | passed | unit tests |
| C-11 | Field interaction: anchors drag in 2D, double press on empty space adds an anchor in the sampled color (hex) and selects it, a double press on an anchor adds none, Escape restores, `min-stops` 1 / `max-stops` 8 by default, the remove Button and Delete; two slider inputs per anchor, arrows unmirrored | pending spec section | `handleAnchorPointerDown`, `handlePreviewDoubleClick`, `addFieldGradientAnchor`, `removeFieldGradientAnchor` | `#fieldSurfaceReference`, `#fieldDoubleClick`, `#anchorKey` | ### Field gradients, ### Keyboard | V-08, V-10 | passed | the sampled color replaces the source's copy of the selected anchor's color, matching the linear variant |
| C-12 | Field preview: canvas at most 320 px wide (the source caps device pixels at 1), redrawn when anchors, settings or size change; settings `falloff`, `power`, `warp-amplitude`, `warp-frequency`, `projection` are properties apps bind their own controls to | pending spec section | `drawFieldPreview`, ResizeObserver | `#drawField`, `gradient-picker-field` part | ### Field gradients | V-10 | passed | docs settings preview |
| C-13 | Markup: `tp-gradient-stop` children (`position`, `color`, `midpoint`; `x`, `y` for the field) declare the stops; the picker writes its edits back (minimal diff: unchanged stops keep their element, gradient order), reads author changes (attribute, property, added or removed child), and a form reset restores the markup as first written (author changes count until the picker's first edit); `value` (controlled) ignores children; the `default-value` JSON attribute is gone, `defaultValue` takes records | pending spec section (user request 2026-11-05) | `tp-select-option` data child pattern | `TpGradientStop`, `#readStops`, `#writeStops`, `#stopsChanged`, hidden slot | ## Usage | V-11 | passed | reset first kept picker edits; fixed with the `#edited` rule |
| C-14 | Field remove Button: floats inside the field at the bottom end corner (secondary paint over the colors), shown only while an anchor is selected and the picker is editable, and glides to the top end corner while the dragged or selected anchor reaches under it; a double press on it adds no anchor | user request 2026-11-05 (screenshot) | — | `#placeRemove`, `.field-surface .remove`, `gradient-picker-remove-variant-field` transition | ### Field gradients | V-12 | passed | real click removes; dragged into the corner in DevTools |
| C-08 | Presentation: `size` sm/default, track over the checker, stops ringed in their own color (selected: near-white ring, 1.15 scale), muted diamonds, flat mode keeps the connector-free paint, RTL mirrors | pending spec section | shared `handle.ts`, `swatch.ts` recipes | `gradientPickerAppearance` | ### Sizes and states | V-07 | passed | screenshots |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-01 | The UI Widgets Specification has no gradient picker section (linear and field variants) | widget docs, bindings | add a §6 section after the user confirms | user request 2026-11-05 | pending |

## Architecture and reuse

- Component folder and responsibility boundaries: `src/widgets/gradient-picker/` (`gradient-picker.ts` element, `model.ts` pure stops and sampling, `strings.ts`); never imports `widgets/color-picker`.
- Supported exports / registration / constituent API impact: `@tweakpad/ui/widgets` exports the class, types, model helpers and strings; `register/widgets` defines it; widget catalog entry `Gradient picker`.
- Framework bindings: generated by `npm run cem` (`src/{react,vue}/widgets/gradient-picker.ts`); ledger row added; lane row in the framework fixtures.
- Public vocabulary / tokens / parts / presentation review: parts `gradient-picker`, `-track`, `-stop`, `-midpoint`, `-remove`, `focusable`; private size variables only.

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Drag gestures | Easing editor graph | `foundation/pointer-drag.ts` | reused with `grip`; one-dimensional positions | V-01 |
| Keyboard steps | dimension inputs | `foundation/dimension-step.ts` | reused | V-02 |
| Color math | color picker model | `foundation/color/` (`mixColors`, `parseColor`, `serializeColor`, `displayColor`) | reused; sRGB mix added in the model | V-03 |
| Hidden range inputs and hit areas | Slider thumbs, picker surfaces | `components/shared/control-styles.ts` `rangeHandleStyles` | reused; midpoint hit area confined to its row | V-01 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| `gradient-picker-track` | color picker alpha track | `swatchFill`, `floatEdge` | shared swatch recipe | full-radius bar | V-07 |
| `gradient-picker-stop` | color markers | `thumbRing`, `colorThumbRing`, `activeRing`, `focusRing` | shared handle recipe | selected stop takes the color-marker ring | V-07 |
| `gradient-picker-midpoint` | handle rings | `handleSurface`, `ringMix`, `focusRing` | shared handle recipe | rotated square inside a square hit box | V-07 |
| `gradient-picker-remove` | Button | `tp-button` ghost icon-sm | Button | trash icon | V-02 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| docs ### Composing a stop editor | stop color, location, rotation | Color input (inline), Input (inline, `unit`) | V-06 | none |
| element | remove action | Button, `trashIcon` | V-02 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02, C-03; behavior | fixture `#default`: press the track at 0.2, drag to 0.8, release; press 0.45, drag to 0.1, Escape; drag a diamond | hex stop added and selected, passes two neighbors with its selection, one commit; Escape restores; midpoint moves | as expected | `assertPointer` (8 checks), DevTools evaluate | passed | synthetic pointer sessions on the element under each point; DevTools drag emits one move |
| V-02 | C-02, C-04, C-05; real input | click Stop 3; Shift+ArrowRight; End; Delete; click Remove stop | 0.85; equal position keeps its side, focus follows; removed with the neighbor selected; Button disables at two stops and focus moves to the stop | as expected | DevTools click, press_key, evaluate | passed | an equal-position swap found by a unit test and fixed |
| V-03 | C-06; unit | model tests | ends, midpoint hint 50 % at `m`, OKLab vs sRGB, transparent for unparsable colors | as expected | `model.test.ts` (14 tests) | passed | — |
| V-04 | C-01; controlled lanes | late owner (microtask write-back), silent owner; React and Vue lane rows | late owner publishes and commits the published stops; silent keeps; framework lanes pass | as expected | `assertControlled`, `reactBindings.lane`, `vueBindings.lane` | passed | a mode switch after the first render is refused by design |
| V-05 | C-01; forms | `#field` named `ramp`; `setStop`; `form.reset()` | JSON submitted; edit submitted; default restored | as expected | `assertForm` | passed | — |
| V-06 | C-07; real input | docs composition: type 80 in Location, Tab; Tab across stop 3 | stop passes its neighbor and stays selected; rows show the selected stop | as expected | DevTools click, type_text, press_key | passed | `value` after the first render was refused, so `setStop`/`setValue`/`setSelected` were added |
| V-08 | C-09, C-11; behavior | fixture `#sky`: drag anchor 1 to (0.4, 0.8); Escape mid-drag; double press empty space and an anchor; six more double presses; ArrowRight, ArrowUp; Delete | moved; repainted; restored; one added in hex and selected, none on the anchor; capped at 8; +0.01 across and up; removed | as expected | `assertField` (10 checks) | passed | fixture elements must be scrolled into view for hit testing |
| V-09 | C-10; unit | field model tests | anchor color at the anchor (both projections), even mix halfway, wrap across the sphere edge vs plane, power keeps colors closer, warp bends, alpha and unparsable colors, RGBA rows, add/move/remove | as expected | `field.test.ts` (11 tests) | passed | — |
| V-10 | C-11, C-12; real input and visual | Storybook Field story: click Anchor 2 horizontal, Shift+ArrowRight, Shift+ArrowUp; docs field settings: Shift+ArrowRight on Power; plane + Gaussian instance; axe | moves 0.1 across and up; field repaints with the slider; plane field unwrapped; no violations | as expected | DevTools click, press_key, screenshots, injected axe-core | passed | `tmp/component-verification/gradient-picker/field-equirect.png` |
| V-11 | C-13; behavior | fixture `#field`: `setStop`; track press; author attribute, appended stop, property, removal; `form.reset()`; docs previews | edit written and the unchanged stop keeps its element; added child in gradient order; each author change read; reset restores the written markup; seven docs previews render from children | as expected | `assertMarkup` (9 checks), DevTools evaluate | passed | — |
| V-12 | C-14; behavior and visual | Field story: drag anchor 1 into the bottom end corner; release; drag away; double press on the Button; `setSelected(-1)`; real click on Remove stop; light scheme; fixture `assertField` | Button moves to the top end corner and stays while the anchor sits there, returns once it leaves; no anchor added; hidden without a selection; click removes and selects the neighbor; readable in both schemes | as expected | DevTools evaluate, click, screenshots; `assertField` (13 checks) | passed | — |
| V-07 | C-08; visual and accessibility | dark, light, flat, RTL, `sm`, read-only, disabled, focus-visible; axe on five instances | matches the reference hierarchy; mirrored in RTL; no edge in flat; ring on focused diamond; no violations | as expected | screenshots, injected axe-core, `assertStates` | passed | Chrome's accessibility tree ignores `aria-valuetext` on native range inputs (same for existing widgets); no screen-reader run |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | PointerDrag, dimension steps, color foundation and handle recipes reused; no picker import |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | V-07 |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | `removable`, `min-stops`, `size`, `interpolation`, RTL |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | spec searched (no section); references searched; scope from the user's answers. |
| 1. Capability mapping                 | passed | C-01…C-14; S-01 pending spec section. |
| 2. Architecture and composition reuse | passed | family dependency map. |
| 3. Behavior                           | passed | V-01, V-02, V-04, V-05, V-06. |
| 4. Presentation and customization     | passed | V-07; goldens unaffected; recipe through shared handle and swatch rules. |
| 5. Accessibility                      | passed | V-07. |
| 6. Visual and interaction inspection  | passed | V-01, V-02, V-07. |
| 7. Documentation and demo reuse       | passed | `docs/widgets/gradient-picker.mdx`, check-docs passes; story. |
| 8. Regression and reconciliation      | passed | `npm test`, lint, typecheck, build; React and Vue lanes and smoke 202/202. |

## Documentation synchronization

- [x] `docs/widgets/gradient-picker.mdx` and the README link; `check-docs.mjs widgets/gradient-picker` passes.
- [x] JSDoc covers properties, events, parts and callbacks.
- [x] `elementDependencies` lists Button.
- [x] Verification fixtures are separate from the page.
- [x] Previews reuse library components (Color input, Input).
- [x] Preview code works outside Storybook.

## Completion / handoff

- Change summary: widget `tp-gradient-picker` (renamed from `tp-color-gradient-input`): a linear variant (stops with midpoints) and a field variant (anchors blended by distance, extracted from skybox-studio), selection, add/move/remove by pointer and keyboard, sampling and rendering helpers.
- Actual delivery claim: the complete widget as scoped by the user.
- Record checker: see the final report.
- Non-browser checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, check-docs, check-ledger.
- Behavior: V-01, V-02, V-04, V-05, V-06.
- Accessibility: V-07; no screen-reader run.
- Visual/customization/motion inspection: V-07.
- Documentation and demo composition reuse: gate 7.
- Shared-consumer regressions / package boundaries: widget catalog tests; main index and register untouched.
- Required failures or blocked checks: none.
- Older out-of-scope gaps: S-01 spec section pending.
- Changed source revisions / reopened gates: none open.
