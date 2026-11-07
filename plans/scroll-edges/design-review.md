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

## Shared scrollable contract refactor

User approved replacing repeated declarations with an interface plus scoped runtime
mixin. Design: Foundation ScrollableInterface declares the public shape; Scrollable
mixin supplies the sole Lit property declaration and false default. Only the 18
existing native-scroll owner classes adopt it. TpElement and unrelated controls
remain unchanged. NativeScrollEdges remains the single fade lifecycle owner.
Existing component layout/state/presentation inheritance is preserved, including
abstract generic form bases. CEM mixin support was inspected before choosing the
class-returning factory form; generated API must retain the same 30-tag scope.
Verification: TypeScript no-emit, scoped unit/binding checks and live browser
attribute/property toggles. No full build or broad test suite.

### Shared-contract refactor verification

- `src/foundation/scrollable.ts` now owns ScrollableInterface and the scoped
  Scrollable mixin. Exactly one runtime Lit declaration and false default remain.
  Only the existing 18 scroll owners apply it. TpElement is unchanged.
- Generic form owners apply the mixin before specializing the generic constructor,
  preserving declaration-compatible named base types; final no-emit source
  TypeScript check passed. The checks caught and corrected that compatibility issue.
- Added the mixin module to CEM's explicit source list. Comparing generated public
  instance members, attributes, events, slots and parts against the prior manifest
  found zero API-name changes. Exactly the previous 30 scrollable family tags
  retain the property; Button/Input/Switch/Checkbox/Slider remain excluded.
  Framework projections were generated, never edited by hand.
- Three focused test files passed: five tests covering mixin isolation, default
  state, disabled adapter work and generated binding consistency. Targeted ESLint,
  formatting and diff whitespace checks passed.
- Live Chrome source checks passed for Scroll Area, Tree View and Select: false
  default/zero masks, property enablement/one mask, attribute/property removal/zero
  masks. Scroll Area re-enable and initial markup opt-in also passed.
- No full build or full test suite was run. Only the owned verification tab was
  closed; the existing Storybook server remained untouched.
