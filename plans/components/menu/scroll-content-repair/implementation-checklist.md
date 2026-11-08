# Text Editor documentation repair

## Delivery and source record

- Requested work / claim: Fix submenu overlap introduced by scroll-content wrapper, including affected shared surface layouts.
- Scope source: User: fix the traced submenu regression. Keep the repair in its shared owner.
- Repository baseline / unrelated changes: Clean working tree at start; preserve later concurrent edits.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; head 6720183f, version 0.56.21; full Foundation, Component Library and Widgets ASTs read during review and head refreshed before implementation.
- Owning contracts: Menu submenu edge placement, shared anchored-surface column layout and scroll-edge mask geometry.
- Local reference evidence: existing editor feature factories, local external/base-ui toolbar text-editor experiment inspected in review context; no imported runtime dependencies added.
- Framework bindings: Unchanged; No public API change; generated framework projections remain unchanged.
- Evidence directory: tmp/component-verification/menu/scroll-content-repair/

## Capability and interface mapping

| ID | Requirement | Authority | Reference | Implementation | Docs | Scenarios | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Scroll content preserves former column flex and stretch behavior | Existing Menu and anchored-surface contracts | Parent of commit 1bcde248; existing body styles | Shared anchored surface scroll-content rule | Existing Menu docs | V-01, V-02 | pending | Trigger shrink reproduced and causal wrapper test confirmed |
| C-02 | Scroll overflow and opt-in fades remain functional | Scrollable/native scroll-edge contracts | shared/scroll-edges.ts and body layout | Keep measurable wrapper and native scrollport | Existing fixtures | V-01, V-02 | pending | No display-contents workaround |
| C-03 | Shared consumer content and gap semantics retained | Anchored-surface composition | Menu, Menubar, NavigationMenu, Popover | Existing shared owner only | Existing stories | V-02 | pending | Verify normal and constrained content |

## Family dependency map

| Responsibility | Reference dependency | Existing owner | Reuse decision | Consumers |
| --- | --- | --- | --- | --- |
| Content flow | Pre-scroll wrapper column flex body | anchored-surface.ts | Restore column flex on new content layer | Menu, Popover and NavigationMenu |
| Scroll-edge masks | Native scroll edge content bounds | NativeScrollEdges | Preserve real wrapper and measured scrollport | All opted-in anchored surfaces |

## Presentation source map

| Region | Source preset | Source selectors | Existing recipe | Decision | Scenarios |
| --- | --- | --- | --- | --- | --- |
| Submenu rows | Local submenu composition and existing command rows | menu-sub-trigger and anchored body | Menu/Button recipes unchanged | Restore structural stretch instead of local width override | V-01, V-02 |

## Implementation and composition reuse map

| Demo | Role | Existing API | Integration | Exception |
| --- | --- | --- | --- | --- |
| Existing surface fixtures | Menu rows, submenus and popup content | Public menu and surface APIs | Shared structural repair | Fixture dimensions deliberately force overflow/collision |

## Verification scenarios

| ID | Capabilities | Setup | Expected | Actual | Evidence | Status | Gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01,C-02 | Focused unit tests, type/lint and build checks | Shared layout valid and unchanged contracts | Pending | Targeted checks | pending | After edit |
| V-02 | C-01,C-02,C-03 | Real hover/keys; LTR/RTL, collision, fade and shared consumers | No submenu overlap; overflow and content flow retained | Baseline reproduced | Chrome MCP and durable fixture | pending | After edit |

## Early integration checkpoint

| ID | Check | Status | Evidence |
| --- | --- | --- | --- |
| I-01 | Shared owner reused | passed | Six structural declarations on anchored-surface scroll-content; no menu/button recipe overrides |
| I-02 | Submenu geometry corrected | passed | Actual docs: trigger width restored from 70px to 160px; submenu now starts at row end 892px instead of 802px |
| I-03 | Fades remain independently configurable | passed | Real mask layer preserved and does not shrink; shared observer and scroll-edge option untouched; independent long-menu tests follow |

## Gate record

| Gate | Status | Evidence |
| --- | --- | --- |
| 0. Sources and scope | passed | Current clean baseline, fresh project head and three direct full specification reads; regression traced to 1bcde248 of Nov 7 |
| 1. Capability mapping | passed | Three capabilities mapped to shared owner and source/browser checks |
| 2. Architecture and composition reuse | passed | Repair structural flow in anchored-surface only; no per-component overrides or new API |
| 3. Behavior | pending | Final scoped checks |
| 4. Presentation | pending | Final scoped checks |
| 5. Accessibility | pending | Final scoped checks |
| 6. Visual and interaction | pending | Final scoped checks |
| 7. Documentation | pending | Final scoped checks |
| 8. Regression | pending | Final scoped checks |
