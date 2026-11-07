# Native scroll-edge verification

Serve the repository with Vite and open this directory through Chrome DevTools MCP.
Append `?built` to exercise the built package. The fixture composes the actual library controls; the native buttons in Tabs are its
supported authored tab anatomy. It does not emulate pointer or keyboard events.

- Inspect Scroll Area, Message Scroller, sticky Table, Tabs, Select, Code Block,
  nested Resizable Panels, Tree View, Attachment Group, Navigation Panel Content,
  native Carousel, Flow Palette/Inspector and the editor preview.
- Scroll each native viewport to its start, middle and end. Its computed mask must
  remain `none`; only content layers receive `data-tp-scroll-edge-mask`.
- Set `--tp-scroll-edge-fade-size` on an ancestor to `0px`, `16px`, a font-relative
  length and an oversized length. Zero removes the mask; oversized bands stop at
  a quarter of the viewport or the remaining hidden distance, whichever is less.
- Resize a content layer from fitting to overflowing. Check both axes, RTL and
  vertical writing, fractional offsets and Scroll Area's `overflowEdgeThreshold`.
- Inspect dark/light/custom surfaces, sticky table headers/columns, focused tabs,
  return controls, copy buttons, resize handles and native scrollbars.
- Click a control, Tab to the conversation viewport and press PageDown. Test
  arrow focus reveal in Tabs and Select. Inspect the accessibility tree separately.
- Open Dialog/Popover using their public `setOpen` methods. Constrain the Dialog
  content through its public CSS part to exercise native overflow; close/reopen.
- Load the existing editor fixture's engine factories when testing an editable
  document. Exercise each supported engine, real typing and caret movement, a
  wide table and engine replacement. Measuring probes must stay outside the
  editing DOM; table wrappers remain unmasked while table content fades.
- Emulate forced colors and reduced motion with Chrome MCP. Forced colors removes
  masks, while reduced motion retains the static edge cue.
- Change `ContentSecurityService` between suppression, nonce and default policy.
  Suppression must remove owned markers even when sibling controls share CSS.
- Remove/reinsert/adopt a Scroll Area into an iframe; verify cleanup and return.
  Observe settled animation-frame scheduling and style mutations: both stay zero.

The full-fixture accessibility audit currently reports the same existing
`scrollable-region-focusable` findings with the token enabled and disabled:
Resizable Group, its two plain-content Panels, the engine-less editor preview and
Navigation Panel Content inside its Provider. This rollout adds no semantics or focus stops.
Those findings are recorded separately from edge rendering and keyboard evidence.

## Composed sticky Table regression

`#composed-table` uses public table parts with native sticky elements in shadow
roots; `#table` uses an authored native table. Scroll each in both directions.
Headers, footers and pinned columns must retain their opaque backgrounds and text
at the top/bottom/side edges. Toggle sticky settings after render and verify the
protected regions follow the new geometry. Set the fade token to zero on only
`#composed-table`: it loses its mask while `#table` keeps its inherited fade.
Also inspect the Table docs' Sticky edges example at a nonzero vertical offset.

## Sticky Table of Contents exclusion

`#sticky-toc-area` holds the article and sticky ToC through Scroll Area's slot.
Scroll to the middle: the sticky aside gets an opaque mask region while the
article's visible edges keep their fade. Click a contents link; native navigation
and the active indicator must work. This is default sticky-region protection,
not a fade-disable rule on the article or the entire Scroll Area.
