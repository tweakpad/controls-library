# Component implementation and evidence record

Copy to `plans/components/<component>/implementation-checklist.md` (widgets:
`plans/widgets/<widget>/implementation-checklist.md`). Replace
bracketed fields and expand the tables for the actual task. Keep this file updated
through the gates; do not check boxes merely because code was written.
Keep the named sections, table columns and IDs below: the skill's record checker
uses them. Add rows and detail, not replacement prose. Keep status cells to the
documented status vocabulary and put reasons/evidence in their own cells. Escape
literal pipes inside table cells. A recorded defect does not clear a gate.
For a read-only review, use these fields in the response or an authorized report;
do not create a checklist file unless writing one is in scope.

## Delivery and source record

- Component(s) / public identity: Layout compositions across 89 docs pages and four story/example modules; existing tp-stack.
- Requested work / claim: Complete migration of compatible inline flow layouts; preserve grids, semantic and constrained-layout exceptions with explicit dispositions.
- Scope source: User: simplify/redo inline layouts using Stack without breaking existing use cases.
- In-scope changes and existing gaps: No component redesign; fix Stack color inheritance and host sizing as prerequisites. Review all 473 inline flex/grid sites. Retain unsupported layouts with concrete reasons rather than change their behavior.
- Repository baseline / unrelated changes: a5c449b2; preserve untracked plans/use-case-styles and scripts/audit-use-case-styles.mjs.
- Live project / document IDs and revisions: Project prj_c5a403a0-d1d5-4487-ac78-f4e545f46483, 6720183f / 0.56.21. Fresh Foundation, Component Library and Widgets document reads.
- Owning contracts / dependencies / vocabulary: ucl22-stack; writing direction, shared presentation, Form/Popover named slots and native semantics.
- Local reference evidence: Local external/ui registry flex/grid patterns inspected during Stack implementation (63c1308); Stack current source and family inspected. Native semantic wrappers remain native.
- Tool readiness: Direct tools available; baseline captured through Chrome MCP.
- Browser / server / build under test: Chrome MCP, static Storybook :5176, dark + reduced motion, 1100x850 and 420x850. One iframe at a time.
- Evidence directory: `tmp/component-verification/layout-migration/`
- Durable verification fixtures / served URLs: Existing published docs pages and component fixtures; saved baseline geometry covers all 700 previews on the 89 affected pages.
- Evidence availability to the next agent: Raw baseline and build logs are ignored local artifacts. This gate record and RESULTS.md are durable.

## Capability and interface mapping

Use one row per capability, not merely one row per component. Include properties,
attributes, defaults, methods, events/cancellation, slots/parts, state hooks,
composition, behavior, accessibility, presentation and customization.
Include the exact constituent and source symbol, its defaults and independently
configurable options. Do not merge placement, visibility and action semantics into
one "actions" row. Every C-ID must link to existing V-IDs. Before implementation,
the mapping must be complete even though implementation/test statuses are pending.

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | Map scalar flex direction/gap/align/justify/wrap to existing Stack API; no token overrides | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-01, V-02 | pending | Planned migration |
| C-02 | Map one-column grid gap and justify-items to column Stack; preserve equal-track stretching; map explicitly distributed columns and bounded flex containers using the host-filling flex root | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-01, V-02 | pending | Planned migration |
| C-03 | Preserve semantic parents, legends, IDs, slots, form associations, native labels and DOM order | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-01, V-03 | pending | Planned migration |
| C-04 | Preserve script behavior, Default story pairing, text and copyable snippet content | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-01, V-03 | pending | Planned migration |
| C-05 | Preserve inherited text color in Stack, theme/density and dimensions | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-02, V-03 | pending | Planned migration |
| C-06 | Explicitly disposition remaining layouts and dynamic style writes; no blind grid replacement | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-01 | passed | All 473 original sites and remaining 117 flow sites dispositioned in RESULTS.md. |
| C-07 | Regress every affected docs page at narrow and desktop widths, build both renderings | ucl22-stack / native composition contracts | Authored baseline and Stack source | Stack composition | Existing pages | V-02, V-04 | pending | Planned migration |

Record spec/reference conflicts here before dependent implementation:

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |

For catalog-wide work, also reconcile every reference identity with a catalog,
composition or Foundation exposure, evidence and any gap. Attach/reference that
inventory; matching names or catalog totals do not prove coverage.

## Architecture and reuse

