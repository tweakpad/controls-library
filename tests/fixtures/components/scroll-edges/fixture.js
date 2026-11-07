const built = new URLSearchParams(location.search).has('built');
await import(built ? '/dist/register.js' : '/src/register.ts');
await import(built ? '/dist/register/widgets.js' : '/src/register/widgets.ts');
const stage = document.querySelector('main');
const rows = Array.from({ length: 24 }, (_, i) => `Row ${i + 1}`);
const add = (markup) => {
  const template = document.createElement('template');
  template.innerHTML = markup;
  stage.append(template.content);
};
add(
  `<tp-message-scroller id="messages" initial-position="start" style="--tp-message-scroller-height:160px"><tp-message-scroller-viewport><tp-message-scroller-content>${rows.map((r, i) => `<tp-message-scroller-item message-id="m${i}" style="height:44px">${r}</tp-message-scroller-item>`).join('')}</tp-message-scroller-content></tp-message-scroller-viewport><tp-message-scroller-return-control></tp-message-scroller-return-control></tp-message-scroller>`,
);
add(
  `<tp-table id="table" label="Scroll edge data" sticky-header sticky-start-columns="1" style="width:320px;height:160px"><table><thead><tr><th>Item</th><th>Value</th><th>Notes</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r}</td><td>123</td><td>${'Wide content '.repeat(6)}</td></tr>`).join('')}</tbody></table></tp-table>`,
);
add(
  `<tp-table id="composed-table" label="Composed sticky table" sticky-header sticky-footer sticky-start-columns="1" sticky-end-columns="1" style="width:320px;height:160px">
    <tp-table-header><tp-table-row><tp-table-head>Item</tp-table-head><tp-table-head>Notes</tp-table-head><tp-table-head>Total</tp-table-head></tp-table-row></tp-table-header>
    <tp-table-body>${rows.map((r) => `<tp-table-row><tp-table-head scope="row">${r}</tp-table-head><tp-table-cell>${'Wide content '.repeat(6)}</tp-table-cell><tp-table-cell>123</tp-table-cell></tp-table-row>`).join('')}</tp-table-body>
    <tp-table-footer><tp-table-row><tp-table-cell>Total</tp-table-cell><tp-table-cell>24 rows</tp-table-cell><tp-table-cell>2952</tp-table-cell></tp-table-row></tp-table-footer>
  </tp-table>`,
);
add(
  `<tp-tabs id="tabs" style="width:320px">${rows
    .slice(0, 12)
    .map(
      (r, i) =>
        `<button slot="tab" value="${i}">${r}</button><section slot="panel" value="${i}">${r}</section>`,
    )
    .join('')}</tp-tabs>`,
);
add(
  `<tp-select id="select" label="Scroll choices" searchable>${rows.map((r, i) => `<option value="${i}">${r}</option>`).join('')}</tp-select>`,
);
add(`<tp-code-block id="code" label="Wide code"></tp-code-block>`);
document.querySelector('#code').code = Array.from(
  { length: 12 },
  (_, i) => `line ${i}: ${'long code '.repeat(18)}`,
).join('\n');
add(
  `<tp-resizable-panel-group id="panels" style="width:320px;height:160px"><tp-resizable-panel min-size="400px"><div class="content">${rows.join('<br>')}</div></tp-resizable-panel><tp-resizable-panel min-size="200px"><div class="content">${rows.join('<br>')}</div></tp-resizable-panel></tp-resizable-panel-group>`,
);
add(
  `<tp-dialog id="dialog" label="Scrollable dialog"><div>${rows.map((r) => `<p>${r}</p>`).join('')}</div></tp-dialog>`,
);
add(
  `<tp-popover id="popover" label="Scrollable popup"><tp-button slot="trigger">Open popup</tp-button><div style="height:450px">${rows.join('<br>')}</div></tp-popover>`,
);
add(`<tp-tree-view id="tree" label="Scroll tree" style="height:160px;width:320px"></tp-tree-view>`);
document.querySelector('#tree').items = rows.map((label, i) => ({ id: String(i), label }));
add(
  `<tp-text-editor id="editor" label="Scroll editor" style="height:200px;max-height:200px"></tp-text-editor>`,
);
window.area = document.querySelector('#area');
window.scrollFixtureReady = true;
add(
  `<tp-attachment-group id="attachments" aria-label="Scroll attachments" style="width:320px">${rows
    .slice(0, 8)
    .map((r) => `<tp-attachment filename="${r}.txt" style="width:160px"></tp-attachment>`)
    .join('')}</tp-attachment-group>`,
);
add(
  `<tp-navigation-panel id="navigation" label="Scroll navigation"><tp-navigation-panel-header>Navigation</tp-navigation-panel-header><tp-navigation-panel-content><div>${Array.from({ length: 100 }, (_, i) => `Navigation row ${i}`).join('<br>')}</div></tp-navigation-panel-content><tp-navigation-panel-footer>Footer</tp-navigation-panel-footer></tp-navigation-panel>`,
);
add(`<tp-carousel id="carousel" style="width:320px"></tp-carousel>`);
const carousel = document.querySelector('#carousel');
carousel.options = { transport: 'scroll' };
carousel.items = rows.slice(0, 8);
carousel.renderItem = (item) => item;
add(`<tp-flow-palette id="palette" open style="height:200px;width:320px"></tp-flow-palette>`);
document.querySelector('#palette').definitions = rows.map((label, i) => ({
  type: String(i),
  label,
  inputs: [],
  outputs: [],
}));
add(`<tp-flow-inspector id="inspector" open style="height:240px;width:320px"></tp-flow-inspector>`);
const inspector = document.querySelector('#inspector');
inspector.node = { id: 'n', type: 'test', position: { x: 0, y: 0 }, data: {} };
inspector.definition = {
  type: 'test',
  label: 'Properties',
  properties: rows.map((label, i) => ({
    key: `p${i}`,
    label,
    control: 'text',
    placement: 'inspector',
    default: '',
  })),
  inputs: [],
  outputs: [],
};
document.querySelector('#editor').defaultValue = rows.map((r) => `<p>${r}</p>`).join('');

add(
  `<tp-scroll-area id="sticky-toc-area" label="Sticky contents regression" style="width:600px;height:220px"><div style="display:grid;grid-template-columns:1fr 180px;gap:24px;align-items:start"><article>${rows.map((r, i) => `<section id="sticky-toc-${i}" style="min-height:100px"><h2>${r}</h2><p>Article content scrolls and retains its edge fade.</p></section>`).join('')}</article><aside style="position:sticky;top:0"><tp-table-of-contents label="Contents" navigation="scroll" scroll-behavior="instant">${rows
    .slice(0, 4)
    .map(
      (r, i) =>
        `<tp-table-of-contents-item href="#sticky-toc-${i}">${r}</tp-table-of-contents-item>`,
    )
    .join('')}</tp-table-of-contents></aside></div></tp-scroll-area>`,
);
