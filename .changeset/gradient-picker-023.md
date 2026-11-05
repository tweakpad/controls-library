---
'@tweakpad/ui': patch
---

Add the Gradient picker widget for editing linear color stops and two-dimensional color anchors. `<tp-gradient-picker>` supports dragging and keyboard editing, midpoints, selection, controlled and uncontrolled values, form submission, and localized labels. Declare editable stops with `<tp-gradient-stop>` children; edits update those children, and form reset restores their initial values. The widget also exports functions to sample linear gradients and render field gradients for canvas or textures, plus generated framework bindings through the widgets entry points.
