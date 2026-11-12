---
'@tweakpad/ui': patch
---

Scroll edge fades keep fading a focused list that points at its current item through `aria-activedescendant`: only that item stays clear of the fade, and with no current item the list's edges fade as when it is not focused. Before, focusing such a list, for example by choosing a color in the Color palette, turned its fades off.
