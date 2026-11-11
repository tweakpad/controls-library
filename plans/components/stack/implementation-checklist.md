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

- Component(s) / public identity: Stack / tp-stack
- Requested work / claim: Complete component implementation
- Scope source: User: Implement the approved responsive Stack plan; existing demos are not migrated.
- In-scope changes and existing gaps: Stack only, necessary shared-base extraction and generated integrations; existing example migrations excluded.
- Repository baseline / unrelated changes: d26ea678; preserve untracked plans/use-case-styles and scripts/audit-use-case-styles.mjs
- Live project / document IDs and revisions: UI Library 0.56.21, commit 6720183f; Foundation and Component Library read through direct MCP.
- Owning contracts / dependencies / vocabulary: ucl22-stack; Foundation sec-45-direction-identifiers-and-environment-ownership; shared presentation contract.
- Local reference evidence: external/ui 63c1308, clean; registry/bases/radix/ui/button-group.tsx: native flex, stretch, column variants; no general Stack in local reference.
- Tool readiness: Direct tools registered; browser source and built connections verified.
- Browser / server / build under test: Chrome MCP session; source fixture :5174, static Storybook :5176, isolated website :5175; source and built React/Vue fixtures.
- Evidence directory: `tmp/component-verification/stack/2026-11-08/`
- Durable verification fixtures / served URLs: `tests/fixtures/components/stack/index.html` and `assertions.js`; source and ?package framework fixtures.
- Evidence availability to the next agent: Screenshots and raw logs are local ignored artifacts; durable fixture and this record travel with the repository.

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
| C-01 | direction column; row/column scalar or map | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-02 | gap 0; existing numeric and fractional spacing tokens | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-03 | align stretch; start/center/end/stretch/baseline | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-04 | justify start; start/center/end/space distributions | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-05 | wrap nowrap; nowrap/wrap/wrap-reverse | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-06 | Fixed xs/sm/md/lg/xl own-width CSS queries; sparse maps | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-07 | JSON attributes, reflection, validation, removal and replacement updates | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-08 | Default slot and root part; unchanged DOM/focus/semantics | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-09 | Shared Foundation, theming/density, lifecycle, stylesheet caching | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-10 | Catalog/package and generated framework object property projections | ucl22-stack | Local reference layout; approved user API | Stack config and Lit element | components/stack | V-01, V-02 | passed | Unit/config and Chrome fixture coverage; React/Vue source and built scenarios. |
| C-11 | The root fills the host whatever display an owning layout assigns it (2026-11-11: a Stack as a Form `actions` child shrank to its content and was pushed to the end) | ucl22-stack | Form actions `surfaceFooterLayout` | `.root { flex: 1 1 auto }` | none | V-03 | passed | Calendar Schedule a call summary at the start edge; root 326 px of 326 |

Record spec/reference conflicts here before dependent implementation:

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |

For catalog-wide work, also reconcile every reference identity with a catalog,
composition or Foundation exposure, evidence and any gap. Attach/reference that
inventory; matching names or catalog totals do not prove coverage.

## Architecture and reuse

- Component folder and responsibility boundaries: One shared Foundation base, compatibility TpElement subclass, Stack folder owning finite responsive config and root layout.
- Supported exports / registration / constituent API impact: Add Stack catalog/export/registration; retain all existing exports.
- Framework bindings: Regenerated from manifest; all five type compilers pass; source and built React/Vue props and Stack smoke pass; ledger updated and checker passes.
- Public vocabulary / tokens / parts / presentation review: Use ucl22-stack vocabulary; existing spacing scale; stack-root alias root.

### Family dependency map

Trace reference reexports/imports to implementation owners and inspect corresponding
local components. Name both the old owner and the planned shared owner if extracting
one; list the actual consumers that will use it. Low-level utility reuse alone is
insufficient. For a primitive without family dependencies, record the inspected
sources and concrete reason instead of omitting this map.

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Shared element lifecycle and CSS transport     | No general layout owner in reference; button-group composes joined controls, unlike independent Stack children. | foundation/element.ts; foundation/generated-style.ts; components/shared/stack-group.ts                 | Extract common element base without direction getter; existing TpElement retains ltr/rtl; Stack owns flex direction. Reuse GeneratedStyleResource. Internal stack-group remains family-specific.             | Existing TpElement subclasses and new Stack; V-01, V-02                   |

### Presentation source map

Follow the selected registry base and preset through external stylesheets, tokens
and responsive selectors. Map every meaningful region to a library component or
recipe. Record contract/theme adaptations and absent optional regions explicitly.
For a change without presentation impact, document the dependency evidence here.

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| root             | Local registry native flex layout; theme spacing adaptation            | button-group.tsx root flex/items-stretch and vertical flex-col; independent children require gap rather than joined borders       | Shared Foundation and GeneratedStyleResource                    | No duplicated widget/control anatomy; native root flex and slot | V-01         |

### Implementation and composition reuse map

List nested UI roles in component internals, stories, docs, snippets and fixtures.
Use existing library components; record the contract or deliberate test purpose
for native anatomy that could otherwise look like a substitute.

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Stack documentation and fixture         | Actions and separators      | tp-button / tp-separator                     | V-02                      | Native root and slot are layout anatomy only.                              |

## Verification scenarios

