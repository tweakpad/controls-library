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
