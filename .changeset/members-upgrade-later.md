---
'@tweakpad/ui': patch
---

Groups now work when their members are defined after them, as with per-component registration. Toggle group, Radio group, Form, Menubar and Navigation menu wait for their members to upgrade before using them, then pick them up. Before, Toggle group, Form and Menubar threw, Radio group left every item disabled, and Navigation menu treated its items as plain elements. Field waits for its library control instead of reading it as a native one, so it no longer starts out dirty. Message scroller reads items that have not upgraded from their attributes, so its starting scroll position is the same in either order.
