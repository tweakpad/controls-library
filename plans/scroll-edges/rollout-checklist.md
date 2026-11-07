# Scroll-edge runtime rollout record

## Delivery and source record

- Requested work / claim: implement the full native scroll-edge rollout in inventory.md; preserve unrelated work.
- Scope source: user approved spec and inventory, native scroll areas only, one distance token (24px; zero disables), then explicitly requested runtime changes with “lets now write the changes”.
- Framework bindings: CSS token addition only; no new element property/event; manifest/binding output must remain synchronized.
- Sources: direct full Foundation, Library and Widgets ASTs and authoring schema, initial HEAD e2b945d3, clean, zero diagnostics; local repository 8aa517f, initially clean.
- Live authority: committed 702a150e23c785173b76443fcb8ba1d4091f11cc, version 0.56.16, zero validation diagnostics before commit.
- Evidence: plan.md, inventory.md and spec-amendment.json in this directory; runtime observations are in tmp/component-verification/scroll-edges/runtime/results.md; screenshots were inspected through MCP, with local file saving unavailable.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Token and zero opt-out | cl-scroll-edge-treatment | presentation/tokens and styles | Required length role, 24px | plan.md / inventory.md | V-01 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-02 | Edge geometry and scheduling | f-scroll-edge-observation | ScrollAreaController / observeScroll | Shared native edge helper and controller | plan.md / inventory.md | V-02 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-03 | Content-only masks and chrome | cl-scroll-edge-treatment | Native content wrappers / shared recipe | No viewport masking; protect sticky/fixed regions | plan.md / inventory.md | V-03 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-04 | Collections and popup inheritance | cl-scroll-edge-treatment | Select, anchored surfaces, table, Tabs | Explicit adapters; inherited consumers share ownership | plan.md / inventory.md | V-04 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-05 | Panels and widget integration | uwg-scroll-edge-contract | inventory.md panel/widget owners | Explicit native adapters; no Plot/drawing fade | plan.md / inventory.md | V-05 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-06 | Document/editor adapters | uwg-scroll-edge-contract | document table/code shared wrappers | Observe owning host and live engine wrappers | plan.md / inventory.md | V-06 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-07 | Focus, accessibility and cleanup | f-scroll-edge-observation | focus and observation services | Preserve focus/caret; forced colors disables masks | plan.md / inventory.md | V-07 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |
| C-08 | Customization/docs/regression | cl-scroll-edge-treatment | shared recipes, token catalog | Both axes/themes, CSP, token docs and builds | plan.md / inventory.md | V-08 | passed | Chrome fixture and runtime/results.md; source/ownership checks and regression commands below. |

## Family dependency map

| Assigned family / role | Reference source path / symbol | Existing library owner | Reuse or repair decision | Component-specific policy and actual consumers | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Native scroll state | ScrollAreaController, MessageScroller provider | observeScroll / shared scroll geometry | Reuse existing measurements where supplied; common adapter for remaining native owners | All native owners in inventory.md; no replacement physics | V-02 |
| Collection and popup inheritance | Select, Tabs, anchored surface, Dialog | Existing component families | Add one edge adapter to the shared owner | Autocomplete/Command/Emoji Picker/popups inherit | V-04 |
| Content adapters | Existing native wrappers and sticky parts | Each component's current anatomy | Target non-scroll content only; protect sticky descendants and focus | Table, editors and panels retain layout/semantics | V-03 |

## Presentation source map

| Region | Registry / base and preset | Source classes / recipe declarations | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Native edges | Message Scroller fade and approved global contract | Existing mask-image recipe and content wrappers | Shared scroll-edge presentation recipe | Alpha gradients; existing underlying surface; distance limited by remaining content and viewport quarter | V-01 |
| Existing non-scroll masks | Citation and Code Block collapse | Their current recipes | Preserve separate semantics | Do not replace or stack the Message Scroller old viewport mask | V-03 |

## Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Rollout fixtures | Native scrolling controls and compositions | Actual catalog components | Chrome MCP, real wheel/keyboard/scrollbar interaction | Plain text/layout native content allowed; no parallel controls |
| Editor documents | Engine-owned code/table wrappers | Shared document recipes and editor host | Host lifecycle tracks engine replacement | Browser-native wrappers remain semantically unchanged |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; behavior/presentation | plan.md V-01 and affected inventory consumers | Contract in capability row | Fitting/growing content, x/y start/middle/end, zero and 24px default; masks limited by distance and viewport quarter. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-02 | C-02; behavior/presentation | plan.md V-02 and affected inventory consumers | Contract in capability row | RTL and vertical/sideways modes, fractional table offsets, 5px remaining distance and 6px threshold. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-03 | C-03; behavior/presentation | plan.md V-03 and affected inventory consumers | Contract in capability row | 500-row virtual Tree (14 mounted) and Select (26 mounted); nested panel leases drop from four mask operations to two when only parent is disabled. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-04 | C-04; behavior/presentation | plan.md V-04 and affected inventory consumers | Contract in capability row | Dark/light actual-surface screenshots, inherited token, zero opt-out, 16px example in Storybook and website. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-05 | C-05; behavior/presentation | plan.md V-05 and affected inventory consumers | Contract in capability row | Real Tab/PageDown scrolls conversation to 140px; programmatic native scrolling and transform/native Carousel switching. Input handling remains with existing native owners; no new cancellation or gesture listeners. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-06 | C-06; behavior/presentation | plan.md V-06 and affected inventory consumers | Contract in capability row | Real typing and caret selection in both editor engines; wide table range 1174px, unmasked wrapper/overlay; accessible roles/names retained. Five existing axe scroll-focus findings unchanged at token zero. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-07 | C-07; behavior/presentation | plan.md V-07 and affected inventory consumers | Contract in capability row | Forced-colors removes mask; reduced-motion retains static cue; unsupported mask capability exits without masks (source branch audit, no simulated browser support claim). | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |
| V-08 | C-08; behavior/presentation | plan.md V-08 and affected inventory consumers | Contract in capability row | Zero frames/style writes over 700ms settled; disconnect/reconnect, cross-document adoption and return, CSP suppression/nonces and active nonce-only style policy with zero violations. | Chrome MCP page 75; runtime/results.md; focused unit regressions | passed | Edge-rendering scope; native scroll physics retained. |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Actual shared ownership | passed | Diff uses NativeScrollEdges and one recipe; Scroll Area supplies existing measurements; Message Scroller old viewport mask removed. |
| I-02 | Rendered first composition | passed | Chrome page 75: Scroll Area and Message Scroller inspected in dark/light; content fades and viewport mask remains none. |
| I-03 | Independent options | passed | Chrome: 0px removes mask, middle x/y masks update, focus receives opaque island, Table sticky header/column protected; settled idle produces zero writes over 600ms. |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Fresh full ASTs at 702a150e, user authorizes full runtime inventory rollout; component skill/reference read. |
| 1. Capability mapping | passed | C-01–C-08 cover token, geometry, owners, documents, accessibility and regressions; inventory maps concrete consumers. |
| 2. Architecture and composition reuse | passed | Shared native geometry/controller and shared presentation; content-target adapters preserve viewport ownership, fixed/sticky chrome and inherited families. |
| 3. Behavior | passed | Full native inventory wired through shared adapters; browser fitting/growth, boundaries, virtualization and nested-owner cleanup passed. |
| 4. Presentation and customization | passed | Content-only recipe; default/zero/relative/oversized token, actual surfaces, sticky/focus islands and CSP policy verified. |
| 5. Accessibility | passed | Roles/names and real keyboard/caret retained. Axe baseline at token zero has the same five prior scroll-focus findings; no component-wide accessibility certification. |
| 6. Visual and interaction inspection | passed | Dark/light/RTL screenshots, popup/table/panel/editor compositions inspected. Forced colors and reduced motion verified; existing native input ownership retained. |
| 7. Documentation and demo reuse | passed | Scroll Area checker passed, 96 docs pages indexed, Storybook and isolated website linked to current built package both read in Chrome; 16px example renders content fade. |
| 8. Regression and reconciliation | passed | Unit suite, focused regressions, source/framework type checks, build, Storybook build, docs checker, formatting/ESLint/stylelint and size budgets passed. Final Navigation Panel repair has targeted lint, built browser and build evidence. |

