# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Field group, `tp-field-group`
- Requested work / claim: bounded change: an inline variant for 2- and 3-value tuples (W/H, X/Y, X/Y/Z) that reads and stacks like the other inline controls and stays borderless in flat mode; remove the lock toggle from the documentation example.
- Scope source: user instruction, 2026-11-05.
- In-scope changes and existing gaps: `variant="inline"`, its row and label parts, member segments, docs, story control. The default variant is unchanged; no other Field group capability was re-verified.
- Repository baseline / unrelated changes: `development` with the uncommitted `copyable` work of the same session preserved.
- Live project / document IDs and revisions: UI Library `prj_c5a403a0-d1d5-4487-ac78-f4e545f46483`, head `4d63a66b`, Component Library §22.11 Field group (read through `spec_search`).
- Owning contracts / dependencies / vocabulary: §22.11 Field group; the shared inline control surface of Input (§17.4), Select (§18.1) and Color input (§17.12); Input group (§17.5).
- Local reference evidence: no reference implementation has an inline tuple; the presentation reuses the library's own inline rows.
- Tool readiness: Spec Blocks and Chrome DevTools MCP available.
- Browser / server / build under test: Chrome through DevTools MCP, Storybook dev server on 6006, Vite fixtures on 5173.
- Evidence directory: `tmp/component-verification/field-group/inline/`
- Durable verification fixtures / served URLs: `tests/unit/presentation/field-group-inline.test.ts`; framework fixtures `tests/fixtures/frameworks/{react,vue}/`.
- Evidence availability to the next agent: local only.

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | `variant` (`default` \| `inline`, default `default`): inline renders the shared inline row with `label` at the start and the members packed at the end | pending spec amendment (user request 2026-11-05) | inline Input / Select / Color input rows | `variant` property, `field-group-variant-inline` recipe (`inlineControlSurface`), label part | ### Inline | V-01, V-02 | passed | rows 32 px, values end where an inline Input's value ends |
| C-02 | Inline members become segments: prefix, value as wide as its text, suffix; no edge, fill, ring or radius of their own | pending spec amendment | Input group addons; joined-group member composition | `memberPresentation` hooks on `input`, `input-group`, `input-group-addon`, `input-group-control` | ### Inline | V-01, V-03 | passed | longhand hooks restore the joined seams exactly |
| C-03 | The row rings on focus within and turns invalid when a member is invalid; a press on the label edits the first value | pending spec amendment | inline Input row rings and label press | `inlineControlRings`, `membersSynced` data-invalid, `#rowPress` | ### Inline | V-02, V-04 | passed | real click, type, invalid |
| C-04 | Flat mode: no added edge or depth | Foundation appearance modes | `FLAT_ROLES` | row uses role tokens only | ### Inline | V-05 | passed | row edge transparent, no inner edges |
| C-05 | Lock toggle removed from the documentation example | user instruction | — | docs preview and two sentences | ### Mixed members | V-06 | passed | forced edits listed in the docs ledger |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-01 | §22.11 has no variant axis, label part or inline segment behavior | Field group docs, bindings | amend §22.11 after the user confirms | user request 2026-11-05 | pending |

## Architecture and reuse

