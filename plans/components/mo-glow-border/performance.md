# Glow resource lifecycle: issue 37

Baseline: c148dd70124f89439151ad8db307821f44cb4991. Candidate: working-tree resource lifecycle changes.
Chrome 156 on macOS 27.2; DPR 2. Memory snapshots used 1624 × 900, timing and static-pixel checks
used 1624 × 956. Card and canvas dimensions were fixed across both revisions. CPU model could
not be read through the sandbox. All runs were sequential.

## Measurements

Thirty 400 × 220 library Card surfaces, two 900 × 540 backing canvases per active surface:

| Scenario | Baseline backing bytes | Candidate backing bytes | Change | Allocated canvases before → after |
| --- | ---: | ---: | ---: | --- |
| Inactive | 116,640,000 | 0 | −100% | 60 → 0 |
| All near | 116,640,000 | 116,640,000 | 0% | 60 → 60 |
| Ten near, twenty far | 116,640,000 | 38,880,000 | −66.7% | 60 → 20 |
| All far | 116,640,000 | 0 | −100% | 60 → 0 |

111.24 MiB becomes 37.08 MiB in the mixed case. DOM canvas count remains 60. Both versions
already performed zero settled far-offscreen paints during the five-second sample.

Three five-second timing samples per revision/scenario, after a two-second warm-up:

| Metric | Baseline samples | Candidate samples |
| --- | --- | --- |
| All-near paint p95, ms | 0.8 / 0.9 / 0.9 | 0.8 / 0.8 / 0.8 |
| All-near frame interval p95, ms | 34.3 / 34.2 / 34.3 | 34.3 / 34.3 / 34.3 |
| Mixed paint p95, ms | 0.8 / 0.8 / 0.8 | 0.8 / 0.8 / 0.8 |
| Mixed frame interval p95, ms | 34.0 / 33.9 / 33.9 | 34.3 / 34.3 / 34.3 |

Every timed sample had zero backing-dimension changes. There is no established active CPU
or frame-rate improvement. Visible-mode cards overlap to exercise all renderers without
changing the viewport; the results do not measure an application-wide compositor gain.

## Lifecycle and appearance evidence

- Twenty one-second exit/re-entry cycles: 116,640,000 bytes on every entry and zero on every exit.
- Removing elements while retaining their references: zero backing bytes; reconnecting inactive
  elements: zero bytes.
- Held reduced-motion sweep: baseline/candidate dimensions and SHA-256 hashes match for both
  glow and bloom. Post-re-entry hashes also match baseline. The bloom hash changes after its
  first read/re-entry in both revisions; this is not introduced by candidate suspension.
- Representative sweep, pulse, comet and inactive-hover composition inspected in Chrome.
- Real hover allocated the inactive pair; leaving and settling the fade released it.

Raw JSON is under `tmp/component-verification/mo-glow-border/resource-lifecycle/` locally;
those ignored artifacts are not shipped. The fixture and this report are reproducible inputs.

## Verification and remaining work

- Full suite: 444 files, 6,265 passing tests, three skipped; 120.43 seconds with one worker.
- Additional paired renderer lifecycle test and eight CanvasSurface tests pass.
- Package build passed; generated framework bindings had zero changes.
- Built fixture repeats the backing-store results above at 1624 × 956 / DPR 2.
- Built Segment Border: 708 × 398 paired canvases → zero → 708 × 398, with identical geometry and child definitions.
- Plot canvas resized 1400 → 1000 device pixels wide and reconnected at the new size. Color triangle reconnected at 240 × 240 and passed triangle mapping assertions; Flow minimap reconnected at 396 × 296. No console errors in those consumer checks.
- Real focus/Tab: focus glow allocated 708 × 164 canvases, then released after blur/fade. Keyboard focus on the ordinary pointer wrapper retained its visible SVG focus ring. Reduced motion left sweep lit and comets zero-sized.
- Exploratory built re-entry sample: thirty allocation paints, median 1.7 ms, p95 3.2 ms, maximum 3.4 ms, 53.2 ms total; 120 dimension writes (two dimensions × two canvases × thirty cards). This is synchronous call cost, not presentation latency. Re-entry trades allocation work for reduced retained memory.
- The final twenty-cycle allocation-timing run was interrupted when the Chrome target closed. Its incomplete results are excluded. Browser reconnection timed out; final DPR/theme/forced-colors and moving re-entry inspection remain open. Earlier lifecycle-cycle and timing measurements above completed successfully.
- Built instrumentation must import class modules through literal imports: Vite's dynamic import query injection can otherwise create a second module identity and miss prototype counters. Native backing-size counters remain independent. The fixture uses literal branches to avoid that problem.

