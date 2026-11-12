---
'@tweakpad/ui': patch
---

Color picker: the inline panel opens with the preview swatch, the eyedropper and the format Select in one row, above the views; the hue Slider spans the full width, the alpha Slider ends with its opacity field, and the color fields fill the last row on their own. Each field is sized to its widest value, so formats such as OKLCH and CMYK never cut their values off. `fields="false"` now hides only the value fields, as documented.
