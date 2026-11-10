# Pattern verification

Run through Chrome DevTools MCP on the Storybook page (`/iframe.html?viewMode=docs&id=patterns-<slug>--docs`,
`&globals=theme:light` for the light theme) and on `tests/fixtures/patterns/<slug>/`. Take a
snapshot to a file under `tmp/component-verification/patterns/<slug>/` (pages are long), then act
by uid. A file edit reloads the page and invalidates uids: browser checks first, edits last.

For every screen:

1. Renders with no undefined element, in both themes, at 320px and in compact density.
2. Accessibility tree: names, roles, required state, the form's name, links with their routes.
3. Empty submit: each required Field shows its error; focus moves to the first.
4. Invalid input typed for real (format, length): the Field explains the rule.
5. Pending: sample inside one evaluate (DevTools calls take about a second): the submitter shows
   its spinner and is disabled but focusable.
6. Server error: the message is announced (`role="alert"` or a Field error) and focus goes where
   the user acts next; copy reveals nothing private.
7. Success or next step: the next screen shows, focus moves into it, cooldowns count down.
8. Keyboard only: Tab order, Enter submits, toggles with Space.
9. Links inside previews keep their URLs and do not navigate the page.
10. Entry-only fixture: `window.undefinedElements` is `[]`.