## Verified boundary and command evidence

This is a shared edge-presentation rollout, not a new certification of every
control's pre-existing native scroll physics or accessibility. No element API,
consumer child-list mutation or framework-specific implementation was added.
Physical touch/wheel/scrollbar gestures were not rerun across every family;
passive native ownership is unchanged. Existing scroll-focus axe findings are
listed in the fixture README and reproduced with the token disabled.

- Live authority: 0.56.16, HEAD 702a150e23c785173b76443fcb8ba1d4091f11cc.
- Full unit suite: 442 files passed; 6256 passed / 3 skipped; serial, 144.01s.
- Final focused regressions: 4 files / 44 tests passed, 829ms.
- npm run typecheck: source/stories/tests and all five framework suites passed;
  Svelte reported zero errors/warnings.
- npm run build: passed; 207 generated binding files, zero updates; 96 docs indexed.
- docs checker: components/scroll-area passed, including its merge ledger.
- node scripts/size-report.mjs: 97 independent bundles generated; tree-shaking and
  binding budgets verified. The generated size-report JSON is retained.
- Local command logs are copied into tmp/component-verification/scroll-edges/runtime/.
- Local logs/images are not automatically available on other machines.

Final integration correction: Navigation Panel Content's actual scrollport is its
native inner part, while its host is a separate possible viewport. Both now use
one non-scroll content layer. Valid Provider composition was verified in the
built fixture: 1507px range, content masked, native viewport mask none. The
standalone missing-Provider fixture was replaced with the supported composition.
The five old axe findings still match exactly with the fade enabled and disabled.
The built fixture also scheduled zero idle animation frames over 600ms.

Cleanup: stopped only task-owned source/website servers (5391/5392) and closed verification tab 75. Existing user servers and tabs were preserved.

## Sticky composed-table regression (2026-11-07)

User reported the Storybook Table sticky-header-and-columns composition. Fresh
live Library document and project still resolve to 0.56.16 / 702a150e. Native
reference table-container and local Table/TableGeometry/tableSections ownership
were retraced. The actual composition uses public table parts: native sticky
sections/cells live in their shadow roots, outside the adapter's light-DOM scan.
The current mask has only two gradients; the footer fades. Setting the token to
zero on this Table restores opacity and leaves the neighboring control alone.

Design gates 0-2 remain satisfied for this repair: Table already owns the native
references and positioning. Supply these references to the shared adapter, keep
all mask composition in the existing recipe, and schedule after geometry changes.
No new component attribute, external dependency or duplicate sticky traversal.
Per-control opt-out remains the inherited token set to zero on that control.
Verify composed/native sections, footer/columns, sticky settings changed at
runtime, scroll movement and local opt-out; document the one-control example.

Repair result: the actual composed Table now supplies pinned native cells and
sticky header/footer sections directly from TableGeometry's measurements. The
shared recipe handles those regions without a new shadow-tree scanner. Chrome
page 76: scrollLeft 120 / scrollTop 80 with a 400px viewport; header/footer and
leading/trailing column gaps all zero. RTL offset -100 retained zero logical-edge
gaps. Unpinning restored the two base mask operations. A local zero token produced
mask none and left the neighboring Table mask unchanged. Screenshots inspected
opaque sticky regions; viewport mask stayed none. Idle: zero requested frames
over 600ms. The source fixture now includes composed and authored-native tables.
Mask unit tests passed (2); Table docs checker passed; build passed with unchanged
framework bindings. The original full-suite evidence above is retained; this
bounded repair uses focused reruns and actual composed browser verification.

