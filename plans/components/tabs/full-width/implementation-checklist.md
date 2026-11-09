# Tabs full-width layout (#33)

## Delivery and source record

- Requested work / claim: implement #33, an opt-in horizontal full-width tab list and equal shares, preserving overflow and existing vertical/default behavior.
- Scope source: user: “lets do #33 now”; issue #33 supplies the use case and acceptance criteria.
- Repository baseline / unrelated changes: clean at d66f87f2. Do not alter devkit consumers or unrelated controls.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; Foundation doc_cd3c4721-9f9b-4531-abab-a8bfdbac75f1, Component Library doc_8077bf7c-0361-48f3-ac87-53b983bd89b3, Widgets doc_0d98facc-5a5d-4de2-bccb-7317abea0b9f read directly at 6720183f (0.56.21). New CL ucl16-tabs-full-width and property row validated (zero issues) and committed as ac140ec8 before implementation.
- Owning contracts / dependencies / vocabulary: Foundation sec-134-tabs and existing direction/focus/indicator semantics; CL ucl16-tabs and ucl16-tabs-full-width. Presentation layout option, no new selection semantics or variant axis.
- Local reference evidence: clean external/ui 63c1308d1; apps/v4/registry/new-york-v4/ui/tabs.tsx (Root, List and Trigger, fit width and flex distribution). Clean external/base-ui 5b495488d; packages/react/src/tabs/list/TabsList.tsx, root/Tab/Indicator owners and tabs-overflow.module.css (nonshrinking labels in scrolling list). Existing local TpTabs, TabsPanel, TabsSelection, CollectionRegistry, indicatorGeometry and presentation recipe inspected.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP available. Reuse Storybook :6006; start isolated fixture/static servers only when needed.
- Evidence directory: tmp/component-verification/tabs/full-width/ (local only); tracked fixture and this record remain reviewable.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | fullWidth Boolean false, reflected full-width; horizontal fill and equal shares | ucl16-tabs-full-width | registry tabs List/Trigger; issue #33 | TpTabs property, structural host selectors | Full width and generated API | V-01 | passed | Source and built Chrome: horizontal 269px, enclosed 87.664/87.672/87.664px; underline 85px each after inset/gaps; property reflects |
| C-02 | Intrinsic label minima, native scrolling and indicator alignment | ucl16-tabs-full-width; sec-134-tabs | tabs-overflow.module.css; TabsIndicator | Existing scroll list and indicator geometry; no new observer | Full width | V-02 | passed | Four long labels retain widths (608px content in 269px list); both directions scroll with aligned indicator and keyboard End exposes last label |
| C-03 | Vertical ignores option; remove/toggle/orientation restores layout | ucl16-tabs-full-width | local orientation rules | CSS scoped to horizontal only | JSDoc | V-01, V-04 | passed | Both variants ignore the flag vertically and restore content sizing on removal; switching back horizontally restores equal shares |
| C-04 | Preserve selection, keyboard, disabled, focus, panel semantics and identity | sec-134-tabs | TabsList, Tab, Root reference owners | Existing TabsSelection/CollectionRegistry/TabsPanel untouched | Existing keyboard/disabled/mounting docs | V-03 | passed | Real click/arrow/Enter/Home/End; disabled stays discoverable without activation; 25 existing API assertions pass |
| C-05 | Both variants, density, RTL, themes, optional custom indicator and nested/dynamic tabs | ucl16-tabs; issue #33 | registry tabs styles, existing family/recipe | Existing presentation, slots and observers | Full width | V-04 | passed | All 24 layout assertions pass on source/dark and built/light/reduced motion, including compact, RTL, custom indicator, nested/dynamic/hidden and reconnect |
| C-06 | Documentation, Controls, manifest and framework projection expose supported property | CL property row; generated binding contract | Existing framework generator | cem; generated React/Vue/Preact/Solid/Svelte | docs/components/tabs.mdx; Default story | V-05 | passed | All framework types pass; React/Vue built props and selection lanes pass; static Storybook and isolated website builds render Full width and described API |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| --- | --- | --- | --- | --- | --- |
| S-01 | Original live Tabs contract had no full-width property | Component, docs, generated bindings | Add false-default fullWidth; horizontal only, content minima and scrolling | User authorized #33 implementation; direct validated spec commit ac140ec8 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: existing tabs folder; add only property and structural layout rules. No new behavioral owner.
- Supported exports / registration / constituent API impact: unchanged tag/export, one reflected Boolean property.
- Framework bindings: regenerated via cem, seven files updated across all five frameworks and raw tags. React/Vue built-package props true→false and controlled/uncontrolled value lanes pass; npm run typecheck passes including Boolean misuse rejection; ledger updated.
- Public vocabulary / tokens / parts / presentation review: fullWidth/full-width; no token overrides, new theme tokens or appearance axis. Existing library owns color, padding, typography, focus and indicator.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Selection, focus and panel lifecycle | reference Root/List/Tab imports composite registry; local tabs/panel.ts | TpTabs, TabsSelection, CollectionRegistry, TabsPanel | Retain existing owners, no logic changes | TpTabs / V-03; synthetic Button and Toggle regression fixture |
| Scroll and indicator layout | reference TabsList resize registry and TabsIndicator | NativeScrollEdges, indicator-geometry, TpTabs resize/scroll observer | CSS layout only; existing observations handle geometry | TpTabs / V-02, V-04 |
| Appearance | registry TabsList/Trigger classes through recipe | tabsPresentation structure and tabsAppearance | Existing recipes unchanged; structural flex allocation only | TpTabs / V-01, V-04 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| List | ui v4 TabsList w-fit inline-flex, overflow experiment | registry tabs.tsx and tabs-overflow.module.css | TpTabs .list; tabsAppearance | full-width horizontal inline-size 100%; retain inset, overflow and variants | V-01, V-02 |
| Trigger | ui v4 TabsTrigger flex-1 whitespace-nowrap | registry tabs.tsx | tabsPresentation tabs-trigger, tabsAppearance | flex 1 0 0 with max-content minimum; retain all appearance | V-01, V-04 |
| Indicator, panels | behavioral TabsIndicator and Root | existing indicator geometry, TabsPanel | Existing recipe and lifecycle | No new region, selection or presentation substitute | V-02, V-03 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Full width docs example | Tab triggers and panels | tp-tabs slots | Default register, both docs renderers / V-05 | Native buttons are contract anatomy; paragraphs are content |
| Verification fixture | Buttons, badges, icons and panels | Existing fixture imports library register and components | Existing registration / V-03, V-04 | Native tab triggers and test wrappers exercise required semantics |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01, C-03; API and geometry | Compact 269px; property/attribute toggles; unequal labels; both variants; default and vertical | Equal shares, full list, unchanged default/vertical, correct reflection | Reflected Boolean, full/default/vertical/RTL switches; equal shares measured in both variants | Chrome page 44, full-width-checks.js | passed | Source and built checks |
| V-02 | C-02; overflow | Narrow long/many labels, scroll start/end; selected custom/default indicator; fade opt-in | Labels retain minima, native scroll, focus reachable, indicator aligned | Intrinsic overflow 608px in 269px; indicator aligns after LTR/RTL scroll; End reveals last tab with scroll ±112.5px | Chrome page 44, assertions and real input | passed | Fade opt-in is independent |
| V-03 | C-04; interaction/accessibility | Click, arrows, Enter, disabled, automatic mode; existing API assertion module | Same proposal/focus/panel semantics, no node replacement | Click Style, ArrowRight focuses Stats while Style selected, Enter selects Stats; disabled Stats ignores Enter; automatic Home selects Scene; named tabs and panels in tree | Chrome input and 25 API assertions; focused unit checks | passed | No screen-reader claim |
| V-04 | C-03, C-05; integration | Nested/dynamic tabs, orientation change, RTL, light/dark, density, reconnect | Correct layout and geometry with no presentation override | All 24 assertions pass; native nodes/typography unchanged, nested values independent, reconnect geometry aligned | Chrome source/dark and built/light/reduced motion | passed | No new presentation overrides |
| V-05 | C-06; docs/framework/package | Full build, generated bindings, React/Vue mount/update; docs checker, static Storybook and website | Property projected correctly, docs interactive and described | Full library, Storybook and isolated website builds pass; 97 docs indexed; full suite 6299 pass/3 skip; both docs render 384px strip with 126px triggers; React/Vue props/lane pass | Chrome built docs and framework fixtures; Node logs in /private/tmp/tabs-* | passed | Website isolated copy, no user checkout changes |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Diff adds only reflected property and horizontal structural rules; all existing selection, panel, scroll and indicator owners remain in use |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Chrome source fixture: 269px list, Scene/Style/Stats widths 87.664/87.672/87.664px, same enclosed inset, typography and library indicator |
| I-03 | Independent constituent options work, including placement separately from action behavior | passed | Property reflects attribute in actual composition; selectors exclude vertical and keep default rules; full variant/input matrix in V-01 to V-04 |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Fresh direct specs and clean source references; issue #33 and local family inspected |
| 1. Capability mapping | passed | C-01 to C-06 mapped to V-01 to V-05; missing property resolved in live spec |
| 2. Architecture and composition reuse | passed | Existing behavior/presentation owners retained; only structural horizontal layout changes |
| 3. Behavior | passed | 24 layout assertions, 25 existing API assertions, real pointer and keyboard checks pass |
| 4. Presentation and customization | passed | Source dark and built light/reduced-motion; both variants, density, RTL, overflow, custom indicator and dynamic/nested tabs verified |
| 5. Accessibility | passed | Named tabs and labelled panels in accessibility tree; native keyboard and disabled behavior verified; no screen-reader claim |
| 6. Visual and interaction inspection | passed | Chrome source/built fixtures and static docs screenshots inspected; geometry and selection checks pass |
| 7. Documentation and demo reuse | passed | Docs checker passes; static Storybook and isolated website rendered; generated full-width API described and feature preview uses actual Tabs |
| 8. Regression and reconciliation | passed | 450 unit files, 6299 pass/3 skip; all framework typechecks, generated bindings, library/Storybook/site builds, lint, formatting and diff checks pass |

