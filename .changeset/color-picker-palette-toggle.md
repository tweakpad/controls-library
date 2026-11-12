---
'@tweakpad/ui': patch
---

Color picker: a palette Toggle after the eyedropper opens the Color palette over the picker's body, filling it exactly whatever the views and controls; Escape or the Toggle closes it, and `palette="false"` removes the Toggle. The swatches view is removed (`views` no longer accepts `swatches`). Color palette: `fill` makes the palette take its container's width and height: the grid fits as many whole cells as the width holds and stretches them so the columns span the full width, the list takes the height left, and its toolbar, list and status bar drop their side insets so they meet the container's edges.
