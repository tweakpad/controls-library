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

- Component(s) / public identity: Width and centering of documentation previews and story compositions; no component runtime changes.
- Requested work / claim: Simplify incidental width framing with documentation-only responsive helpers; preserve purposeful geometry and semantics.
- Scope source: User: remove incidental demo framing, allow visual changes that preserve purpose, retain inline styles that demonstrate a capability; tests last.
- In-scope changes and existing gaps: Review all 583 width/centering sites in docs. Remove outer-only framing, preserve content geometry, scripts, scrolling, widget surfaces and purposeful capability constraints. Preview tooling gains optional width metadata; component APIs and runtime remain unchanged.
- Repository baseline / unrelated changes: f5094b03; clean working tree before this pass.
- Live project / document IDs and revisions: Project prj_c5a403a0-d1d5-4487-ac78-f4e545f46483, 6720183f / 0.56.21. Fresh Foundation, Component Library and Widgets document reads.
- Owning contracts / dependencies / vocabulary: ucl22-stack; writing direction, shared presentation, Form/Popover named slots and native semantics.
- Local reference evidence: Local external/ui registry flex/grid patterns inspected during Stack implementation (63c1308); Stack current source and family inspected. Native semantic wrappers remain native.
- Tool readiness: Direct tools available; baseline captured through Chrome MCP.
- Browser / server / build under test: Chrome MCP, static Storybook :5176, dark + reduced motion, 1100x850 and 420x850. One iframe at a time.
- Evidence directory: `tmp/component-verification/width-framing/`
- Durable verification fixtures / served URLs: Existing published docs pages and component fixtures; source baseline covers 97 pages and 745 previews; final width review covers the 62 modified pages.
- Evidence availability to the next agent: Working-tree source snapshot and check logs are local; this gate record and RESULTS.md carry the durable decisions.

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
| C-01 | Remove outer max-width, fill-width and auto-centering that only frame ordinary demos | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-01, V-02 | pending | Edits and final checks pending |
| C-02 | Keep viewport dimensions for scroll/overflow, measured text, ratio and widget editing surfaces | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-01, V-02 | pending | Edits and final checks pending |
| C-03 | Use demo-only width presets on Preview frames; copied code has no dependency on helper CSS | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-01, V-02 | pending | Edits and final checks pending |
| C-04 | Preserve content, control attributes, scripts, native parents and named-slot ownership | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-01, V-03 | pending | Edits and final checks pending |
| C-05 | Keep Default story and copyable snippets consistent; update authored-change ledgers | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-01, V-04 | pending | Edits and final checks pending |
| C-06 | Run final docs/build/unit and browser capability checks after edits; allow intentional visual changes | User-approved simplification / current component contracts | Existing demos, Preview renderer and library component source | Existing component APIs | Existing docs pages | V-02, V-03, V-04 | pending | Edits and final checks pending |

Record spec/reference conflicts here before dependent implementation:

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |

For catalog-wide work, also reconcile every reference identity with a catalog,
composition or Foundation exposure, evidence and any gap. Attach/reference that
inventory; matching names or catalog totals do not prove coverage.

## Architecture and reuse

