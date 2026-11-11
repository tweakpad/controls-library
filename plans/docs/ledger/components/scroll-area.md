# components/scroll-area

## B items

| Item | Disposition | Target |
| --- | --- | --- |
| md: (intro) | merged | ### Overflow markers |
| example: Horizontal scrolling | in-A | ### Horizontal |
| example: Both axes | in-A | ### Both axes |

## Forced edits

| Kind | A text | Reason |
| --- | --- | --- |

| preview | Edge fade | The live scroll-edge contract replaces viewport masks with the inherited content-fade token, preserving scrollbar visibility. |
| prose | The host exposes `data-overflow-y-start` | The live contract now supplies content fades by default and exposes the shared distance token. |

| prose | Scroll-edge fades are off by default. | User-directed correction: enable through scroll-edge-fade rather than a token override. |

| preview | Horizontal | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Visibility | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| prose | `scrollbar-visibility` decides when tracks appear. | User request (2026-11-11): tracks show only while scrolling by default; the paragraph names the new default. |
