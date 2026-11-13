# Layers fixture

Browser verification of `tp-layers`, driven only through the Chrome DevTools MCP tools (never
another driver). The record lives in `plans/widgets/layers/implementation-checklist.md`.

1. `npm run dev` (Vite on port 5173), then open `http://localhost:5173/tests/fixtures/widgets/layers/`
   with `new_page` or `navigate_page`; `?built` loads `dist/` after `npm run build`.
2. `wait_for` the text `After layers`; `html[data-fixture-ready]` marks the bootstrap. The page sets
   the declared `tp-icon`s after the stacks read their markup, as a page script would.
3. Stacks:
   - `#markup`: declared `tp-layer` children. Title has a three-valued visibility (visible, hidden,
     solo) and a lock whose unlocked value shows only on the row's hover; Sun and Fog share a
     visibility with `scope="selection"`; Frozen has `enabled` false with a control; Empty group
     is a `group` without children; Title is `can-rename="false"` and Ground `can-remove="false"`
     on a stack that allows both.
   - `#controlled`: records owned by a script that publishes every proposal back, or refuses the
     event types in `layersAPI.reject`.
   - `#rtl`, `#sm` (small rows) and `#empty` (the empty slot).
4. `take_snapshot` lists each tree, its rows and their state controls. Use `click`, `hover`,
   `type_text` and `press_key` for real input:
   - a press selects one layer and makes it active; Shift+arrows extend, Space toggles one;
   - a state control steps to its next value, and the `tp-layer-state` `value` attribute follows;
   - a press on Sun's or Fog's control with both selected changes both;
   - Frozen can be neither selected nor moved; its own control turns it back on;
   - F2 or a double-click renames (Enter keeps, Escape cancels), Delete removes; Alt+ArrowUp and
     Alt+ArrowDown move the selection; Control+Enter picks a row up, arrows move it, Enter drops it.
   After each edit, `layersAPI.markup('<id>')` shows the rewritten `tp-layer`.
5. `window.layersAPI` exposes `events` (lane events, with `metadata.change`), `leaked` (constituent
   events that reached the document; it must stay empty), `reject`, `clear()`, `get(id)` and
   `markup(id)`.
6. Inject `/node_modules/axe-core/axe.min.js` with `evaluate_script` and run `axe.run(document)`.
