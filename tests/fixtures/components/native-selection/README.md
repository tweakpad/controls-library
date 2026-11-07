# Native selection

Serve the repository with Vite and open `/tests/fixtures/components/native-selection/index.html`
through Chrome DevTools MCP. Add `?built` after building to use the built package.
Do not use a separate browser driver.

- In the actual Native Select Multiple docs example and this fixture, click a row,
  Shift+ArrowDown, then Tab. Inspect focused and blurred selected paint and values.
- Change `--tp-selection` and `--tp-selection-foreground` on one host; other instances
  and `--tp-primary` must remain independent. Test light/dark and default/flat.
- Inspect 4px outer inset, 6px row inset, 28px rows; small rows are 24px. Compact
  extents follow tokens. Check grouped RTL, disabled options and native scrolling.
- Submit and reset; selected values remain native, disabled choices cannot be picked.
- Select all text in Input, Text area, scoped Input, document text, contenteditable
  and Easing's output. Verify foreground and background and nested token scope.
- Forced colors must show system Highlight/HighlightText in focused and blurred
  listboxes and text, with no inset theme shadow or hidden native focus indicator.
- Run axe on the fixture controls; distinguish real MCP input from API setup.

Chrome evidence does not establish Firefox, Safari or OS-picker pixel parity.

For the editor suppression regression, open the existing widget fixture
`/tests/fixtures/widgets/text-editor/index.html?only=classic&level=0`. Use each
editor's public `setContent()` to supply a paragraph and a two-cell table. Drag
between the real cells: both cells should retain their ordinary text foreground
under the existing range overlay. Ordinary paragraph selection must still use
the native selection token pair. Repeat with a dark color scheme.