- Component folder and responsibility boundaries: Reuse existing Stack for native flex layout; map one-column grid cross alignment to Stack align. Retain unsupported tracks/sizing. Preserve semantic hosts and legends; do not wrap named-slot children.
- Supported exports / registration / constituent API impact: No public API, registration or export changes; existing Stack color inheritance corrected.
- Framework bindings: Public surface unchanged; no new bindings needed. Existing generated bindings must remain unchanged after the build.
- Public vocabulary / tokens / parts / presentation review: Use existing numbered Stack gaps; no new tokens or CSS-variable overrides. Leave genuine grid tracks and dimensions explicit.

### Family dependency map

Trace reference reexports/imports to implementation owners and inspect corresponding
local components. Name both the old owner and the planned shared owner if extracting
one; list the actual consumers that will use it. Low-level utility reuse alone is
insufficient. For a primitive without family dependencies, record the inspected
sources and concrete reason instead of omitting this map.

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Layout and child ownership     | One-axis flex composition; native form/legend semantics and existing named-slot component contracts | components/stack/stack.ts; components/form/form.ts; presentation/families/form.ts; component docs scripts and source templates                 | Reuse TpStack; preserve IDs/listeners and semantic parent tags; retain component-owned slot layouts. Stack must inherit parent text color.             | Every file and preview listed in RESULTS.md; V-01 through V-04                   |

### Presentation source map

Follow the selected registry base and preset through external stylesheets, tokens
and responsive selectors. Map every meaningful region to a library component or
recipe. Record contract/theme adaptations and absent optional regions explicitly.
For a change without presentation impact, document the dependency evidence here.

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Existing use-case layout wrappers             | Existing authored examples (baseline a5c449b2); current library tokens/components            | All 473 inline flex/grid sites inventoried; existing Stack uses native flex root and token gaps       | TpStack and its shared Foundation/presentation infrastructure                    | Replace only equivalent flow; preserve unsupported geometry rather than move it into hidden CSS. Preserve nested color inheritance. | V-01         |

### Implementation and composition reuse map

List nested UI roles in component internals, stories, docs, snippets and fixtures.
Use existing library components; record the contract or deliberate test purpose
for native anatomy that could otherwise look like a substitute.

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| All migrated docs Preview/Code and story snippets         | Existing controls and content; wrappers only      | Existing library controls and tp-stack; no local substitutes                     | V-01 through V-04                      | Keep semantic form/fieldset/legend/link/list hosts where required; genuine grids retain native layout.                              |

## Verification scenarios

Plan all applicable requirements/states and interacting combinations before
implementation; add newly discovered cases. Status vocabulary: `pending`,
`passed`, `failed`, `blocked`, `not applicable`. Non-applicability requires
source/capability evidence. Tool limitations are blocked, not passed or N/A.

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01 through C-07; source | Parse all changed previews/templates; compare semantic tags, attributes, text, sensitive content and script logic | No unintended semantic/content edits | 700 previews pass; 335 Stacks added in 280 previews / 87 pages | Source parity JSON and 97-page docs checker | passed | No source parity failures |
| V-02 | C-01,C-02,C-05,C-07; layout | Paired 1100px/420px static docs comparison | No unexplained changes | Final pass reached 60/89 pages; initial pass covered all 89 and caught retained cases | Chrome MCP; paired-comparison-status.json | blocked | MCP stopped responding; remaining 29 pages not signed off |
| V-03 | C-03,C-04,C-05; interaction/a11y | Native forms, slot popups, large Select, lazy Tree, Roadmap, real keyboard/AX | Behavior preserved | Source semantics preserved; runtime interaction pass unfinished | Chrome MCP | blocked | Connection unavailable; no substituted driver or inferred pass |
| V-04 | C-07; docs/build/regression | Full suite, lint, types, static Storybook/site and browser review | All checks and both renderings verified | Unit/docs/library/Storybook/lint/types/isolated website pass; browser review incomplete | Logs in evidence directory | blocked | Final browser review requires MCP reconnection |


Record viewport, theme, direction, motion conditions and relevant browser features
for visual/interaction rows. Record what was visually inspected as well as the
screenshot path. Distinguish API evaluation, real input, accessibility tree,
automated analysis and screen-reader evidence. Do not reuse stale passes after
changes that affect them.

## Early integration checkpoint

Complete after the first integration, before exhaustive browser verification.
Inspect the actual diff and first rendered composition; do not infer these passes
from planned architecture, tokens, utility imports or accessibility results.

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Stack owns flow; existing Form owns its field gap; named slots and semantic hosts preserved. Transfer form uses its existing Form recipe rather than a competing Stack gap.      |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | Chrome captures match saved geometry for Button group, Checkbox, Popover, Slider, Switch and Text editor at both widths after fixing the transfer form. Stack color and padded fixed/minimum sizes separately verified. |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | Source semantic tags/attributes/text unchanged for all 700 previews; native legends and slot assignments retained; per-item grid justification translated to flex alignment.     |