Plan all applicable requirements/states and interacting combinations before
implementation; add newly discovered cases. Status vocabulary: `pending`,
`passed`, `failed`, `blocked`, `not applicable`. Non-applicability requires
source/capability evidence. Tool limitations are blocked, not passed or N/A.

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01 through C-10; unit/build/package | Config, CSS, common base, framework compilation | Contract values and package integration | passed | Full suite 6274 pass; types/build/package/size pass | passed | Logs under local evidence directory |
| V-02 | C-01 through C-10; browser/visual/a11y/performance | Chrome fixture, exact boundaries, nesting, RTL, density, real Tab, AX, Axe, framework props | Correct layout and unchanged semantics | 26 checks pass; 100 instances 17.9–20.4 ms; 0 resize updates | Chrome MCP; browser.json | passed | Dark/light screenshots observed; root part custom padding 7px verified |
| V-03 | C-11; browser | Stack with `justify="space-between"` in a tp-form `slot="actions"`, Calendar docs Schedule a call | summary at the start, button at the end | output starts at the stack start; stack root 326/326 px | DevTools evaluate, `tmp/component-verification/calendar/schedule-fill.png` | passed | Observed values recorded in Actual result |

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
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | TpElement now inherits unchanged common base; Stack uses the same base and GeneratedStyleResource; old direction getter retained.      |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | MCP fixture renders native flex root and existing buttons; CSS direction and token gap confirmed; no local control substitutes. |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | MCP evaluated direction, gap, alignment, distribution and wrapping independently; children retained.     |

## Gate record

Keep every gate, including pending later gates. Replace the exit descriptions with
concrete evidence when passing them. Any failed dependency reopens affected gates.
Use `not applicable` only with contract/scope evidence, never for an unimplemented
requirement. Run the checker with `--stage implement`, then `verify`, then `complete`
at the work boundaries specified in SKILL.md.

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Direct contract commit 6720183f; scope and reference above.                                       |
| 1. Capability mapping                 | passed | C-01 through C-10 cover approved API, defaults, slots, packaging and lifecycle; contract resolved.                         |
| 2. Architecture and composition reuse | passed | Shared base and generated stylesheet owners mapped; no separate controls or family layout rewrites. |
| 3. Behavior                           | passed | Chrome fixture evidence, native focus/AX and themed screenshots; root CSS part verified; full unit suite passes. |
| 4. Presentation and customization     | passed | Chrome fixture evidence, native focus/AX and themed screenshots; root CSS part verified; full unit suite passes. |
| 5. Accessibility                      | passed | Chrome fixture evidence, native focus/AX and themed screenshots; root CSS part verified; full unit suite passes. |
| 6. Visual and interaction inspection  | passed | Chrome fixture evidence, native focus/AX and themed screenshots; root CSS part verified; full unit suite passes. |
| 7. Documentation and demo reuse | passed | Docs checker passes; all nine Stack instances render in both static docs systems. Responsive example widths 858px Storybook and 590px website correctly produce row; no inline style attributes. Website build: 117 pages. |
| 8. Regression and reconciliation | passed | Full unit suite, lint, typecheck, framework positive/negative types, final build/package smoke, size/tree-shaking, Storybook and isolated site build pass. Source/built React/Vue props and smoke pass; ledger checker passes. |

## Documentation synchronization

- [x] `docs/components/stack.mdx` follows the tweakpad-docs skill (structure, style, merge ledger); `check-docs.mjs <section>/stack` passes; the story renders it with `libraryDocs()`; the tag is off `scripts/docs/pending.json`.
- [x] JSDoc covers the element summary, every public field and method, slots, events and CSS properties; parts carry a description in the family; `npm run build` reports no undescribed row.
- [x] `elementDependencies` is complete, so the website's Related lists what renders the element.
- [x] Verification fixtures are separate from the page (tests/fixtures or `!autodocs` stories).
- [x] Rendered and copyable previews reuse existing components; scripts import only what previews may.
- [x] Preview code works outside Storybook: registration is the page's, imports are the package's.

## Completion / handoff

- Change summary: Add declarative scalar/responsive Stack layout to replace routine consumer flex CSS in future migrations.
- Actual delivery claim: Stack component, live contract, packaging, generated frameworks, own documentation and fixtures. No existing example migration.
- Record checker: implement and verify checks pass; complete check recorded below.
- Non-browser checks: 447 unit files pass, 6274 tests pass and 3 skip; typecheck and framework positive/negative cases pass; build and package smoke pass; size report verifies tree-shaking across 98 bundles; docs checker passes; full lint passes.
- Behavior: 26 browser checks pass; source and built framework integration passes.
- Accessibility: Chrome accessibility tree contains the existing buttons with their names and no extra Stack role; real MCP Tab reaches First action then Second action. Axe: zero violations, 13 passes. No screen-reader testing claimed.
- Visual/customization/motion inspection: Chrome screenshots inspected in dark and light, 420px and 900px viewports; custom root CSS part padding verified at 7px without child replacement. Stack has no animation.
- Documentation and demo composition reuse: Storybook and website screenshots saved locally; all nine instances render, heading/API order is correct, Storybook has native docs tables and no Related; website uses no native tables. No Related is expected until another component consumes Stack.
- Shared-consumer regressions / package boundaries: All existing tests pass after base extraction; existing Button still resolves dir=rtl. Standard exports are preserved and the new shared base remains internal. Final tarball smoke and tree-shaking pass.
- Required failures or blocked checks: None remaining. The sandbox npm-cache restriction was resolved by running package smoke with normal cache access. The isolated site needed preserveSymlinks in its temporary config; no website source was changed.
- Older out-of-scope gaps: No unrelated component conformance claim; existing style-audit artifacts preserved.
- Changed source revisions / reopened gates: Contract 6720183f. Final static Storybook and website rebuilt and reread after preview correction. Internal Foundation base is excluded from the public barrel; final package smoke passes.

A complete-component claim requires every applicable required gate to pass. A
bounded fix reports its boundary and older gaps without certifying the component.
