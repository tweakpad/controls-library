# Color gradient input fixture

Browser verification of `tp-color-gradient-input`, driven only through the Chrome DevTools MCP
tools (never another driver). The record lives in
`plans/widgets/color-gradient-input/implementation-checklist.md`.

1. `npm run dev` (Vite on port 5173), then open
   `http://localhost:5173/tests/fixtures/widgets/color-gradient-input/` with `navigate_page`;
   `?built` loads `dist/` instead of `src/` after `npm run build`.
2. `html[data-fixture-ready]` marks the bootstrap. Run the helpers on a fresh load, in this
   order, since they edit the instances: `assertPointer`, `assertControlled`, `assertForm`,
   `assertStates` on `window.colorGradientInputAPI`. Each returns `{ checks, passed }`.
3. `take_snapshot` lists every stop and midpoint slider ("Fill: Stop 2 of 4") and the remove
   Button; use `click` and `press_key` on them for real keyboard input. Pointer sessions on the
   track are synthetic (`pointer(element)` dispatches on the element under each point).
4. `take_screenshot` for visual evidence under `tmp/component-verification/color-gradient-input/`.

Instances: `#default` (four stops, second selected), `#field` in `#form` (named `ramp`, with a
reset Button), `#rtl` (a 0.2 midpoint), `#sm`, `#readonly`, `#disabled`, plus `#before` and
`#after` focus stops. `assertControlled` creates and removes its own late and silent owners.
