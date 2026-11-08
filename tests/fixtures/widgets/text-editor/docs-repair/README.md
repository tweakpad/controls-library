# Text Editor docs repair checks

Use Google Chrome DevTools MCP only, one review tab. Check static Storybook's `iframe.html?id=widgets-text-editor--docs&viewMode=docs` and the website's `/docs/widgets/text-editor/`. Invoke `reviewTextEditorDocs()` from `review.js` through MCP evaluation at wide/dark and 420px/light viewports. It bounds readiness waits and checks every editor, geometry, Markdown output, the sandboxed embed, the table and the feature-free core.

Use actual MCP input for engine switching with content preservation, Insert date, slash commands, crew mentions, Alt+F10 into the selection toolbar, form submission/reset, read-only typing rejection, table navigation, and image-file selection. Check the accessibility tree independently. The source-configuration unit tests use recording hosts and cannot prove browser editing or visual correctness.
