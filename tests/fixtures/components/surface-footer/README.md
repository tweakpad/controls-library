# Surface footer checks

Run `npm run build`, then `node scripts/footer-inventory.mjs`. Serve with Vite and open
this folder through Chrome DevTools MCP. `?case=N` renders an indexed preview's markup;
`footerResult()` reports actual footer alignment, row direction, button labels and end-edge
error. It only checks Card, dialog-family and Form action regions, not unrelated Calendar,
Message or navigation footers. Empty/hidden regions are excluded.

The source inventory is `plans/components/surface-footer/inventory.md`; runtime cases and
recorded results live under the ignored `tmp/component-verification/surface-footer/`.
Default probes deliberately do not execute preview scripts and are layout checks only.
Append `&interactive` to execute the authored preview script for interaction checks.
Dialogs are opened by fixture setup; test actual open/dismiss/focus behavior separately
through the original component fixtures and Storybook.

Inspect Tabs hero (61), controlled Tabs (62), metadata Card (20), form (43), Slider form
(59) and Text Area form (63). Use both directions, 320px/desktop viewports and both themes.
The Card Save button's end edge must match footer padding without authored alignment CSS.
Check native keyboard order and actual form submission/reset, not only computed styles.
