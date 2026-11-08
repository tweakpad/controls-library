# components/tree-view

## B items

| Item | Disposition | Target |
| --- | --- | --- |
| md: (intro) | in-A | hero |
| md: Two ways to supply items | merged | ### Records |
| md: Selection | merged | ### Multiple selection with checkboxes |
| md: Expansion | merged | ### Expanding from code |
| md: Preselection | merged | ## Usage |
| md: Lazy loading | merged | ### Loading children on demand |
| md: Virtualization | merged | ### Large trees |
| md: Reordering | merged | ### Records |
| md: Keyboard | appended | ### Keyboard |
| md: API | dropped-api | generated API Reference |
| md: API › `tp-tree-view` | merged | ## Usage |
| md: API › `tp-tree-item` | dropped-api | generated API Reference |
| md: Accessibility | appended | ### Accessibility |
| md: Customization | dropped-api | generated API Reference (CSS parts and custom properties) |
| md: Motion | appended | ### Motion |
| example: Records and custom rows | in-A | ### Custom rows |
| example: Checkbox selection with lazy loading | in-A | ### Multiple selection with checkboxes |
| example: Virtualized large tree | in-A | ### Large trees |
| example: Reordering | in-A | ### Records |
| example: Controlled lanes and built-in expansion | in-A | ### Controlled |

## Forced edits

| Kind | A text | Reason |
| --- | --- | --- |

| preview | From records, reorderable | Configure the tree before connecting it so the initial items and expansion lanes initialize correctly. |
| preview | Virtualized | Configure the initial record source and expansion before the first render; preserve bounded virtualization. |
| preview | Controlled lanes | Establish controlled items, value and expansion before connecting the tree; runtime mode changes are invalid. |
| preview | Lazy folders | Configure the initial items and loader before connecting; constrain the viewport so loaded children exercise native scrolling. |

| preview | Opening items | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Rendered rows | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Expand, collapse and reveal | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |

| preview | Tree view | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
| preview | Permissions | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
| preview | Chevron only | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
| preview | Small, no guides | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
