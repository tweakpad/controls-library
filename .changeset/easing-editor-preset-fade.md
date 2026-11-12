---
'@tweakpad/ui': patch
---

Easing editor: the preset list fades out at the edges where more presets are scrolled out of view.

Easing editor: switching between Ease and Spring no longer gets stuck when an owner refuses the converted curve, for example a spring's overshoot as a cubic Bézier. The editor then proposes the category's starting curve instead, and only refusing that too keeps the current curve.

Easing editor: a `fade` preview mode raises the preview square's opacity from 0 to 1 along the curve; the mode button cycles to it after Rotation.