- Component folder and responsibility boundaries: `src/components/field-group/field-group.ts` owns the variant, label, row press and invalid bridge; `TpJoinedGroup` gained `memberPresentation`, `memberPresentationKey`, `membersSynced` and `observedMemberAttributes` so each group decides its members' composition.
- Supported exports / registration / constituent API impact: `FieldGroupVariant` type; no new element.
- Framework bindings: regenerated with `npm run cem`; React and Vue props row `tp-field-group` and smoke 201/201; ledger row updated.
- Public vocabulary / tokens / parts / presentation review: `variant="inline"` and a `<family>-label` part as on Input, Select and Color input.

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Member composition | joined seams | `src/components/shared/joined-group.ts` `sync` | the joined presentation moved behind `memberPresentation`; Button group keeps the default | Button group, Field group / V-03 |
| Inline row paint | inline control surface | `recipes/shared/inline-control.ts` | reused as is | Input, Select, Color input, Slider, Field group / V-01 |
| Segment editors | Input group addons and joined editor | `components/input-group/input-group.ts` registered `input-group-control` | composed from outside; no Input group change | V-01 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| `field-group` (inline) | library inline rows | `inlineControlSurface`, `inlineControlRings` | shared inline control recipe | row gap space-3 between segments | V-01 |
| `field-group-label` | library inline rows | `inlineControlLabel` | shared inline control recipe | muted like the other inline labels | V-01 |
| member segments | Input group | `input-group`, `input-group-addon`, `input-group-control` | Input group | prefix and suffix keep their muted addon paint | V-01 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| docs ### Inline | value editors, prefixes | Input group, Input | V-01 | none |
| docs ### Mixed members | separator | Separator | V-06 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02; visual | stack of inline Input, Position (X/Y), Size (W/H), Rotation (X/Y/Z), Opacity, Fill; dark and light; with `px` suffixes; bare Inputs | 32 px rows, muted label, values packed at the end, last value 11 px from the edge like the Input | as expected | DevTools screenshots and measurement, `tmp/component-verification/field-group/inline/inline-stack.js` | passed | 34 px rows from the Input group grid and min-height found and fixed |
| V-02 | C-01, C-03; real input | click W, End, type 5 | row rings, value grows, W shifts left, nothing below moves | as expected | DevTools click, press_key, type_text | passed | Real input; screenshot shows the ring and the grown value. |
| V-03 | C-02; regression | default → inline → default on a group with Input groups and a bare Input; default Button group | identical member styles after the round trip; seams unchanged | identical | DevTools evaluate | passed | shorthand hooks left `background` behind; switched to longhands |
| V-04 | C-03; behavior | invalid Y; press the X prefix; press the label | red row ring; X focused; first value focused | as expected | DevTools click, evaluate | passed | label press dispatched from evaluate |
| V-05 | C-04; visual | stack inside `appearance="flat"` | no row edge, no inner edge or depth | as expected | DevTools screenshot | passed | Row border computed `rgba(0, 0, 0, 0)` in flat; inspected on screen. |
| V-06 | C-05; docs | docs page | no lock toggle; Separator preview keeps Price range | as expected | `check-docs.mjs components/field-group` | passed | Page check passes with three forced-edit ledger rows. |
| V-07 | C-01, C-03; accessibility | axe on the stack; group names | no violations; each group named, each editor keeps its label | as expected | injected axe-core, evaluate | passed | no screen-reader run |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | joined seams and inline segments both come from `TpJoinedGroup.memberPresentation` |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | V-01: the row matches the inline Input row |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | prefixes, suffixes, bare Inputs, 2 and 3 members |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | §22.11 read; scope from the user's request. |
| 1. Capability mapping                 | passed | C-01…C-05; S-01 pending spec amendment. |
| 2. Architecture and composition reuse | passed | joined-group hook; shared inline recipes. |
| 3. Behavior                           | passed | V-02, V-03, V-04. |
| 4. Presentation and customization     | passed | `field-group-inline.test.ts`; V-05. |
| 5. Accessibility                      | passed | V-07. |
| 6. Visual and interaction inspection  | passed | V-01, V-02, V-05. |
| 7. Documentation and demo reuse       | passed | ### Inline; lock removed; check-docs passes; story `variant` control. |
| 8. Regression and reconciliation      | passed | `npm test`, lint, typecheck, build; React/Vue props and smoke. |

## Documentation synchronization

- [x] `docs/components/field-group.mdx` ### Inline; `check-docs.mjs components/field-group` passes; forced edits listed in the ledger.
- [x] JSDoc covers `variant` and `field-group-label`; parts described in the family.
- [x] `elementDependencies` unchanged.
- [x] Verification fixtures are separate from the page.
- [x] Previews reuse library components (Input group, Input, Separator).
- [x] Preview code works outside Storybook.

## Completion / handoff

- Change summary: Field group `variant="inline"` for 2- and 3-value tuples on the shared inline row; lock toggle removed from the docs.
- Actual delivery claim: the inline variant and the docs change; the default variant only regression-checked (V-03).
- Record checker: see the final report.
- Non-browser checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, check-docs.
- Behavior: V-02, V-03, V-04.
- Accessibility: V-07; no screen-reader run.
- Visual/customization/motion inspection: V-01, V-05.
- Documentation and demo composition reuse: gate 7.
- Shared-consumer regressions / package boundaries: V-03 (Button group), framework props and smoke.
- Required failures or blocked checks: none.
- Older out-of-scope gaps: S-01 spec amendment pending.
- Changed source revisions / reopened gates: none open.
