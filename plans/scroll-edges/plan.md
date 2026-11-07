# Shared scroll-edge presentation

Status: specification and inventory complete. Live specification committed as 702a150e23c785173b76443fcb8ba1d4091f11cc (0.56.16), zero validation diagnostics.
Scope approved by user: specification and affected-controls inventory only. No runtime rollout.
Repository baseline: 8aa517f; initial working tree clean. Live source read: e2b945d3bae6e713645ecbe8faf85aa43c5e1a53, version 0.56.15, clean, zero diagnostics.

## Contract

Introduce `--tp-scroll-edge-fade-size`, a non-negative CSS length, default **24px**. It inherits;
`0` disables the effect globally, per subtree or per control. There is no new component attribute,
style-selector token or fade-color token. Custom token sets must add the role when migrating.

Fade the alpha of the scrolling content to reveal the actual underlying surface. Do not assume
`--tp-background`: cards, popups, editor surfaces, nested themes and transparent surfaces must
remain correct. Each active edge uses the minimum of the configured size, remaining hidden
content distance and one quarter of its visible scrollport dimension. Combine both axes without
erasing central content. Show no fade at a reached boundary or when content fits.

Use existing owner thresholds, defaulting to zero when absent. Preserve their state semantics.
Resolve logical start/end through writing mode and direction. Reuse existing overflow observation;
coalesce scroll, programmatic movement, resize, content and direction reconciliation to at most
one animation frame. No permanent polling or idle animation loop. Disconnect/adoption releases
observers and listeners and cancels pending work.

Keep scrollbars, corners, resize handles, sticky headers and fixed controls outside the faded
layer. Keep focus indicators and editing carets visible; future adapters must provide the safe
focus-reveal region, without changing scroll extents, anchoring, virtual offsets or input semantics.
Masks must not intercept pointer input, selection or native wheel/touch/keyboard behavior.
Disable the decorative treatment in forced colors. Reduced motion retains the static cue; any
animated changes obey the existing motion policy.

## Scope and ownership

Apply to library-owned native scroll viewports and composed consumers in inventory.md. No global
CSS rule matching every overflow element. Consumer-owned regions opt in through Scroll Area.
Exclude native browser internals of inputs, page/window scrolling, Plot histories, graph/map
pan/zoom clipping and transform-only Carousel transports. Flow's scrolling panels remain included.

Citation truncation and Code Block's collapsed-content mask remain distinct. Message Scroller's
existing scroll fade migrates to the common treatment, rather than receiving another mask on top.

Shared implementation preparation: extend the existing Foundation scroll observation/state
owners; consume their state through one shared presentation recipe. Each viewport receives one
adapter, even when multiple public controls compose it. Native scrollbars must not be masked by
masking the entire scroll element indiscriminately; adapters must identify a content layer and
preserve fixed/sticky chrome. The original preparation stage stopped before runtime edits. The authorized runtime rollout now uses the shared NativeScrollEdges controller and scroll-edge recipe; see rollout-checklist.md.

## Specification amendment

Amend Foundation ScrollArea with shared native overflow-state/lifecycle requirements. Add a
Component Library design-token subsection defining the role, clipping and accessibility contract,
and reference it from Scroll Area. Add the Widgets scope cross-reference for native regions.
Applied nodes/operations are recorded in spec-amendment.json for audit; do not replay inserts.
Read current project state before each batch, preserve unrelated work, validate the full candidate,
and commit only when canCommit is true. The first mutation reserves the project's next revision;
no manual major/minor bump is required for this amendment.

## Rollout order and acceptance

1. Shared state/recipe, Scroll Area and Message Scroller.
2. Collection, anchored-surface and panel owners; inherited consumers receive no duplicate adapters.
3. Widgets and shared document/editor adapters; handle sticky content and nested scroll regions.
4. Register the token in default styles, required role metadata, token docs and validators; migrate
   custom token fixtures and audit records. No claim of runtime conformance until integration passes.

Acceptance scenarios (defined during preparation; runtime evidence is now in rollout-checklist.md):

| ID | Required scenario |
| --- | --- |
| V-01 | Content fits, no false fade; each start/end boundary and middle position on x/y/both axes |
| V-02 | RTL and vertical writing; tiny viewports, fractional offsets and configured edge thresholds |
| V-03 | Resize, asynchronous content, virtualization and nested scrollports; no double masking |
| V-04 | Light/dark, card/popover/custom/transparent surfaces; inherited size override and zero opt-out |
| V-05 | Wheel, touch, keyboard, programmatic scroll, scrollbar drag; fixed/sticky controls unaffected |
| V-06 | Tab/arrow focus reveal, focus ring, editor caret/selection and accessibility semantics |
| V-07 | Forced colors, reduced motion, unsupported mask fallback retains readable native scrolling |
| V-08 | No idle work; coalesced event work; disconnect, reconnect, adoption and observer cleanup |

Preparation verification: source-owner audit and native overflow searches completed; inventory
records every discovered owner and composed exceptions. No source, runtime token, binding or
published docs changed. No builds, browser tests or full unit suite needed for this records-only
stage. Live validation passed with zero diagnostics and canCommit=true before commit. Carousel Foundation/Library and Scroll Spy dependency reviews were checked and approved against the exact candidate. The initial API 502 was reconciled by a fresh read before continuing; it had applied the Foundation insertion despite its failed response.
