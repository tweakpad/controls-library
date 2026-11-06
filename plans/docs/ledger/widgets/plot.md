# Plot page source record

New page for the user-approved Plot widget; there are no frozen website or Storybook pages to merge.
The supplied references and approved API define these examples. API tables remain generated.

| Source capability | Page disposition |
| --- | --- |
| Bare waveform | Hero and Default story |
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
