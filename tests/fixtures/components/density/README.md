# Density regions fixture

Served by the Vite dev server (`npm run dev`), driven only through Chrome DevTools MCP. Append
`?built` to load the built package.

1. Navigate to `http://localhost:5173/tests/fixtures/components/density/` and wait for
   `html[data-fixture-ready]`.
2. `await densityAPI.assertDensity()` returns `{ passed, checks }` on a fresh load:
   - D01: the compact region re-derives the scale from its seed (control height 24px against 32px).
   - D02: Button, Input, inline Slider and Switch are smaller in the compact region.
   - D03: a `density="default"` island inside the compact region restores the default scale.
   - D04: a library element with `density="compact"` inside an application shadow root takes it.
   - D05: Select popups of the compact region resolve the compact scale, in place and portaled to
     the document body.
   - D06: setting `density` on a region updates an open portaled popup.
   - D07: the `density` property reflects to the attribute, applies, and clears.
3. Inspect the regions in both color schemes: controls of the compact region share one compact
   height, the island and the default card keep the default height.