- Component folder and responsibility boundaries: Extend the existing DOM-free Preview metadata parser; each renderer owns demo-frame/demo-w-1 through demo-w-8 CSS independently. Copyable code and component CSS remain independent of these helpers.
- Supported exports / registration / constituent API impact: No component API, registration or runtime changes; DemoWidth is exported only through the existing docs tooling entry.
- Framework bindings: Public surface unchanged; no new bindings needed. Existing generated bindings must remain unchanged after the build.
- Public vocabulary / tokens / parts / presentation review: Demo widths are renderer CSS, not theme tokens or component options. Genuine grid tracks and capability dimensions remain explicit.

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
| Existing use-case layout wrappers             | Existing authored examples (baseline f5094b03); current Preview renderers            | 583 width/centering sites inventoried; Preview owns incidental outer framing       | TpStack and its shared Foundation/presentation infrastructure                    | Use renderer width presets for incidental framing; keep dimensions demonstrating capabilities in snippets. | V-01         |

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
| V-01 | C-01 through C-05; source | Compare before/after preview titles, content, controls, styles and scripts | Only intentional framing/preview alignment changes | not run | Width decisions and source parity | pending | Run after edits |
| V-02 | C-01,C-02,C-03,C-06; visual | Render ordinary full-width demos and preserved overflow/editor/scroll examples at wide/narrow sizes | Capability remains legible; layout need not match pixels | not run | Chrome DevTools MCP | pending | Final verification |
| V-03 | C-04,C-06; behavior/a11y | Forms, popup and keyboard, scroll/overflow and widget use cases | Behavior, semantics and focus retained | not run | Chrome DevTools MCP | pending | Final verification |
| V-04 | C-05,C-06; docs/regression | Docs checker, build, unit suite, types/lint and both documentation builds | Checks pass after editing | not run | Serial capped checks | pending | Tests last |


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
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Existing Preview renderer owns the framing metadata and helper classes; no component or presentation substitute. |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Fresh bounded-width Storybook build: Accordion, Alert, Aspect Ratio and Attachment inspected at 1100px/420px through Chrome MCP; no missing frames, cap violations or root overflow. Attachment screenshot confirms readable narrow presentation. |
| I-03 | Independent constituent options work, including placement separately from action behavior | not applicable | This pass edits outer demo framing only; source parity preserves every control attribute, native parent, slot, content and script across 745 previews. No constituent options are changed. |

## Gate record

Keep every gate, including pending later gates. Replace the exit descriptions with
concrete evidence when passing them. Any failed dependency reopens affected gates.
Use `not applicable` only with contract/scope evidence, never for an unimplemented
requirement. Run the checker with `--stage implement`, then `verify`, then `complete`
at the work boundaries specified in SKILL.md.

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Fresh contracts and explicit source inventory above; baseline captured for every affected page.                                       |
| 1. Capability mapping                 | passed | 583 width/centering sites classified in width-decisions.json: 350 outer frames planned for simplification; capability dimensions and nested content retained.                         |
| 2. Architecture and composition reuse | passed | Existing Preview renderers own new demo width helpers; core component source/styles and generated bindings unchanged. |
| 3. Behavior | pending | Verify after all source edits are complete. |
| 4. Presentation and customization | pending | Verify after all source edits are complete. |
| 5. Accessibility | pending | Verify after all source edits are complete. |
| 6. Visual and interaction inspection | pending | Verify after all source edits are complete. |
| 7. Documentation and demo reuse | pending | Verify after all source edits are complete. |
| 8. Regression and reconciliation | pending | Verify after all source edits are complete. |

## Documentation synchronization

- [ ] All affected MDX pages follows the tweakpad-docs skill (structure, style, merge ledger); `check-docs.mjs --all --no-tests` passes; the story renders it with `libraryDocs()`; the tag is off `scripts/docs/pending.json`.
- [ ] JSDoc covers the element summary, every public field and method, slots, events and CSS properties; parts carry a description in the family; `npm run build` reports no undescribed row.
- [ ] `elementDependencies` is complete, so the website's Related lists what renders the element.
- [ ] Verification fixtures are separate from the page (tests/fixtures or `!autodocs` stories).
- [ ] Rendered and copyable previews reuse existing components; scripts import only what previews may.
- [ ] Preview code works outside Storybook: registration is the page's, imports are the package's.

## Completion / handoff

- Change summary: Demo-only width presets restore bounded examples without inline framing in copied code. Purposeful dimensions remain authored.
- Actual delivery claim: In progress; final serial checks and browser verification pending.
- Record checker: implement checked before source edits; verify and complete follow current renderer changes.
- Component runtime: unchanged in this pass. Earlier Stack runtime work is outside this diff.
- Older out-of-scope gaps: Full component conformance beyond these changed compositions is not claimed.
