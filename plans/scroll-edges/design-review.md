# Scroll-edge design correction

The original implementation was a poor design decision. Enabling fades across the library by default required many surface-specific exceptions and protection rules, increasing complexity and regression risk. Using a CSS theme-token override as the ordinary per-component opt-out also confused component configuration with theming. The earlier verification overstated the quality of that design.

User-directed correction: retain the implementation, off by default, enabled only by the Boolean scroll-edge-fade attribute/property on a component. Theme tokens size the optional treatment; they are not the normal enable/disable API. Disabled adapters create no fade observers, scroll bindings, measuring probes or animation frames. Removing the attribute releases existing resources and restores content masks.

Validation is deliberately targeted to avoid repeating the host-impacting full-suite and build workload. Generated framework projections require refreshing for the new inherited property.

Live spec updated and committed as 08f4340a. API manifest and all framework projections regenerated (200 changed binding files). Docs checkers for Scroll Area and Table pass. Browser verification is blocked because the existing Storybook server on 6006 is unavailable (connection refused); no replacement server or full build was started.

Scope correction: the initial shared-base API declaration was itself too broad. Removed scrollEdgeFade from TpElement. Only interfaces already owning NativeScrollEdges (and Scroll Area, whose controller owns it) declare the property; their existing scrollable family derivatives inherit it. Buttons, inputs, switches and other unrelated controls must not receive it. Regenerate projections to remove the earlier global additions.

Scope verification: the regenerated manifest exposes the opt-in only on the 30 scrollable owner/family tags. Button, Input, Switch, Checkbox and Slider explicitly checked absent. Global base declaration is gone. The focused adapter and binding tests pass; no full build/suite or replacement browser server was run.

## Browser verification after the scope correction

The earlier unit-only completion claim was too strong. The existing Storybook
server subsequently became available; Chrome DevTools checked the live source
without starting a server or running a build.

- Scroll Area: actual overflowing viewport 286px high / 508px content. Default
  false, no attribute, zero probes/masks. Attribute addition: property true,
  one probe/mask. Attribute removal: false, zero probes/masks, content mask none.
  Property re-enable reflects the attribute and restores both boundary gradients.
- Real native ResizeObserver/MutationObserver instrumentation (native subclasses,
  no mocked delivery): zero fade observers at default; enabled environment MO
  observes 3 targets and fade RO 1; removal leaves all tracked target sets empty.
  Re-enable creates fresh observers; disconnection again leaves all target sets
  empty with zero probes/masks.
- Tree View and open Select: default zero probes/masks, opt-in one each, removal
  zero each. Sticky Table similarly enables its mask on the consumer-owned native
  TABLE in light DOM; removal restores it and removes its measuring probe.
- Initial markup opt-in checked separately from dynamic toggling.
- The rendered enabled Scroll Area was inspected. These are targeted runtime
  checks of opt-in and cleanup, not a new full-library visual-conformance claim.
