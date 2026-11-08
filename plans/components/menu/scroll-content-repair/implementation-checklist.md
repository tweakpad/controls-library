# Text Editor documentation repair

## Delivery and source record

- Requested work / claim: Fix submenu overlap introduced by scroll-content wrapper, affected shared surface layouts and the Popover arrow fill reported during verification.
- Scope source: User: fix the traced submenu regression; subsequent Popover screenshot reports black arrow. Keep structural repair shared and Popover paint in its recipe.
- Repository baseline / unrelated changes: Clean working tree at start; preserve later concurrent edits.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; head 6720183f, version 0.56.21; full Foundation, Component Library and Widgets ASTs read during review and head refreshed before implementation.
- Owning contracts: Menu submenu edge placement, shared anchored-surface column layout and scroll-edge mask geometry.
- Local reference evidence: existing editor feature factories, local external/base-ui toolbar text-editor experiment inspected in review context; no imported runtime dependencies added.
- Framework bindings: Unchanged; No public API change; generated framework projections remain unchanged.
- Evidence directory: tmp/component-verification/menu/scroll-content-repair/

## Capability and interface mapping

| ID | Requirement | Authority | Reference | Implementation | Docs | Scenarios | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Scroll content preserves former column flex and stretch behavior | Existing Menu and anchored-surface contracts | Parent of commit 1bcde248; existing body styles | Shared anchored surface scroll-content rule | Existing Menu docs | V-01, V-02 | passed | Static browser geometry restores full trigger row width; former shrink regression reproduced before repair |
| C-02 | Scroll overflow and opt-in fades remain functional | Scrollable/native scroll-edge contracts | shared/scroll-edges.ts and body layout | Keep measurable wrapper and native scrollport | Existing fixtures | V-01, V-02 | passed | Long-menu scrollports work with fades off/on; mask marker exactly follows opt-in |
| C-03 | Shared consumer direction, alignment and gap semantics retained | Anchored-surface composition | Menu, Menubar, NavigationMenu, Popover | Existing shared owner only | Existing stories | V-02 | passed | Final 16-case browser matrix includes Popover stretch and Tooltip horizontal row |

| C-04 | Popover arrow matches its surface fill | User screenshot and themed Popover contract | popover-content and existing PreviewCard arrow recipe | Theme fill rule on arrow child | Popover Placement demo | V-01, V-02 | passed | Arrow fill matches customized surface color on all four sides; actual rename-file example matches dark surface |

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
| V-01 | C-01,C-02 | Focused unit tests, type/lint and build checks | Shared layout valid and unchanged contracts | Library build and TypeScript pass; full suite 450 files / 6299 tests pass before final arrow/direction update; final focused suite 15 files / 129 tests passes after it | Local logs | passed | Broader suite not repeated for final scoped presentation adjustments |
| V-02 | C-01,C-02,C-03 | Real hover/keys; LTR/RTL, collision, fade and shared consumers | No submenu overlap; overflow and content flow retained | Sixteen final browser cases pass; real Menu hover and Escape/ArrowRight preserve placement and focus; Axe zero violations, 14 passing rules | Chrome MCP; durable fixture and local JSON | passed | Final built artifacts rerun: all sixteen cases pass and actual Popover arrow matches its surface |

## Early integration checkpoint

| ID | Check | Status | Evidence |
| --- | --- | --- | --- |
| I-01 | Shared owner reused | passed | Shared structural declarations on anchored-surface scroll-content; no menu/button recipe overrides |
| I-02 | Submenu geometry corrected | passed | Actual docs: trigger width restored from 70px to 160px; submenu now starts at row end 892px instead of 802px |
| I-03 | Fades remain independently configurable | passed | Real mask layer preserved and does not shrink; shared observer and scroll-edge option untouched; independent long-menu tests follow |

## Gate record

| Gate | Status | Evidence |
| --- | --- | --- |
| 0. Sources and scope | passed | Current clean baseline, fresh project head and three direct full specification reads; regression traced to 1bcde248 of Nov 7 |
| 1. Capability mapping | passed | Three capabilities mapped to shared owner and source/browser checks |
| 2. Architecture and composition reuse | passed | Repair structural flow in anchored-surface only; no per-component overrides or new API |
| 3. Behavior | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |
| 4. Presentation | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |
| 5. Accessibility | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |
| 6. Visual and interaction | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |
| 7. Documentation | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |
| 8. Regression | passed | Scoped checks and final built 16-case browser matrix pass; full/focused suite boundaries documented |

## Verification notes

- Regression origin: 1bcde248, November 7 2026. The new block wrapper interrupted the existing flex flow and shrank submenu triggers. Structural repair restores flex layout while inheriting direction, alignment, justification and gap from the owning body. Content retains natural height and a measurable masking box.
- Popover arrow: existing SVG had no fill declaration and defaulted to black. The Popover recipe now paints its arrow with --tp-popover, matching the existing Preview Card approach without new tokens or parts.
- Menu matrix: LTR and RTL; portal on/off; forward edge and collision flip; short submenu trigger beside a wider row. All eight positioning cases pass. Long-menu native scrolling works with fades off/on and matching mask markers. Popover children stretch; all four arrow sides match an overridden surface color; Tooltip label and Kbd remain on one row. Sixteen cases total.
- Real input: hovered authored Share row opens its submenu at the row edge; Escape then ArrowRight reopens and focuses Copy link. AX exposes named parent/child menus and expanded Share; Axe WCAG A/AA reports zero violations with 14 passing rules. No screen-reader claim.
- Boundaries: no new public API, tokens, dependencies, framework projections or authored MDX changes. Existing generated bindings unchanged. Old unrelated conformance gaps in the parent Menu record are not certified here.
- Evidence is local under tmp/component-verification/menu/scroll-content-repair; durable runnable fixture under tests/fixtures/components/menu/scroll-content-repair. Local logs are not automatically shared or packaged.

## Final build reconciliation

- Final library compilation/bundling/docs index and final static Storybook build pass after the arrow recipe and inherited-layout adjustments. Source formatting, scoped ESLint/Stylelint and diff checks pass.
- Final static sixteen-case matrix reports no failures; the authored Rename file arrow resolves to rgb(32, 32, 36), identical to its popup surface. Visually inspected the corrected example in the built docs.
- Menubar File opens with its correctly rendered Share row. Navigation Menu Product opens with a measurable 428px flex content layer and its link grid; its popup is inside an item shadow root, so document-only queries do not inspect its content. No console errors reported.
- A temporary Python static server reset connections during concurrent module loading. Replaced only that agent-owned server with a Node static server; final artifacts and checks completed against the stable server. Failed load attempts were not recorded as component passes.
- A code-only layout/paint repair leaves the existing Menu and Popover documentation snippets and contract unchanged. Changeset covers both fixes.
