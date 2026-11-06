---
'@tweakpad/ui': patch
---

Improve Plot frame pacing and clock scrolling. A bounded raster atlas avoids copying the complete history on every frame, and solid backgrounds avoid an extra canvas composite. The live example collects at 10 Hz while scrolling independently at up to 60 Hz.
