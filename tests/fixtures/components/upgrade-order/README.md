# Upgrade order

Owners whose members upgrade after them, as happens when elements are defined one by one
(per-component registration) instead of all at once through `@tweakpad/ui/register`. Driven only
through the Chrome DevTools MCP tools.

## Opening

1. Start Vite in the background: `npx vite --port 5191 --strictPort`.
2. Open your own tab at
   `http://localhost:5191/tests/fixtures/components/upgrade-order/index.html?case=<name>&order=<order>`.
   Each load runs one case, because an element cannot be defined twice in one document. To run
   every case, load them in iframes from one tab (`window.upgradeOrder.cases` lists them).
3. Wait for `window.upgradeOrder.result`.

## Orders

- `owner-first`: defines the owner (and what it declares it renders), lets its first updates run,
  then defines its members. For a composite (a component that renders owners in its own shadow
  root) it defines the composite alone, records any `tp-` tag left undefined, then registers
  everything.
- `members-first`: defines the members, then the owner; for a composite, registers everything
  first.

## Result

`errors` (thrown, rejected or logged), `definedByOwner` (member tags the owner's own definition
defined), `undefinedAlone` (composites), and `before` / `after`: the state attributes in light and
shadow DOM (`role`, `aria-*`, `data-*`, `value`, `checked`, `disabled`, `tabindex`, `hidden`,
`open`, `selected`; generated ids masked) before and after one press on a member.

## Expected

For every case, no errors in either order, the same `before` and `after` in both orders, and an
empty `undefinedAlone`. Generated ids that the mask misses (the Flow inspector's tab ids) are not
differences.
