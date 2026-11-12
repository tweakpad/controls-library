---
'@tweakpad/ui': patch
---

Scroll edge fades keep fading a focused list that points at its current item through `aria-activedescendant`, including that item: a Scroll area with `scroll-edge-fade` now sets its viewport's scroll padding to the fade size, so content revealed by keyboard, focus or a list's current item stops clear of the fade. Before, focusing such a list, for example by choosing a color in the Color palette, turned its fades off, and hovering a color at the edge left a hard unfaded strip around it.
