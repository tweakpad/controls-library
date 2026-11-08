# Text stroke responsive typography repair

## Delivery and source record

- Requested work / claim: bounded fix for issue #36, responsive glyph outlines.
- Scope source: user requested closing #37 with its fixing commit and working on #36.
- Repository baseline / unrelated changes: clean at 1bf2a27f; preserve subsequent user work.
- Live project / document IDs and revisions: direct MCP reads of Foundation, Component Library and Widgets, UI Library prj_c5a403a0-d1d5-4487-ac78-f4e545f46483 at 6720183f, 0.56.21.
- Owning contracts / dependencies / vocabulary: Foundation tm-lines, tm-resplit, tm-scrub, tm-a11y; Component Library ucl21-text-stroke (same typography and refresh after every line pass).
- Local reference evidence: inspected external directory and searched its extended component sources; no Text stroke counterpart. Existing component record confirms original effect. Local TextSplitter, TextRevealElement and text-outline are the shared behavioral owners.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP available. Existing Storybook on localhost:6006 reused.
- Evidence: Chrome page 38 reproduces font 44px versus outline 68px at fixed 500px host width. Original issue's observer diagnosis is outdated: current relayout skips unchanged word-to-line grouping, suppressing afterSplit.
- Evidence availability to the next agent: fixture and this record tracked; screenshots/logs under tmp are local only.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Refresh glyph typography and geometry after line measurements even without rewrap; chars and words | ucl21-text-stroke, tm-lines | text-outline.ts / outlineGlyphs | TextRevealElement layout hook, stroke refresh | docs/motion/text/text-stroke.mdx unchanged API | V-01 | passed | Built Chrome checks: 68px to 44px chars/words; 50px to 30px viewport font; horizontal geometry error 0px |
| C-02 | Preserve pending, revealed and scrubbed presentation without replay | tm-resplit, tm-scrub | TextRevealElement playback and piece-styles.ts | Reuse outline SVG and text nodes for metric refresh | Existing reveal documentation | V-02 | passed | Built Chrome: same SVG/text and transition start time; one reveal start and completion; scrub time 373.504ms retained at progress 0.450 |
| C-03 | Preserve accessible text and interactive descendants, lifecycle and shared siblings | tm-a11y, tm-structure, tm-edges | TextSplitter, TextRevealElement, TextMirror | No new observer, public API or visual recipe | Existing family documentation | V-03 | passed | Split/Mirror node retention, hidden/show/reconnect, link identity and accessible tree; 39 focused tests and build pass |

## Architecture and reuse

