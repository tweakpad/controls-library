---
'@tweakpad/ui': patch
---

Calendar now switches its weekday headers to narrow locale labels when the short labels do not fit their cells. The headers keep their short accessible names, and `CalendarAdapter.weekdayLabel` accepts an optional `narrow` width for custom adapters.
