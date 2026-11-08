# Stack verification

Serve this fixture through the existing Vite/Storybook Vite server. Use Chrome DevTools MCP exclusively.

Set #sizer inline-size immediately below, at and above 30rem, 48rem, 64rem and 80rem; configure distinct values per breakpoint. Check root computed flex properties and child bounding boxes while keeping the viewport unchanged. Repeat with sparse maps, nested Stacks, RTL and compact density. Compare scalar HTML, JSON attributes, JS properties, attribute removal and updates. Confirm no child nodes are moved and real Tab input reaches actions in document order. Inspect accessibility semantics and screenshots in both themes. Disconnect/reconnect and replace configuration. Mount 100 identical Stacks in #many; compare adopted stylesheet identity, count updated calls across resizing, and record mount/resize duration. Run generated React/Vue object-property and child-update scenarios separately.

Run `await (await import("/tests/fixtures/components/stack/assertions.js")).assertStack()` through Chrome DevTools MCP for the automated layout and lifecycle assertions. Use real MCP Tab input separately for focus order.

Run `assertStackLayoutInheritance()` from the same module to verify inherited text color and fixed/minimum block-size distribution with padding. These cases protect layout-wrapper migrations.

`layout-regression.js` exports a browser-only comparison helper. Invoke it through Chrome DevTools MCP with one reusable iframe and the page IDs from the migration report. It compares the baseline and candidate static Storybook builds at 1100px and 420px, waits for async file/list setup, and reports control geometry, color and font differences. It is not a browser driver. The baseline static files and baseline geometry are local evidence artifacts; capture them before rebuilding Storybook. Inspect motion/looping differences and exercise real input separately.
