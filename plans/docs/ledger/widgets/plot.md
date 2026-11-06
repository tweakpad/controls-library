# Plot page source record

New page for the user-approved Plot widget; there are no frozen website or Storybook pages to merge.
The supplied references and approved API define these examples. API tables remain generated.

| Source capability | Page disposition |
| --- | --- |
| Live random signal (user reference, 2026-11-06) | Hero and Default story: graph only, themed surface, chart-palette irregular line and subtle fill; bounded timestamp history, 10 Hz collection and independently paced clock scrolling capped at 60 Hz, with 100 ms display latency; visible caption hidden through its part hook, accessible name retained. |
| Histogram (user reference, 2026-11-06) | Histograms preview and Histogram fixture: separated opaque chart-palette bars on the themed surface, dotted x/y guides using the default guide role, no visible labels or axes; existing baseline fills and null gaps, static interval counts. |
| Single and signed areas | Areas and signed values |
| Overlapping CPU monitors | Overlapping series |
| Efficient history and latest revision | History preview, public Buttons |
| Backgrounds and custom guides | Backgrounds, axes and guides |
| Independent sampling and shared paint limits | Sampling and paint limits |
| Display-only inspection and accessible interpretation | Inspection and text alternatives; Keyboard |

Website verification uses an isolated copy under tmp/component-verification/plot/site linked to this
package, preserving the actual site checkout and its installed dependency. Static Storybook is checked separately.

Final checks (2026-11-06): shared-page checker passes 20 tests and the page; library build and
96-doc index pass, isolated site builds 116 pages. Both final static renderings were read through
Chrome DevTools MCP: all six full-width previews, Keyboard, API descriptions, no raw frontmatter.
Real history Buttons advanced count by one and replaced the latest value without another sample.
Storybook contains no Related; this leaf page has no inbound website Related cards. Original site
and existing user development servers were preserved.

Smooth-scroll follow-up: hero uses explicit timestamps, 10 Hz collection, 60 Hz maximum paint
cadence and a documented 100 ms display delay. Final library/static Storybook/isolated website
builds and page checker pass. Both final rendered pages were inspected through Chrome MCP;
500 ms yielded five samples and thirty incremental paints with no ordinary full redraws, no
visible caption/axes/legend and no console warnings/errors. Remaining five previews are preserved.

Histogram follow-up: shared checker passes 20 tests and the page; TypeScript/ESLint and both builds
pass. Both built pages inspected through Chrome MCP: seven previews including the histogram;
50 bar gaps and 11 dotted guides, correct aspect ratio, no console warnings/errors, static idle.

Palette correction requested by the user: reference colors describe geometry only. The live signal
and histogram now use --tp-chart-1, surface paint inherits the shared Plot recipe (--tp-muted),
and histogram guides inherit --tp-plot-guide. Remaining examples already use chart roles and the
semantic destructive color for negative values. No fixed hex/RGB colors remain in Plot examples.

Palette checks pass: seven examples on both built renderings, light/dark Canvas color resolution,
no application errors (browser pixel-readback performance advisory during verification only);
shared page 20 tests + page, ESLint and both docs builds pass. Library light/dark colors were
verified separately from the website application palette, which is inherited as intended.
