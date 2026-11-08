# Stack verification

Serve this fixture through the existing Vite/Storybook Vite server. Use Chrome DevTools MCP exclusively.

Set #sizer inline-size immediately below, at and above 30rem, 48rem, 64rem and 80rem; configure distinct values per breakpoint. Check root computed flex properties and child bounding boxes while keeping the viewport unchanged. Repeat with sparse maps, nested Stacks, RTL and compact density. Compare scalar HTML, JSON attributes, JS properties, attribute removal and updates. Confirm no child nodes are moved and real Tab input reaches actions in document order. Inspect accessibility semantics and screenshots in both themes. Disconnect/reconnect and replace configuration. Mount 100 identical Stacks in #many; compare adopted stylesheet identity, count updated calls across resizing, and record mount/resize duration. Run generated React/Vue object-property and child-update scenarios separately.

Run `await (await import("/tests/fixtures/components/stack/assertions.js")).assertStack()` through Chrome DevTools MCP for the automated layout and lifecycle assertions. Use real MCP Tab input separately for focus order.