Repair completion: targeted ESLint/stylelint passed. Table docs were read in
Storybook and the isolated website using the current built package; the opt-out
sentence renders in both, and the website's sticky table has protected native
parts and an unmasked viewport. No spec exception or new attribute was needed.
Logs: tmp/component-verification/scroll-edges/sticky-table/. The user's Storybook
server/tab were preserved; temporary token inspection was restored before repair.

## Sticky Table of Contents exclusion (2026-11-07)

User requests the sticky Handbook ToC be excluded by default. It has no local
fade controller; its surrounding Scroll Area masks an ancestor content layer.
Light-DOM-only protected-element discovery cannot see the sticky aside through
the Scroll Area's slot. Reuse Foundation composedElements for cached discovery,
so sticky/fixed regions across slot/shadow boundaries are protected by default.
No per-ToC scanner, new attribute or new scroll owner. Source/design gates 0-2:
current project 0.56.16 / 702a150e; existing sticky-protection contract and the
Foundation flattened-tree helper govern this repair. Verify the Handbook aside
gets an opaque region while article content still fades; verify active indicator,
links, slot updates and settled idle behavior. Existing ToC API remains unchanged.

Sticky ToC result: Chrome page 77, the actual Handbook composition now has an
opaque aside region (176x244px at content-local 24px,180px) plus the unchanged
article edge gradients; viewport mask remains none. Clicking Roles set value to
toc-nested-roles, scrolled to 228px and rendered the 91px parent/subsection
indicator. Screenshot confirms Handbook/links remain opaque while article text
fades at the scroll edges. Settled idle: zero requested frames over 600ms.
Traversal/mask regressions: 14 tests passed in 418ms; build and generated docs
passed, with unchanged component APIs. The source regression fixture includes a
slotted article and sticky ToC. The repair reuses the existing cached composed
traversal; it adds no idle scanning or component-specific appearance substitute.

Additional shared regression: after the composed scan was introduced, Table now
invalidates its protected-element cache whenever its owned sticky geometry is
rebuilt. A composed Table with 374px overflow returned add,add,intersect,add while
pinned and intersect,add after unpinning. The Handbook aside similarly changes
from ordinary content to an opaque protected region when position becomes sticky.
No ToC-specific fade attribute or appearance override was introduced: the default
sticky-region exclusion now works through slots, preserving the article fade.

ToC completion: final build and targeted lint passed; regenerated size report
verified tree-shaking for 97 bundles. Logs are under
 tmp/component-verification/scroll-edges/sticky-toc/. Closed only verification tab
77; the existing Storybook server and user tabs were preserved.

## Large-list Select regression (2026-11-07)

User supplied the actual Large list story in flat appearance and correctly
challenged the prior coverage. The prior Select checks did not establish this
composition's correctness. At middle offsets the 22px scroll-arrow overlays cover
almost all of each 24px fade; options cut off sharply beneath the arrows. The
adapter uses the complete viewport instead of its uncovered content region.

Fresh live project/Library remain 0.56.16 / 702a150e. Select's existing
measureScroll/applyScroll owns actual arrow extents and scroll-padding; reuse
those measurements as shared adapter content insets. Shared native geometry owns
inset clamping; the existing mask recipe retains appearance. Also supply Select's
known highlighted option as protected chrome for searchable active-descendant
focus. No new public attribute, input handler, positioning owner or external
runtime dependency. Design gates 0-2: existing sources, actual story, collection
state and overlay owner retraced. Verify this exact story, first/middle/last,
keyboard selection, custom arrow sizes, zero token, searchable/virtualized and
inherited collections, flat/default appearance and settled idle behavior.

## Additional user-reported demo repairs, active scope

- Select Large list: visible mask insets now reuse arrow extents; finish reopen
  selection, searchable/virtualized and inherited surfaces verification.
- Tree View: record demos initialized after connection, which locked initially
  uncontrolled lanes before defaults/controlled values were supplied. Reused the
  existing Custom rows preview's create-configure-connect pattern for Records,
  Virtualized, Controlled and Lazy folders. Large/lazy are explicitly in scope;
  default-state semantics must not be weakened to repair samples.
