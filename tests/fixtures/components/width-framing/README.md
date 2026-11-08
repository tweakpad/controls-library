# Demo width verification

Use Chrome DevTools MCP exclusively. Load one same-origin Storybook iframe at a time and invoke `reviewWidthPages(frame, pages)` from `review.js` through MCP evaluation. Supply page IDs, ordered preview titles and changed titles from the authored docs. The fixture checks all changed previews at 1100px and 420px: expected preview count, visible content, renderer helper class, active width cap and root overflow.

Read representative pages visually, exercise controls with real MCP input, and inspect the accessibility tree. The geometry fixture does not certify behavior, descendant layout or component conformance. On the website, repeat width/copy-code checks against `.preview__canvas` and `[data-source]`. Helpers must never appear in copied markup.
