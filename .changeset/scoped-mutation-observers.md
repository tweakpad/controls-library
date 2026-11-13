---
'@tweakpad/ui': patch
---

Progress, Checkbox, Toast and Map no longer react to unrelated page changes. Progress now observes only its own content, the elements that label it, and its ancestors' direction, language and motion policy. It no longer forces a style read on every change anywhere in the document. Checkbox controls share one observer per tree, which wakes them only for native label changes. Toast copies its theme on changes to its own ancestors only. Map skips inline style writes that change no theme property.
