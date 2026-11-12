# Scrolled rows keep the scroll padding

## Delivery and source record

- Requested work / claim: a row the virtual list scrolls to (start or nearest) keeps the viewport's scroll padding, as native `scrollIntoView` does; Select's list declares its padding (or its scroll arrows) as scroll padding. Fixes the emoji picker's label jump on category switches.
- Scope source: user 2026-11-12: "As for the emoji picker switching from the first tab to the second makes a space jump between the tab an its contents", then "do it" for the core fix (Foundation VirtualList and Select styles).
- Repository baseline / unrelated changes: shared worktree with uncommitted Color palette, Tooltip and Tabs work; only `src/foundation/virtual-list.ts` and `src/components/select/styles.ts` change here.
- Live project / document IDs and revisions: UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; Foundation virtual list section and Component Library Select; amendment requested from the spec author after 0.65.16.
- Owning contracts / dependencies / vocabulary: Foundation virtual list window (scrollToIndex start/nearest/center); Select list `scroll-padding-block`; native scroll padding semantics.
- Local reference evidence: virtual-list.ts `#reveal` aligned to the bare row edge; select styles.ts set scroll padding only for the scroll arrows; emoji picker list padding 4 px.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP available; Vite dev server on 5191.
- Evidence directory: tmp/component-verification/select/ (local only).

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Start and nearest reveals keep the viewport's block scroll padding; targets never go negative | Foundation virtual list amendment | VirtualList `#reveal` | `scrollPadding(viewport)` reads computed `scroll-padding-top/bottom` (document root for the document scroller) | None (behavior) | V-01, V-02 | passed | Emoji picker labels at 5 px after jumps; Select keyboard keeps 4 px / 22 px |
| C-02 | Select's list scroll padding is the larger of its own padding and its scroll arrows | CL Select amendment | select styles.ts `.select-list` | `scroll-padding-block: max(var(--_tp-popup-spacing, 0px), var(--_tp-select-scroll-up-height, 0px)) max(...)` | None | V-01, V-02 | passed | Computed 4 px top, 22 px bottom with the arrow |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| --- | --- | --- | --- | --- | --- |
| S-01 | Virtual reveals ignored scroll padding, so a revealed row sat flush at the edge (under a scroll arrow, or above the list padding) | Select, emoji picker, any VirtualList consumer with scroll padding | Honor scroll padding like native scrollIntoView | User approval 2026-11-12 ("do it"); spec amendment requested | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: Foundation VirtualList owns the alignment; Select declares its padding in its structural styles.
- Supported exports / registration / constituent API impact: none.
- Framework bindings: unchanged (cem 0 updated).
- Public vocabulary / tokens / parts / presentation review: none new; private `--_tp-popup-spacing` read as a fallback-safe length.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Reveal alignment | virtual-list.ts `#reveal`, scroll.ts `isDocumentScroller` | VirtualList | Repaired in place | Select, emoji picker, Color palette list / V-01 to V-03 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| select-list | popupSpacingAppearance padding | select styles.ts | selectAppearance select-list | Scroll padding mirrors the padding or the arrows | V-02 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Emoji picker categories | Category jump | TpSelect revealGroupStart | Emoji picker fixture / V-01 | None |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01, C-02; real input | Emoji picker fixture, first picker; real clicks on People & body and Food & drink | The category label lands where the first label rests | rest: Smileys label 5 px below the viewport top; after the clicks People & body 5 px, Food & drink 5 px (before: 1 px); screenshot inspected | DevTools click, evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-02 | C-01, C-02; keyboard | Inline searchable virtualized Select, 300 items; ArrowDown ×20, End, Home | Highlighted rows stop at the scroll padding | Item 19 22 px above the bottom (clear of the scroll-down arrow); End: Item 299, 4 px below; Home: Item 0, 4 px above, scrollTop 0 | DevTools press_key, evaluate | passed | Observed values recorded in Actual result |
| V-03 | C-01; regression | vitest, lint, typecheck, build; Select fixture apiChecks with and without the change | No new failures | 455 files / 6339 tests pass; apiChecks 27/31 both with the change and with the two files at HEAD (same four failures: modal lease shadow scopes, scroll repeat timer, adoption paint, icon length tokens) | npm scripts; Chrome apiChecks | passed | Four Select fixture failures pre-exist the change |
| V-04 | C-01; regression repair | Select `apiChecks` four failures (user 2026-11-12: "we are fixing the regressions, no errors") | 31/31 pass with the checks matching the current contracts | Stale checks updated: (1) modal lease: a shadow sibling present at acquisition is inert, a late one stays interactive (outside-inert since 9b0f3643, as `markOthers`); (2) scroll repeat: waits for the popup's exit motion instead of a fixed 180 ms; (3) adoption and (4) icon tokens: expect the resolved `--tp-icon-size-sm` (3.5 spacing = 14 px) instead of the old 1rem; apiChecks 31/31 | Chrome apiChecks | passed | No component change for these four |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | No widget workaround; the emoji picker uses Select's reveal unchanged |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Lists render unchanged at rest |
| I-03 | Independent constituent options work, including placement separately from action behavior | passed | Arrow-bearing and padded lists both align correctly |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Root cause measured; user approved the core change |
| 1. Capability mapping | passed | C-01, C-02 mapped to V-01 to V-03 |
| 2. Architecture and composition reuse | passed | Fixed in the owning Foundation controller |
| 3. Behavior | passed | Start and nearest alignment verified with real input |
| 4. Presentation and customization | passed | Scroll padding follows the list padding token |
| 5. Accessibility | passed | Focus and highlight behavior unchanged |
| 6. Visual and interaction inspection | passed | Emoji picker screenshot inspected |
| 7. Documentation and demo reuse | passed | No public API change; nothing to document |
| 8. Regression and reconciliation | passed | Full suite, lint, typecheck, build; Select fixture compared at HEAD |

## Documentation synchronization

No documentation change: no public API or documented behavior changes.

## Completion / handoff

Implementation: VirtualList honors scroll padding; Select declares it. Nothing committed; the user commits.
