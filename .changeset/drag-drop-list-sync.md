---
'@tweakpad/ui': patch
---

Drag and drop list: a list mounting many rows registers them for dragging in one pass instead of one pass per row, so a list of 200 items first renders about three times faster.
