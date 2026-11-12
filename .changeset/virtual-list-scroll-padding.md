---
'@tweakpad/ui': patch
---

Rows that a virtualized list scrolls into view keep the list's scroll padding, as native scrolling does: Select and the Emoji picker no longer place a revealed row flush against the edge or under the scroll arrows, and jumping to an Emoji picker category no longer shifts its label.

Replacing the slotted trigger of an open Tooltip, Popover or other anchored surface now hands the surface to the new trigger: it is described or controlled and positioned against, instead of the surface staying bound to the removed element.
