# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: library-wide density mode: the `density` attribute on any element and the reflected `density` property of every library element (`TpElement`); token roles `spacing` and `spacing-compact`.
- Requested work / claim: a usable, documented compact mode that works in scoped regions, mixed in one document (user 2026-11-01: "compact mode was reportedly missing consumers dont know how to use it. We need to make sure this can be used by scopes for mixed usage on the same document").
- Scope source: the user's message above; decisions by the user: selector `density` attribute (with library elements reflecting a `density` property), compact seed 0.1875rem.
- In-scope changes and existing gaps: density regions in `styles.css`, host rules in `TpElement`, environment observers, single-line editors on the control-height role (Input, inline Input, Input group, inline Color input), styling guide. Gap kept: an inline Color input of `size="sm"` is 32px instead of 28px (pre-existing, unchanged).
- Repository baseline / unrelated changes: `development` at c9b6d52 (v0.2.1), clean tree before this work.
- Live project / document IDs and revisions: UI Library read at v0.54.0, amended at v0.54.1 (`74953cee`) and bumped to v0.55.0 (`e73eeaeb`); Component Library `doc_8077bf7c-…` §5.3 (`tbl-cl-foundational-scales-r1`), §5.5 mode override law (`req-cl-54-values-only`, `req-cl-54-scoped`), §10.6 (`size` axis). Foundation `doc_cd3c4721-…` has no density contract.
- Owning contracts / dependencies / vocabulary: `req-cl-54-scoped` (region-scoped modes re-resolve every role), `req-cl-53-control-size` (single-line controls take a control-height role), `req-cl-53-spacing`.
- Local reference evidence: none in the reference libraries; the library's own `motion-policy` region attribute is the precedent for the selector.
- Tool readiness: direct Spec Blocks MCP and Chrome DevTools MCP available.
- Browser / server / build under test: Chrome via DevTools MCP; Vite dev server `127.0.0.1:5180` on sources; `npm run build` dist.
- Evidence directory: `tmp/component-verification/density/` (local only).
- Durable verification fixtures / served URLs: `tests/fixtures/components/density/index.html` (`densityAPI.assertDensity()`, README).
- Evidence availability to the next agent: local only.

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | `density="compact"` on any element selects the compact seed for it and its descendants; `density="default"` restores the theme's seed; regions nest | `req-cl-54-density`, `req-cl-54-density-select`, `req-cl-54-scoped` | `motion-policy` region rules | `styles.css` `[density='default']`, `[density='compact']` | styling.md Density | V-01, V-03 | passed | D01, D03 |
| C-02 | Every seed-derived role re-resolves in a region (space, control heights, icon sizes, ring offset, shadows) | `req-cl-54-density-derived`, `req-cl-54-scoped` | — | `:root, [density=…]` rule from `DENSITY_DERIVED_ROLES` (`src/foundation/density.ts`); drift guard in `presentation.test.ts` | styling.md Density | V-01, V-02 | passed | D01, D02, unit test |
| C-03 | Library elements accept a reflected `density` property and attribute with the same effect inside other shadow roots | `req-cl-54-density-select` | `motionPolicy` | `TpElement.density`, `:host([density=…])` rules | styling.md Density; API Reference | V-04, V-07 | passed | D04, D07 |
| C-04 | Portaled popups resolve the region's density and follow a live change | `req-cl-54-density-portal` | `OwnedPortal` token copy | `composed-environment.ts`, `toast.ts` attribute filters gain `density` | styling.md Density | V-05, V-06 | passed | D05, D06 |
| C-05 | Theme sets each mode's seed through `spacing` and `spacing-compact` only | `req-cl-54-density-theme`, `tbl-cl-foundational-scales-r1` | — | `--tp-spacing-compact` on `:root`; `--_tp-spacing-default` captures the root seed | styling.md Density, Token families | V-08 | passed | themed seed reaches region and shadow host |
| C-06 | Single-line editors keep the control height in every density | `req-cl-53-control-size`, `req-cl-54-density-size` | `controlStepDeclarations` | Input `input` key block size; inline Input and Input group joined block size; Color input inline swatch and value; editor and Select root top-aligned | — | V-02, V-09 | passed | 24px compact, 32px default |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | No density mode, selector, portal continuity or seed role in either document | every component, portals, themes | Add `spacing-compact` to §5.3 and density requirements to §5.5 | CL §5.3 row and §5.5 `req-cl-54-density*` committed at v0.54.1, bumped to v0.55.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: `src/foundation/density.ts` owns the derived-role list; `styles.css` states it for document regions; `TpElement` for hosts.
- Supported exports / registration / constituent API impact: new `density` property on every library element; new token role `--tp-spacing-compact`.
- Framework bindings: `npm run cem` regenerated 196 files (the `density` property on every element); React and Vue smoke 201/201 and the Slider lane pass; ledger check passes.
- Public vocabulary / tokens / parts / presentation review: `density` mirrors `motion-policy`; values `default`, `compact`.

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Region-scoped mode | `motion-policy` region attribute | `styles.css` `[motion-policy]`, `TpElement` `:host([motion-policy])` | same pattern for `density` | every element / V-01, V-04 |
| Portal theme continuity | owned portal token copy | `OwnedPortal` copies computed `--tp-*`; `ComposedEnvironmentObserver` | reused; observers watch `density` | Select, Menu, Popover, Toast / V-05, V-06 |
| Single-line height | control step table | `controlStepDeclarations` (block size from control-height, no block padding) | Input now follows it; joined editors use `joinedEditorMinHeight` | Input, Input group, Color input / V-09 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Token scale | default token set | `styles.css` `:root` | seed and derived roles | derived roles moved into a density-aware rule | V-01 |
| Input editor | text-control recipe | `shared/text-control.ts` `fieldBoundary` | `inputRules` | block extent from `control-height-md` on the Input key | V-09 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| density fixture | regions | Card, Button, Input, Select, Slider, Switch | V-01–V-07 | regions are native `section`/`div` |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02; behavior | compact vs default region | 24px vs 32px control height | as expected | D01 | passed | fixture |
| V-02 | C-02, C-06; visual | controls in both regions, dark and light | compact controls share one compact height | Button, Input, Select, Slider 24px; Switch smaller | D02, `regions-dark.png`, `regions-light.png` | passed | — |
| V-03 | C-01; nesting | default island in compact | 32px button | 32px | D03 | passed | — |
| V-04 | C-03; shadow root | Card `density="compact"` inside an app shadow root | compact | 24px | D04 | passed | — |
| V-05 | C-04; portals | Select popups in place and portaled to body | compact scale | 24 vs 32 default | D05 | passed | — |
| V-06 | C-04; live | toggle `density` with an open portaled popup | popup follows | 32 → 24 | D06 | passed | — |
| V-07 | C-03; property | `card.density = 'compact'` then unset | reflects, applies, clears | as expected | D07 | passed | — |
| V-08 | C-05; theme | `--tp-spacing-compact: 0.15rem` on `:root` | region and shadow host follow | 19.2px both | DevTools evaluate | passed | — |
| V-09 | C-06; regression | Input, inline Input, number Input, Input group, inline Color input, Select, Native select in both densities | control heights | 32/24 each; Native select 24.5 compact | DevTools evaluate | passed | inline Color input `sm` stays 32 (pre-existing) |
| V-10 | C-01, C-02, C-03, C-04, C-05, C-06; regression | unit suite, Select apiChecks, Input group contract, React/Vue smoke, build | unchanged | 6184 pass (one load timeout passes alone); Select 27/31 (4 known); Input group 2/2; smoke 201/201 | npm, DevTools fixtures | passed | — |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | one derived-role list feeds `TpElement`; `styles.css` guarded by a test; portals reuse `OwnedPortal` |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | default density unchanged (32px) except the inline Color input fix (34 → 32) |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | document regions, host attribute, property, nesting, portals, live change, theme seed |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec read at v0.54.0; S-1 resolved by the v0.55.0 density contract. |
| 1. Capability mapping                 | passed | C-01…C-06. |
| 2. Architecture and composition reuse | passed | maps above. |
| 3. Behavior                           | passed | V-01, V-03–V-08. |
| 4. Presentation and customization     | passed | tokens only; theme seed hook V-08. |
| 5. Accessibility                      | passed | sizes only; minimum targets keep their role; no semantics change. |
| 6. Visual and interaction inspection  | passed | V-02 dark and light. |
| 7. Documentation and demo reuse       | passed | `docs/styling.md` Density section, example fixed, token families. |
| 8. Regression and reconciliation      | passed | V-10, build, bindings, ledger. |

## Documentation synchronization

- [x] `docs/styling.md` documents density (usage, nesting, library-element property, portals, size composition, theme seeds) and no longer shows a scoped `--tp-spacing` override.
- [x] JSDoc covers `TpElement.density`.
- [x] `elementDependencies` unchanged.
- [x] Verification fixtures are separate from the docs.
- [x] Examples reuse library components.
- [x] Example code works outside Storybook.

## Completion / handoff

- Change summary: library-wide `density` regions with a compact mode, usable in mixed scopes.
- Actual delivery claim: as mapped above.
- Record checker: `check-gates.mjs --stage complete` passes.
- Non-browser checks: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run cem`.
- Behavior: V-01, V-03–V-08.
- Accessibility: no semantic change; no screen-reader run.
- Visual/customization/motion inspection: V-02.
- Documentation and demo composition reuse: gate 7.
- Shared-consumer regressions / package boundaries: V-10.
- Required failures or blocked checks: none.
- Older out-of-scope gaps: inline Color input `size="sm"` is 32px instead of 28px; Native select is 24.5px in compact (half a pixel over).
- Changed source revisions / reopened gates: none.
