# widgets/color-picker

## B items

| Item | Disposition | Target |
| --- | --- | --- |
| md: (intro) | merged | ## Usage |
| md: Value and formats | merged | ### Formats |
| md: Views and layout | merged | ### Popup |
| md: Harmony and schemes | merged | ### Views |
| md: Interaction and events | merged | ### Listening to changes |
| md: Keyboard and pointer | appended | ### Keyboard and pointer |
| md: Constituents and accessibility | appended | ### Constituents and accessibility |
| md: Forms and Field | merged | ### In a form |
| md: Parts and customization | dropped-api | parts, markers and private variables |
| md: Usage guide | in-A | ## Usage sections |
| example: Live value | in-A | ### Listening to changes |
| example: Controlled owner | in-A | ### Controlled, with limits |
| example: Rejecting proposals | in-A | ### Controlled, with limits |
| example: Popup in a form | in-A | ### In a form |
| example: Channel sliders | in-A | ### Views |
| example: Harmony wheel | in-A | ### Views |
| example: Hue triangle | in-A | ### Views |
| example: Saved and recent colors | in-A | ### Swatches and collections |
| example: Schemes | in-A | ### Swatches and collections |
| example: Right-to-left | in-A | ### Right-to-left |
| story: Popup | dropped-storybook | fixture |
| story: ChannelSliders | dropped-storybook | fixture |
| story: HarmonyWheel | dropped-storybook | fixture |
| story: HueTriangle | dropped-storybook | fixture |
| story: Schemes | dropped-storybook | fixture |

## Forced edits

| Kind | A text | Reason |
| --- | --- | --- |
| prose | `picker="popup"` puts the panel in a Popover opened from a swatch Button | The popup trigger became a Color input (`tp-color-input`), so it is no longer a swatch Button |
| heading | Swatches and schemes | The schemes view was removed; the swatches view composes the Color palette with swatch collections (2026-11-11) |
| prose | Saved swatches are a property, set from data | The schemes view was removed; gradients and combinations live in the Color palette (2026-11-11) |
| preview | Brand swatches | `views` loses `schemes` with the removed view (2026-11-11) |
| prose | Without consumer data the widget generates tints, shades, tones, analogous, complementary, triad and tetrad rows | The schemes view and `schemes` property were removed; the paragraph names the default collection instead (2026-11-11) |
| prose | `metadata` carries the floating-point `color` of the proposal | The `scheme` surface was removed with the schemes view (2026-11-11) |
| prose | Swatches, schemes keyboard row | The swatches view is a Color palette with its own keyboard model (2026-11-11) |

| preview | Popup in a form | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Harmony wheel and triangle | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Reading the palette | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Commit events | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Controlled owner | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Surface only, and fields without a format choice | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Small and read-only | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |
| preview | Right-to-left | User-authorized Stack layout migration: replace equivalent flow CSS while preserving content, native semantics and existing dimensions. |

| preview | Color input trigger | User-authorized width cleanup: remove incidental framing and use preview stretch; retain capability dimensions. |