## Gate record

Keep every gate, including pending later gates. Replace the exit descriptions with
concrete evidence when passing them. Any failed dependency reopens affected gates.
Use `not applicable` only with contract/scope evidence, never for an unimplemented
requirement. Run the checker with `--stage implement`, then `verify`, then `complete`
at the work boundaries specified in SKILL.md.

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Fresh contracts and explicit source inventory above; baseline captured for every affected page.                                       |
| 1. Capability mapping                 | passed | All sites classified; preserve unsupported tracks, native list structure, constrained geometry and named-slot ownership.                         |
| 2. Architecture and composition reuse | passed | Reuse Stack; native semantic hosts preserved; fix color inheritance and use a one-cell host grid so the flex root fills assigned host dimensions; no parallel controls or unrelated redesign. |
| 3. Behavior | blocked | Semantic/source parity passes; final runtime interaction checks require Chrome MCP. |
| 4. Presentation and customization | blocked | Stack inheritance/fixed sizes pass; paired comparison reached 60 pages; remaining visual scenarios unfinished. |
| 5. Accessibility | blocked | Real input, AX and Axe checks on migrated use cases require Chrome MCP. |
| 6. Visual and interaction inspection | blocked | Initial candidate pass captured all 89 pages; final paired pass completed 60; 29 remain after connection failure. |
| 7. Documentation and demo reuse | blocked | 97-page checker and source parity pass; final website/Storybook browser review incomplete. |
| 8. Regression and reconciliation | blocked | Repository checks pass as recorded; final browser matrix not signed off. |

## Documentation synchronization

- [ ] All affected MDX pages follows the tweakpad-docs skill (structure, style, merge ledger); `check-docs.mjs --all --no-tests` passes; the story renders it with `libraryDocs()`; the tag is off `scripts/docs/pending.json`.
- [ ] JSDoc covers the element summary, every public field and method, slots, events and CSS properties; parts carry a description in the family; `npm run build` reports no undescribed row.
- [ ] `elementDependencies` is complete, so the website's Related lists what renders the element.
- [ ] Verification fixtures are separate from the page (tests/fixtures or `!autodocs` stories).
- [ ] Rendered and copyable previews reuse existing components; scripts import only what previews may.
- [ ] Preview code works outside Storybook: registration is the page's, imports are the package's.

## Completion / handoff

- Change summary: Replace ordinary inline flow CSS with Stack; preserve semantic/native and component-owned layout. Stack now inherits text color and fills assigned host geometry.
- Actual delivery claim: Implementation and source/build checks delivered; browser verification incomplete. No complete-component or no-regression claim while Chrome MCP is unavailable.
- Record checker: implement and verify checks passed; complete correctly reports blocked gates/scenarios. No complete pass claimed.
- Non-browser checks: Full suite: 447 files, 6274 passed / 3 skipped in 194.63s; library build and Storybook build pass; 97-page docs checker passes; full lint and typecheck (all five frameworks) pass; isolated website build passes for 117 pages / 97 docs pages; package smoke and size-report tree-shaking pass (98 bundles).
- Behavior: Source parity preserves all control tags/attributes/text and scripts outside four changed layout templates. Final interaction pass pending Chrome reconnection.
- Accessibility: Blocked: final real-input/AX/Axe checks require Chrome MCP. Earlier Stack focus/AX evidence does not certify every migrated use case.
- Visual/customization/motion inspection: See RESULTS.md and paired-comparison-status.json; 60 paired final pages at both widths. Initial complete candidate pass identified compatibility cases; not a final all-pages pass.
- Documentation and demo composition reuse: 280 previews on 87 pages use 335 new Stack elements. Native semantic parents and named slots preserved; 15 geometry-sensitive use cases retained. No screenshot-count substitute for pending browser checks.
- Shared-consumer regressions / package boundaries: No public APIs or generated framework files change. Stack runtime style changes are covered by source checks and browser inheritance/geometry fixture; full 447-file unit suite passes.
- Required failures or blocked checks: Chrome DevTools MCP nonresponsive, including list_pages. Request to reconnect sent; no alternate driver used.
- Older out-of-scope gaps: Original component conformance beyond changed compositions is not claimed; pre-existing unrelated work remains preserved.
- Changed source revisions / reopened gates: Baseline a5c449b2; Stack public API unchanged. Reopened visual/docs gates after retaining 15 geometry-sensitive previews; final paired pass reached 60 pages.

A complete-component claim requires every applicable required gate to pass. A
bounded fix reports its boundary and older gaps without certifying the component.
