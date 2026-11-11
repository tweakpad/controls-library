# Color palette fixture

Browser verification of `tp-color-palette`, driven only through the Chrome DevTools MCP tools
(never another driver). The record lives in `plans/widgets/color-palette/implementation-checklist.md`.

1. `npm run dev` (Vite on port 5173), then open
   `http://localhost:5173/tests/fixtures/widgets/color-palette/` with `new_page` or
   `navigate_page`; `?built` loads `dist/` instead of `src/` after `npm run build`, and
   `?only=<id>` keeps one instance for small accessibility snapshots and focused input.
2. `wait_for` the text `After palette`; `html[data-fixture-ready]` marks the bootstrap.
3. `take_snapshot` lists each palette's mode Tabs, the listbox and the options of the mounted
   window. Use `click`, `hover` and `press_key` on those uids for real input: Tab focuses the
   listbox and highlights the chosen color, arrows move in the grid (Left and Right follow the
   reading direction), Home and End reach the ends, letters jump to a name, Enter and Space pick.
   `#compact` shows the palette in a compact density region.
4. `window.colorPaletteAPI` exposes `events` (lane events on the palettes), `leaked` (constituent
   events that reached the document), `clear()`, `windowStats(id)` (mounted options, rows and
   labels), `cells(id, count)` (each cell's box, border, shadow and selection) and
   `stressCollection()` (the 600-color collection of `#large`).
5. Inject `/node_modules/axe-core/axe.min.js` with `evaluate_script` and run `axe.run(document)`.