- Native Select multiple: explicit Canvas option paint erased selected states and
  produced a black rectangle inside the themed field. Reuse the existing native
  control and presentation dictionary, scoped multiple-listbox option/selection
  paint; keep native interaction and browser input internals outside scroll fades.
- Timeline Roadmap: audit horizontal start/middle/end, RTL and narrow layouts with
  fade enabled/disabled. Do not claim fixed from only initial rendering.
Current live Library remains 0.56.16 / 702a150e; corresponding NativeSelect,
TreeView and Timeline contracts were read through the direct Spec Blocks tool.

### Repair verification results

The user-reported compositions were checked through Chrome DevTools MCP, using one
owned tab. The claim here is these repairs, not complete conformance of every API
in each component. No component or framework public API changed; the build's
manifest projection regenerated zero binding files.

| Repair scenario | Result | Evidence |
| --- | --- | --- |
| Select Large list, flat, first/middle/last | passed | Real End/Enter selected Country 100; reopen reached native maximum 2450px and displayed its full row (339–367px within viewport 13–371px), without a bottom arrow. Home/Enter selected Country 1. Screenshots inspected. |
| Select customized arrows and opt-out | passed | Public part hooks made both arrows 40px; visible mask height was 278px inside the 358px viewport. At middle offsets both fades appeared beside the arrows. Token 0px removed all masks. |
| Searchable virtualized Select | passed | 100 source records, 18 mounted options near the end; real ArrowDown/End/Enter selected Option 99 and closed. Highlight supplied through the existing collection owner for mask protection. |
| Tree View initialization | passed | Records, Virtualized, Controlled and Lazy folders configure before connecting, matching the existing Custom rows composition. Static Storybook and built website render all four trees. |
| Large trees and focus | passed | 25,239 source records, 67 expanded logical rows, 12–16 mounted rows. focusItem mounted the requested log; real End moved focus to December. Initial and scrolled screenshots inspected. |
| Loading children on demand | passed | Real Contracts press produced loading then loaded with 6 rows; Invoices expanded to 8. Native viewport 160px, scroll height 256px; scrolling and fade appear after async insertion. The built website repeated loading, insertion and fade. |
| Controlled Tree View | passed | Real Reveal selection opened billing/policies; selection remained refunds. |
| Native Select multiple | passed | Dark/default and light/flat screenshots show themed option and selected-state paint. Real click and Shift+ArrowDown selected review/mention, matching public value. Forced colors retained native system selection. Native option scrolling remains outside the fade adapter. |
| Timeline Roadmap | passed | Start and end screenshots at 704px viewport, native maximum 448px; final Automations and Data residency visible in LTR and RTL. Dark/flat 466px viewport reached 686px maximum, retained aligned markers and end content, with a left-only fade. Token 0px removed masks without changing offset. Current shared overflow mask repair suffices; no Timeline-only override added. |
| Accessibility | passed | Chrome accessibility snapshots expose native listbox selected states and tree items. Axe: Native Select multiple 0 violations/10 passes; Tree virtual 0/17, lazy 0/16, controlled 0/16. Real keyboard checks are recorded separately above; no screen-reader claim. |
| Documentation | passed | Tree View checker passed (20 tests); authored page and forced-preview ledger updated. Static Storybook and built isolated website were read in Chrome; scripts and API sections render. Website build passed, 116 routes. |
| Regression | passed | Library build passed; Storybook build passed; serial full suite 442 files, 6259 passed and 3 skipped in 137.79s. Source and binding generation are unchanged outside the listed repairs. |

Low-priority builds used a 2 GB Node heap; the full test run used 1 GB and one
worker without file parallelism. Detailed local command logs are under
`tmp/component-verification/scroll-edges/demo-repairs/`; these ignored artifacts
are local to this checkout. Browser screenshots were inspected in MCP output.

Final formatting, ESLint and Stylelint passed. The complete-stage record checker
and diff whitespace check passed. Stopped only the two task-owned verification
servers (5392/5393) and closed the owned verification tab; the user's Storybook
server and tabs remain running.
