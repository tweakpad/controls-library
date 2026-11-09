# Text stroke checks (Chrome DevTools MCP)

Open `/tests/fixtures/components/mo-text-stroke/` on the Vite server (`npm run dev`); append `?built` after `npm run build` to load the built package. `window.sample(id)` returns each animated piece's fill color, outline opacity, dash offset and dash pattern; `window.textLog` holds the reveal events and `window.layoutShifts` the layout shifts.

1. On load, each piece's outline draws in the text color (dash offset from the dash length to 0), the fill fades in over the second half and the outline fades out at the end, in stagger order. When settled, `sample(id)` reports the text color as fill, outline opacity `0` and dash `0px`. `layoutShifts` is empty.
2. With the fill set to half opacity, the outlines lie exactly on the glyphs (screenshot comparison), including bold and italic runs and the link.
3. Resize the words box: lines rewrap as the original text would, outlines are rebuilt on the moved pieces, and the paragraph below never moves.
4. The custom-property case draws a thicker outline over 2.4 s.
5. Press Hide: the outline returns, the fill fades and the outline undraws, in stagger order; both reveal events fire. Press Reveal: it draws again.
6. Scroll the scrubbed case through the viewport and back: the outlines draw and the fill follows the scroll position in both directions.
7. Accessibility tree: each text is read once; outlines are `aria-hidden`. Under emulated reduced motion the text is filled immediately and the events still fire.
8. Light and dark themes, and a 400px viewport: outlines and fill follow the text color.

## Whole outlines (#39)

1. Load with `?outline` (outlines only, no fill). Once each case settles (`data-tp-at-rest`), `sample(id)` reports `dasharray: 'none'` and every glyph outline is whole. Repeat with `--tp-mo-text-stroke-length: 2em` on `#chars` and under emulated reduced motion: still `none` and whole.
2. Load with `?outline&slow` and press Hide on `#hold`: once hidden, no piece of any outline is left on screen. Press Reveal: outlines draw from their start; a contour longer than the dash completes when the reveal settles.
3. Scroll the scrubbed case both ways: the outlines draw and undraw with the scroll and leave nothing behind when undrawn.
4. On WebKit (Safari, iOS Safari), where DevTools MCP cannot drive the page, check 1 and 2 by eye. Serve with `npm run dev -- --host` to reach the page from a phone.

## Responsive outlines (#36)

Open `resize.html` on the same Vite server. In Chrome DevTools MCP, await
`window.runResizeChecks()` and then `window.runScrubResizeCheck()`; every returned
`passed` must be true. These assert fixed-width font changes for characters and
words, existing SVG/text and running-animation identity, completed reveals,
hidden/reconnected text, accessible-copy exclusion, link identity and shared siblings.
The fixture sets dimensions and fonts deliberately to exercise responsive typography.

After `runResizeChecks()`, change the viewport width through DevTools MCP and compare
`window.outlineState(document.querySelector('#responsive'))`: the outline font must
match the new HTML font, with `xError` below 0.1px. Repeat under light/dark appearance
and reduced motion (the mid-animation assertion requires normal motion).
Append `?built` to exercise the built package after `npm run build`.
