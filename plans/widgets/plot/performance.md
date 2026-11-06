# Plot performance and raster evidence

Measured through Chrome DevTools MCP, 2026-11-06. macOS, Chrome 156.0.0.0, CPU slowdown 1x,
320 x 100 CSS pixel monitor surfaces, DPR 2, one signed area series per monitor. Development fixture,
no builds/tests during the reported paint comparisons. These numbers measure synchronous Canvas
submission/geometry, not total GPU cost. The benchmark is opt-in; nothing polls on fixture load.

| Scenario | Mean per paint | Paint p95 | Mean batch | Batch p95 |
| --- | --- | --- | --- | --- |
| 32 incremental, 1024 retained / 1023 visible intervals | 0.066 ms | 0.200 ms | 2.34 ms | 3.90 ms |
| 32 full redraw, same data | 0.196 ms | 0.300 ms | 6.40 ms | 10.30 ms |
| Same incremental scenario while Chrome traced | 0.052 ms | 0.200 ms | 1.80 ms | 3.00 ms |
| 32 incremental, sparse 120 intervals | 0.064 ms | 0.200 ms | 2.26 ms | 7.80 ms |
| 32 full, sparse 120 intervals | 0.053 ms | 0.100 ms | 1.76 ms | 2.50 ms |

Each stress batch paints every graph once per display frame for twenty frames. A real 10 Hz
shared scheduler spreads due jobs across frames within the budget; this stress test deliberately
bypasses that scheduler. A small sparse path can be cheaper to replay than to blit a canvas. Do not
promise incremental is faster in every workload. The dense example reduced batch CPU about 2.7x.

Isolated single-monitor twenty-paint runs recorded 0.30-0.35 ms mean, 0.50-0.60 ms p95. The initial
0.5 ms p95 target is not established by these short noisy runs. Longer intended-rate evidence is
recorded below when available. Increasing retention from 1024 to 16384 with the same 120 interval
window kept redrawn-column counters identical (826 columns across initial + 20 updates); geometry
does not traverse retained history on ordinary eligible updates.

Incremental warm state: one full paint plus twenty incremental paints; shifted 12 device pixels and
redrew 832 total columns (including initial 640). Full baseline: 21 full paints and 13440 columns.
The ordinary production path performs no pixel readback; readback belongs to this comparison fixture.

## Raster correctness

`raster-check.ts`, two overlapping signed/baseline areas with a dashed series, gaps, capacity 48,
window 24, 240 x 100 device pixels. Forty ordinary pushes after initial warmup, then peak/retraction:

| Interpolation | Wrap mean channel difference / 255 | Channels differing >24 | Full redraws during pushes/latest |
| --- | --- | --- | --- |
| linear | 0.1435 | 0.0719% | 0 |
| step-before | 0.0086 | 0.0042% | 0 |
| step-after | 0.0150 | 0.0083% | 0 |

Latest replacement never shifted history. Reset caused one full rebase and zero pixel difference.
DPR 1.25, 425 x 133 device pixels: 216 ordinary pushes, capacity fixed at 256, no full redraws;
765 accumulated integer pixels. At final integer alignment mean difference 0.027/255, no channel
differed by more than 24. Fractional presentation can differ more from freshly rasterized geometry:
observed mean 0.984/255 and 1.785% channels >24 at a half-pixel position. This is an explicit
antialiasing boundary; backing pixels themselves only move by integers and are never repeatedly
resampled. At DPR 2 the original 40-update comparison stayed below 0.335/255 mean.

## Trace boundary

A Chrome performance trace was recorded for the dense incremental dashboard. The registered MCP
summary reports CLS 0 and normal ~16 ms frame spacing, but does not expose raster/composite/GC
duration totals in its returned insight set. Screenshot file export is denied for this workspace by the MCP
server. GPU time and allocation totals were not exposed in the returned trace summary and remain unverified; callback timing is not a substitute.

## Intended-rate follow-up

After removing redundant signed clipping for runs wholly above/below their baseline, 100 updates
at 10 Hz (after warmup) measured **0.335 ms mean, 0.500 ms p95** paint submission. One full initial
paint, then 100 incremental paints; 533 integer shifted pixels, 1585 total redrawn columns including
initial 640. This meets the planned single-monitor CPU target on this recorded run.

A real shared scheduler, 32 monitors, 1024 retained/1023 visible intervals, budget 1 ms/count 4,
60 display frames with producer writes every frame: aggregate paint callback work **0.793 ms/frame
mean, 1.300 ms p95**. 219 callbacks; every plot received 6-7 incremental paints and retained exactly
1024 raw samples. The per-plot 10 Hz rate is a cap; the budget fairly defers work rather than
promising ten paints per second. The wrapper measured the public scheduler job callback, not an
unrelated module prototype. No total GPU or GC timing claim follows from these CPU figures.

## Final raster comparison correction

The earlier raw differences above include a test-backend artifact: repeated pixel readback could
switch one Canvas to software rasterization while the comparison cache still contained GPU
pixels. The fixture now requests `willReadFrequently` on both test canvases before painting.
Production canvases retain their normal backend and never perform pixel readback. The full
baseline redraws all geometry on the same fractional pixel lattice as the cache; backing shifts
remain integer-only, with a two-pixel right guard. Dash reduction keeps original path phases.

Dense 1100 initial samples, capacity 2048, window 1024, 240 x 100 device pixels, forty pushes,
then latest peak/retraction, produced these stable same-backend results:

| Interpolation | Raw mean difference / 255 | Visible mean difference / 255 | Visible channels differing >24 |
| --- | --- | --- | --- |
| linear | 0.0596 | 0.0323 | 0 |
| step-before | 0.0272 | 0.0223 | 0 |
| step-after | 0.0153 | 0.0169 | 0 |

Visible error uses the larger composited RGB error against black and white backgrounds, bounding
all opaque backgrounds. Ordinary pushes/latest changes caused zero full redraws; latest changes
shifted zero pixels. Reset caused one full rebase with zero difference. These results supersede
the earlier raster table; callback timing remains independent of total GPU cost.

## Final production-code timing repeat

With the final guard, decimation and presentation repairs, no concurrent build/test stage:

| Scenario | Mean | p95 |
| --- | --- | --- |
| Single monitor, 100 updates at 10 Hz, paint CPU | 0.293 ms | 0.600 ms |
| 32-monitor shared scheduler, aggregate CPU per display frame | 0.780 ms | 1.500 ms |
| 32 dense monitors, incremental batch CPU | 2.850 ms | 10.700 ms |
| 32 dense monitors, full redraw batch CPU | 7.690 ms | 10.600 ms |

The dense mean reduction remains 2.7x; the short batch p95 is noisy and showed no improvement.
The single-monitor 0.5 ms p95 target was not met in this final repeat; the earlier 0.5 ms result
is not a guarantee. The scheduler executed 200 callbacks, fairly distributing 5-6 incremental
paints per plot across 60 frames, with every history bounded to 1024 samples. All 100 ordinary
single-monitor updates were incremental (one initial full paint); no latest revision shifted
pixels. The final dense raster repeat reproduced the corrected table above exactly.