Final source TypeScript, targeted ESLint/stylelint, formatting and diff checks passed. The record completion checker correctly remains blocked at gates 6 and 8 due to the interrupted browser matrix.

## Expanded affected-consumer browser regression (Chrome reconnected)

All five consumer groups were exercised through Chrome DevTools MCP against built modules.

| Consumer | Actual checks | Result |
| --- | --- | --- |
| Glow Border | All 32 wrapped-surface geometries; light/narrow/fractional-DPR composition; forced-colors canvas hiding; sweep/comet/pulse/inactive visual inspection | Geometry within existing 1 CSS-pixel tolerance; only zoomed case needed that tolerance |
| Segment Border | All 29 geometries including plain/glowing segments and zoomed surfaces; rendered scanner/wrap/exit inspected | All within existing 1 CSS-pixel tolerance |
| Plot | Incremental/full pixel equality after pushes and latest replacement; DPR 1.25; zero-rate hold/manual paint; pause/resume | Zero mean and bad-pixel fraction in all three comparisons; scheduling assertions passed |
| Color Picker / triangle | Value lane, triangle mapping, handle-press and cleanup assertion helpers; real keyboard change; hue changes verified with pixel hashes; direct triangle reconnection followed by hue change | All helper reports passed; keyboard changed #0000ff to #0004ff; hue and post-reconnect pixels changed |
| Flow / minimap | Viewport/cleanup helpers; graph populated with 12 nodes; rendered graph/minimap inspected; real Pan right button; viewport-driven pixel change; direct minimap reconnect | Helpers and populated repaint passed; Pan right changed x from 0 to -85.8; direct minimap reconnect FAILED |

Handle/cleanup helper pointer events are synthetic; real keyboard and Pan right actions were
performed separately through native MCP input. The initial minimap fixture is empty until
explicitly populated. Its nonzero canvas dimensions are not proof that nodes render.

The direct minimap failure was reproduced with the pre-change CanvasSurface transpiled from
HEAD, then candidate build artifacts were restored. The minimap source is unchanged by the
patch: firstUpdated creates its surface, disconnectedCallback disposes it, and direct
reconnection does not recreate it. Parent Flow reconnection had concealed this gap.
A durable reproduction is tests/fixtures/widgets/flow/minimap-reconnect.ts. No minimap
production repair is included in this performance patch. Overall regression status remains
failed for that scenario; this report does not certify complete component conformance.

### Minimap reconnect repair

The failure above is now fixed in TpFlowMinimap. Initial render and reconnection share one
connection routine that recreates CanvasSurface, the scheduler and pointer drag exactly once;
disconnect resets the panning marker, and reconnect invalidates the theme-color cache.
The stored scene and existing canvas remain intact. Five repeated direct-reconnect checks
passed against source, and another five passed against the rebuilt package. Real canvas
clicks after reconnection panned x from 100 to -1221 and released the panning marker.
TypeScript, targeted ESLint/stylelint and the package build passed. This resolves the
specific failing affected-consumer scenario; it does not retrospectively certify the full catalog.

Focused Flow/CanvasSurface checks: five test files, 27 tests passed (one worker, 2.98 seconds).