- Framework bindings: no public API, manifest or registration changes; inherited protected hook only.
- Keep layout observation and batching in TextRevealElement. Add an internal hook for measured layout with unchanged grouping; default no-op for siblings. Text stroke refreshes existing SVG/text in place using the existing outlineGlyphs owner, including after actual rewrap. Discard own mutation records after the hook.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Observation and line layout | Original effect; local TextSplitter.relayout | shared/text-reveal.ts | Add unchanged-layout hook; retain existing split event semantics | TextSplit, TextMirror, TextStroke / V-03 |
| Glyph layout and typography | Original effect; local outlineGlyphs | foundation/text-outline.ts | Optional existing SVG; preserve text nodes when runs stay stable | TextStroke / V-01, V-02 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Outline | Original effect; mo-text-stroke presentation | mo-text-stroke/piece-styles.ts / data-tp-outline | Existing SVG outline and inherited typography | Refresh font, position and baseline; retain transition nodes and all styling | V-01, V-02 |
| Accessible text | Foundation tm-a11y | TextSplitter / data-tp-text | Existing split anatomy | Exclude accessible copies and SVG from outline walker | V-03 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| Resize fixture | Text effect | TpMoTextStroke and shared siblings | Source registration, V-01 to V-03 | Native text, formatting and link test semantic preservation; no substitute UI |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; rendered geometry | Fixed width 68 to 44px; viewport clamp; chars, words and wrapped lines | Outline typography and baseline match HTML after resize | 68px to 44px all modes; rewrap 6 to 3 lines; viewport 50px to 30px and back, xError 0px | Chrome DevTools page 39, resize.html?built | passed | Source and built package checked |
| V-02 | C-02; playback | Resize pending, mid-reveal, completed and scrubbed text | Same SVG/text nodes; no replay or duplicate reveal events | Same SVG/text and running transition start; one start/completion; scrub at 0.450 and 373.504ms unchanged | Chrome DevTools page 39, runResizeChecks and runScrubResizeCheck | passed | 15 built-package assertions pass including V-01/V-03 |
| V-03 | C-03; regressions and semantics | Sibling split/mirror, hidden/reconnect, accessible text, link identity | No changes to sibling behavior, semantics or content | Shared siblings preserve word identity and pending state; reconnect font 40px, hidden/show 36px; link unchanged, SVG aria-hidden; snapshot exposes Read and more once | Chrome DevTools; 5 unit files/39 tests; tsc, ESLint, Stylelint and build | passed | Reduced motion settled immediately at 44px with no animations; no screen reader or axe claim |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Diff retains TextRevealElement shared observation and TextSplitter; only Stroke overrides the new default no-op hook |
| I-02 | Default visual regions match traced source and shared library recipes | passed | Chrome page 38: font and outline both 44px after 68px start, same SVG and SVG text nodes |
| I-03 | Independent constituent options work, including placement separately from action behavior | passed | Chars rendered after resize; words use the same per-piece helper; effect has no placement/actions; full combinations in V-01 |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Fresh direct specification reads, issue repro, clean source and local family owners inspected |
| 1. Capability mapping | passed | C-01 through C-03 map requested typography repair and interactions to V-01 through V-03 |
| 2. Architecture and composition reuse | passed | Existing observation, layout and glyph owners retained; no new observer or public contract |
| 3. Behavior | passed | All 15 durable browser assertions pass against built package; focused foundation checks 39/39 |
| 4. Presentation and customization | passed | Font sizes match at 30, 36, 40, 44 and 50px; currentcolor recipe unchanged; no new tokens |
| 5. Accessibility | passed | Hidden SVG and accessible copies preserved; Chrome tree has Read and link more exactly once. Bounded invariant check, no axe or screen-reader claim |
| 6. Visual and interaction inspection | passed | Built Chrome 600px dark and 1000px light; outline drawing screenshot inspected at 44px; viewport resize, active/revealed/scrubbed states and reduced motion checked |
| 7. Documentation and demo reuse | passed | Existing Storybook source repro repaired on page 38; no authored docs/API change; durable fixture composes actual text-family elements |
| 8. Regression and reconciliation | passed | tsc, build (97 docs), ESLint, Stylelint, formatting, diff check; 39 unit tests across outline/split/reveal/layout owners; Split/Mirror rendered checks |

## Documentation synchronization

No authored documentation or public API change is planned. Verification stays in tests/fixtures.

## Completion / handoff

The shared line pass now notifies effect geometry when word-to-line membership is unchanged.
Stroke refreshes its outlines through the existing helper and reuses SVG/text nodes, including
when line membership does change. No new observers, dependencies or public API.

- Reproduction: original computed host 44px / outline 68px; repaired 44px / 44px.
- Checks: 5 focused unit files, 39 tests; TypeScript; build; production ESLint and Stylelint; fixture ESLint; Prettier and git diff checks. Heavy commands ran sequentially with unit workers capped at two.
- Browser: source repro and built package; 15 assertions, viewport clamp 50px to 30px and back, light/dark; reduced motion immediately settled at 44px with zero animations. Running transition identity and scrub animation identity/time preserved.
- Visual evidence: Chrome screenshots inspected inline (44px drawing glyph outlines, light/dark settled text). MCP refused persistence to this workspace path, so no screenshot files are claimed. Durable fixture and this record remain available in Git.
- Accessibility: Chrome tree and DOM invariant checks only; no new keyboard behavior, screen reader test or automated accessibility scan claimed.
- Delivery: bounded #36 resize repair; no full-library conformance or full-suite claim. Existing broader component record is preserved.
- #37 closed with commit e9eb0fa3 and its existing measurement report; no fresh glow benchmark claimed.
- Commit/publish: no commit or release created; #36 remains open for the repair commit.
- Record checker: implement, verify and complete passed. Temporary fixture server and both agent-created Chrome tabs stopped/closed.
- Observed limitation: Vite logged one `ResizeObserver loop completed with undelivered notifications` warning during the combined resize fixture at 00:11:58. All geometry/state assertions passed; its origin was not isolated or baseline-compared, so this record does not claim a warning-free resize pipeline.
