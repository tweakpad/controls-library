---
'@tweakpad/ui': minor
---

Add Patterns: real-case templates built from library components, each documented in `docs/patterns/` and shipped with a registration entry. The first is Auth (`@tweakpad/ui/patterns/auth`): sign in with providers, create an account, password recovery and reset, and a verification code, with pending states and errors that never reveal whether an account exists.

Input gains `revealable` (a Toggle that shows a password as plain text, hidden again on submit and reset) and `reveal-label`; Input and Text area forward `inputmode` and `enterkeyhint` to their native editor. New icons: `icons/eye`, `icons/eye-off`, and `icons/brands` with the Apple, Microsoft and GitHub marks and the Google mark as an image URL, under `NOTICE.brands`.

A press on a link or control inside a Checkbox or Radio group item label now acts on its own, as inside a native label, instead of also toggling or selecting the item.

One-time code field gains `variant` (`default`, `underline`, `bubbles`): a line under each character, or every slot as a separate circle, with groups kept apart by their separator. An empty code no longer adds space below its slots that the first character took away.
