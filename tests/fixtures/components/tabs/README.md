# Tabs verification through Chrome DevTools MCP

Serve the repository with `npm run dev` and open `/tests/fixtures/components/tabs/`.
Append `?built` after building the library to verify its distributable.

- Evaluate `(await import('./api-checks.js')).run()` for selection and panel lifecycle checks.
- Evaluate `(await import('./full-width-checks.js')).run()` for full-width reflection, sizing,
  removal, both variants, intrinsic overflow, LTR/RTL scrolling, independent fade opt-in,
  dynamic/hidden/nested members, compact density, custom indicators and reconnect.
  Every returned `passed` must be true. The deliberate 269px fixture width reproduces #33.
- On the first Editor list, click Style, press ArrowRight and verify focus is Stats while
  Style stays selected; Enter selects Stats. With Stats aria-disabled, it remains arrow
  discoverable and Enter does not select it. In automatic mode Home selects Scene.
- Enable full-width on Narrow and use End: the final label must scroll into view. Repeat RTL.
- Repeat the geometry checks under light/dark appearance and narrow/wide viewports.
- Inspect the accessibility tree for named tabs, selected/disabled states and labelled panels.

The existing presentation-checks module covers broader custom dictionary behavior. Changes
for #33 leave the recipes and those customization contracts intact.
