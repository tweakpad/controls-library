# Scroll-edge specification preparation record

## Delivery and source record

- Requested work / claim: specification amendment and affected-controls preparation only; no runtime conformance claim.
- Scope source: user approved spec and inventory, native scroll areas only, one distance token (24px; zero disables), then requested implementation of that plan.
- Framework bindings: unaffected; no element API, source implementation or generated bindings changed.
- Sources: direct full Foundation, Library and Widgets ASTs and authoring schema, initial HEAD e2b945d3, clean, zero diagnostics; local repository 8aa517f, initially clean.
- Live outcome: committed 702a150e23c785173b76443fcb8ba1d4091f11cc, version 0.56.16, zero validation diagnostics before commit.
- Evidence: plan.md, inventory.md and spec-amendment.json in this directory; future runtime scenarios are explicitly unexecuted.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Required distance token, 24px default and zero opt-out | cl-scroll-edge-treatment | src/presentation/tokens.ts, shared Plot/surface recipes | Planned CSS role; runtime pending | plan.md | V-01 | passed | Committed normative role and default; no runtime token added in this scope. |
| C-02 | Shared observation, focus, lifecycle, both axes | f-scroll-edge-observation | ScrollAreaController, observeScroll and Foundation scroll helpers | Existing owners mapped for later adapters | inventory.md | V-02 | passed | Foundation contract and direct/inherited source inventory prepared. |
| C-03 | Widgets and exclusions | uwg-scroll-edge-contract | Widget native panels, Select/Tab/Scroll Area compositions | Plot and pan/zoom excluded | inventory.md | V-03 | passed | Widget amendment and exact source paths recorded. |
| C-04 | Validate coherent spec and dependencies | All three documents | Carousel and Scroll Spy contracts | No runtime changes | spec-amendment.json | V-04 | passed | Zero diagnostics, canCommit true, dependency reviews approved and commit succeeded. |

## Family dependency map

| Assigned family / role | Reference source path / symbol | Existing library owner | Reuse or repair decision | Component-specific policy and actual consumers | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Native edge state | Foundation ScrollArea and MessageScroller | ScrollAreaController, transcript/Carousel owners | Reuse state; no parallel owner | Detailed per-viewport consumers in inventory.md | V-02 |
| Nested lists and popup shells | Select, Dialog and anchored surfaces | Select list and anchored body implementations | One adapter per native viewport | Autocomplete, Command Palette, Emoji Picker, popups | V-03 |

## Presentation source map

| Region | Registry / base and preset | Source classes / recipe declarations | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Scroll edges | Existing native clipping and Message Scroller mask | message-scroller-viewport mask; shared native scroll state | Shared recipe planned for rollout | Alpha fades reveal actual surface; preserve chrome, no separate fade color | V-01 |
| Non-scroll fades | Citation and Code Block collapse | Existing mask-image recipes | Existing semantic owners | Preserve truncation/collapse independently | V-03 |

## Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Library inventory | Scroll lists and panels | Scroll Area, Select, Tabs, Dialog and anchored surface families | Source import/inheritance audit | Runtime adapters intentionally pending subsequent rollout |
| Widget/document inventory | Presets, categories, code and table wrappers | Existing public controls and shared document recipes | Exact paths and consumer ownership recorded | Native wrapper adapters prepared, not installed |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; normative API | Compare token contract with approved decisions | One inheritable distance role, default 24px, zero disabled | Contract matches; clipping and theme rules included | Direct AST and spec-amendment.json | passed | Runtime tests are future plan.md scenarios, not claimed here. |
| V-02 | C-02; preparation | Scan native overflow and existing state owners | Concrete native owner inventory, lifecycle and accessibility risks | Inventory prepared with inherited and independent scrollports | rg source audit; inventory.md | passed | No browser behavior changed. |
| V-03 | C-03; scope/reuse | Trace widget imports and non-native clipping | Native-only scope, no duplicate or canvas adapter | Native widget ownership and exclusions recorded | Direct Widgets AST and source imports | passed | Plot explicitly excluded by user. |
| V-04 | C-04; live validation | Validate exact full candidate, review affected dependencies | No unresolved issues; coherent commit | Zero diagnostics; committed 702a150e | Direct Spec Blocks validate/review/commit | passed | Initial 502 partial application reconciled before continuing. |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared ownership | passed | Source inventory traces actual Select/Tabs/Scroll Area and shared popup owners; no runtime replacement introduced. |
| I-02 | First rendered appearance | not applicable | User approved records/spec-only stage; rendered changes belong to future rollout. |
| I-03 | Independent UI options | not applicable | No component properties, compositions or runtime code changed. |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Fresh direct AST/schema reads, explicit approved preparation boundary. |
| 1. Capability mapping | passed | Contract decisions mapped to live nodes and inventory. |
| 2. Architecture and composition reuse | passed | Existing native state/presentation owners and adapters mapped; duplicate owners excluded. |
| 3. Behavior | not applicable | Runtime behavior is explicitly outside this stage; future tests in plan.md. |
| 4. Presentation and customization | passed | Normative CSS role, defaults, surface-aware alpha fading and scope committed; no runtime styling claim. |
| 5. Accessibility | passed | Spec establishes focus/caret/chrome/forced-color invariants; runtime verification pending rollout. |
| 6. Visual and interaction inspection | not applicable | No runtime visual/interaction change in records-only stage. |
| 7. Documentation and demo reuse | passed | Local planning records and inventory complete; no published component docs/demo changes. |
| 8. Regression and reconciliation | passed | Full live candidate validation and dependency review pass; no source/binding changes. |
