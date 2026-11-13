---
'@tweakpad/ui': minor
---

Calendar: `crossedOutDates` crosses out days that can still be selected, unavailable dates are now crossed out at full strength instead of dimmed, and disabled dates stay dimmed; a day both crossed out and disabled is crossed out and dimmed. `dayMarkers` (a map or a function of the date) puts up to three Status dots under a day's number, each with a `variant` or `color`, and their labels are read after the date. `today-indicator` marks today with the muted fill (default), an underline, a dot, or nothing. The day number now renders in the `calendar-day-number` part in the grid too, and the new `calendar-day-markers` part holds the dots. Day state gains `crossedOut` and `markers`, and days carry `data-crossed-out`, `data-today-indicator` and `data-markers`.