## Documentation synchronization

Existing merged page is preserved. Add only the user-requested Full width section and its example;
record the addition in its ledger. Generated API comes from new property JSDoc.

## Completion / handoff

Implementation: one false-default reflected fullWidth property and horizontal structural CSS.
Existing Tabs selection, keyboard, panels, presentation, scroll edges and indicator owners are unchanged.

Completed: 450 test files, 6299 passing tests and 3 skipped (181.26s), full framework typecheck
including invalid Boolean prop rejection, library build (97 docs), source ESLint/Stylelint,
Prettier, 24 layout assertions on source and built package, 25 existing API assertions,
real pointer/keyboard navigation including LTR/RTL overflow visibility, React/Vue built-package
property update and selection lane checks. No screen-reader or cross-browser claim.

Final static Storybook and isolated website builds/render inspections pass. Both show the full-width
preview at 384px with 126px triggers and the described API; only website has Related. The static
Default story accepts fullWidth:true, fills its 448px host and renders two 221px triggers.
Website build: 117 pages / 97 package docs, zero errors/warnings (one pre-existing source hint).
Initial isolated-site attempts hit cache/realpath setup errors; local caches and a copied Astro
package resolved them. Final build passes; the user's site checkout was never changed.

Live contract committed as ac140ec8; library changes are uncommitted and #33 remains open until
there is a library commit to reference. Changeset included. Record checker complete passed after
final reconciliation. Screenshot evidence was inspected inline through MCP; tracked browser
fixture provides reproducible assertions. Other logs and isolated site output are local only.
Temporary website copy is /private/tmp/tweakpad-tabs-site with the library linked; the user's site
checkout and installed package are not modified. Scope is #33, not full-library certification.
