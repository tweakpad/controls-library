# One-time code field checks (Chrome DevTools MCP)

Open `/tests/fixtures/components/one-time-code-field/` on the Vite server (`npm run dev`); append
`?built` after `npm run build`. Each column is one `variant` (default, underline, bubbles) with a
plain code, a grouped code (`[3,3]`), an invalid, a disabled and a masked one. `window.slots(id)`
returns each slot's box, border widths, radius, fill, focus shadow and active marker.

1. `default-*`: each group is one joined strip with rounded ends (inner slots have no start border).
2. `underline-*`: every slot shows only a bottom border (`0px 0px 1px 0px`), no radius, a gap
   between slots and a wider one around the separator. Click a code and type: the active slot's
   line turns the focus color and doubles (`box-shadow` inset), with no outline; the character
   does not move.
3. `bubbles-*`: every slot is a circle (equal width and height, full radius, a border on every
   side), spaced apart; with `[3,3]` the groups are separated by the dash and a wider space. The
   active slot shows the field focus ring around the circle.
4. Invalid shows the destructive line or edge; disabled dims; masked shows dots; the selection
   (Shift+Arrow) fills slots in every variant.
5. Accessibility tree: one textbox per field, named by its Field, in every variant.

Check light and dark themes and compact density.
