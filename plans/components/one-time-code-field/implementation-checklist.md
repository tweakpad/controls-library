# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: One-time code field, `tp-one-time-code-field`
- Requested work / claim: bounded change — add the `underline` and `bubbles` variants (user request 2026-11-10); this record does not certify the rest of the component
- Scope source: user: "for the otp control we need to add two variants in style, the underline and the bubbles (separated circles used when there is no grouping)"; choices confirmed: bubbles keep groups with a wider gap and the dash, underline draws one line per cell
- In-scope changes and existing gaps: `variant` property and presentation axis; fix of the empty-code baseline space found while verifying; older behavior untouched and not re-verified
- Repository baseline / unrelated changes: development after 50621f9d with the uncommitted Patterns/Auth work in the same tree, preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, Component Library doc_8077bf7c…, section `ucl17-one-time-code`; amendment committed 7367f633 (0.57.2), bump 21e46129 (0.58.0)
- Owning contracts / dependencies / vocabulary: §17.6 One-time code field (`otcv-prop-0`, `otcv-q1`, definition summary variant axis); Foundation `sec-147-otpfield` unchanged
- Local reference evidence: no reference implementation offers these variants; geometry follows the library's own Tabs underline and full-radius tokens
- Tool readiness: Spec Blocks MCP and Chrome DevTools MCP available
- Browser / server / build under test: Chrome via DevTools MCP, Vite dev server (source)
- Evidence directory: `tmp/component-verification/one-time-code-field/variants/`
- Durable verification fixtures / served URLs: `tests/fixtures/components/one-time-code-field/index.html`
- Evidence availability to the next agent: local only

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | `variant` (default `default`): `underline` draws only a line under each slot, separated by a gap; the active slot's line turns the ring color and doubles inward | `otcv-prop-0`, `otcv-q1` | Tabs underline geometry `src/presentation/recipes/tabs.ts` | `variant` property (reflected), family axis, `one-time-code-field-slot-variant-underline` | ### Variants | V-01, V-02, V-04 | passed | real typing in DevTools |
| C-02 | `bubbles`: every slot a separate circle with the field edge; focus, invalid and disabled as in the joined strip | `otcv-prop-0`, `otcv-q1` | `--tp-radius-full` users (badge, avatar) | `one-time-code-field-slot-variant-bubbles` | ### Variants | V-01, V-03, V-04 | passed | real typing and selection |
| C-03 | Groups stay apart in every variant: wider root gap and the separator | `otcv-q1` | existing separator part | `-variant-underline/-bubbles` root and group gaps | ### Variants | V-01 | passed | measured gaps 8 px / 40 px |
| C-04 | An empty code takes the same height as a filled one | `otcv-q1` (no layout change from content) | Text control editors top-aligned (`src/components/field/text-control.ts`) | `.root` and host `vertical-align: top` | none | V-05 | passed | 38 → 32 px when empty |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | No variant axis in §17.6 | bindings, docs | add the axis and requirement | Spec Blocks 0.58.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged; one property and presentation keys
- Supported exports / registration / constituent API impact: `OneTimeCodeVariant` type exported from the component index
- Framework bindings: regenerated with `npm run cem`; React and Vue props matrix and smoke 201/201 rerun; ledger row updated
- Public vocabulary / tokens / parts / presentation review: axis named `variant` (the base `appearance` property is flat/default); edges through `fieldEdge`, `fieldFocus`, `fieldInvalid`, ring and destructive roles

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Slot boundary, focus, invalid paint | `src/presentation/recipes/shared/text-control.ts` | `fieldBoundary`, `fieldFocus`, `fieldInvalid` | reused unchanged; variants override shape only | Auth pattern verification screens; V-01 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Slot | library field recipe | `one-time-code-field-slot` base rules | `src/presentation/recipes/one-time-code-field.ts` | underline: line only; bubbles: full radius; default unchanged | V-01 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Docs ### Variants | label, errors | Field | V-06 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02, C-03; visual | fixture, dark and light themes | default joined; underline lines `0 0 1px 0`, 8 px apart; bubbles circles 32×32 full radius; groups 40 px apart with the dash; invalid, disabled, masked in each | as expected | DevTools evaluate `slots()`, `dark.png`, `light.png` | passed | Compact density not inspected |
| V-02 | C-01; real input | click underline code, type 135 | 4th slot active: ring-colored inset line, no outline, caret; characters fixed | as expected | DevTools click, type_text, `underline-active.png` | passed | Observed values recorded in Actual result |
| V-03 | C-02; real input | click bubbles code, type 24, Shift+ArrowLeft | active circle ringed; selection fill on the slot | as expected | DevTools type_text, press_key, `bubbles-active.png` | passed | Observed values recorded in Actual result |
| V-04 | C-01, C-02; accessibility tree | snapshot | one textbox per field named by its Field, in every variant | as expected | DevTools snapshot | passed | axe not run |
| V-05 | C-04; layout | measure hosts empty vs filled | equal heights | 32 px both (was 38 vs 32) | DevTools evaluate | passed | Observed values recorded in Actual result |
| V-06 | C-01..C-03; docs and bindings | `check-docs.mjs components/one-time-code-field`; React/Vue props matrix and smoke | pass | pass; 201/201 | node, DevTools | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | variants reuse the field boundary, focus and invalid recipes |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | default output unchanged (unit test) and V-01 |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | variants × grouping × invalid/disabled/masked in V-01 |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec 0.58.0; bounded variant change from the user request |
| 1. Capability mapping                 | passed | C-01..C-04 |
| 2. Architecture and composition reuse | passed | shared field recipes reused; no new owner |
| 3. Behavior                           | passed | V-02, V-03, V-05 |
| 4. Presentation and customization     | passed | `tests/unit/presentation/one-time-code-variants.test.ts`, V-01 |
| 5. Accessibility                      | pending | V-04 tree passed; axe not run for the new variants |
| 6. Visual and interaction inspection  | passed | V-01..V-03 both themes |
| 7. Documentation and demo reuse       | passed | ### Variants, story control, docs check |
| 8. Regression and reconciliation      | passed | npm test, lint, typecheck, bindings 201/201 |

## Documentation synchronization

- [x] `docs/components/one-time-code-field.mdx` ### Variants; `check-docs.mjs components/one-time-code-field` passes.
- [x] JSDoc for `variant` and the `OneTimeCodeVariant` type.
- [x] `elementDependencies` unchanged.
- [x] Verification fixture separate from the page.
- [x] Previews reuse Field and Stack.
- [x] Preview code uses package registration only.

## Completion / handoff

- Change summary: `variant` axis with underline and bubbles looks; empty-code baseline fix
- Actual delivery claim: the two variants and the height fix, verified in Chrome (dark, light)
- Record checker: `check-gates.mjs --stage verify`
- Non-browser checks: npm test, lint, typecheck
- Behavior: V-02, V-03, V-05
- Accessibility: tree only (V-04); axe pending
- Visual/customization/motion inspection: V-01..V-03
- Documentation and demo composition reuse: V-06
- Shared-consumer regressions / package boundaries: bindings 201/201
- Required failures or blocked checks: none
- Older out-of-scope gaps: the component had no record before; its other capabilities are not re-verified here
- Changed source revisions / reopened gates: none
