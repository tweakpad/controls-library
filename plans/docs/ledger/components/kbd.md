# components/kbd

## B items

| Item | Disposition | Target |
| --- | --- | --- |
| md: (intro) | in-A | ## Usage |
| md: Key API — `tp-kbd` | dropped-api | API Reference |
| md: Group API — `tp-kbd-group` | merged | ### Separators and sequences |
| md: Composition and presentation | dropped-api | API Reference (presentation, dimensions, exports; data-menu-shortcut marker) |
| example: Group | in-A | hero |
| example: Button | in-A | ### In controls |
| example: Tooltip | merged | ### In controls |
| example: Input Group | in-A | ### In controls |
| example: Right to left | in-A | ### Localization and direction |
| example: Sequences and platform notation | in-A | ### Separators and sequences |
| example: Icon keys | merged | ### Icon keys |

## Forced edits

| Kind | A text | Reason |
| --- | --- | --- |
| prose | `key` renders platform notation | Key hint was renamed Kbd (`tp-kbd`) and its `key` property `value`: React and Vue reserve `key`, so no framework binding could set it |

| preview | Modifiers | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Icon keys | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Localized and right-to-left | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |

| preview | Input group | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
