# Glow backing-store measurements

Open `performance.html` in this folder on the Vite server through Chrome DevTools MCP.
Use a 1624 × 956 viewport at DPR 2. The surface border boxes are 400 × 220 CSS pixels;
backing canvases include the renderer's existing bloom margin. The fixture deliberately
uses library Cards. Its layout styles control test geometry, not component presentation.

`glowPerf.set(mode)` selects `idle`, `visible`, `mixed` or `far`:

- `idle`: every trigger is off.
- `visible`: all 30 wrappers intersect the viewport. Cards overlap to fit the fixed viewport;
  this is a renderer stress case, not a visual/compositor benchmark.
- `mixed`: ten wrappers intersect and twenty are translated far outside the clipped stage.
- `far`: all thirty are translated outside it.

Wait two seconds after switching, then call `await glowPerf.sample(5000)` three times.
Take `glowPerf.snapshot()` separately; it records each canvas dimension and the sum of
`width × height × 4`. This is an RGBA8-equivalent estimate, not GPU-resident memory.

`sample()` records synchronous renderer paint-call timings, animation-frame intervals,
clear counts and backing-dimension writes. Empty paint calls are included. Color/pixel
readbacks must run outside samples. The instrumentation wraps native methods only in this
fixture; call `glowPerf.restoreInstrumentation()` after measurement or close the page.

For eviction/re-entry, alternate `far` and `visible` twenty times, dwelling one second per
state. Record backing bytes after every transition. For disconnect, retain `glowPerf.cards`,
remove the elements, inspect the retained shadow-root canvases, then append them again.

Compare the same fixture against the recorded baseline revision and candidate source.
Use one server/tab at a time; stop all stress effects with `glowPerf.set('idle')` before
running checks, and close the tab afterwards. Do not compare development-source timing
with built-package timing as if they were the same measurement.
