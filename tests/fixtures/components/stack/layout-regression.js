/** Browser-only comparison, invoked through Chrome DevTools MCP against static docs builds. */
export async function compareLayoutPages(frame, pages, options = {}) {
  const base = options.base ?? 'http://127.0.0.1:5176/baseline/';
  const next = options.next ?? 'http://127.0.0.1:5176/';
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const settle = async (doc) => {
    await Promise.race([doc.fonts.ready, delay(1500)]);
    await Promise.race([
      delay(2000),
      Promise.all(
        [...doc.querySelectorAll('*')]
          .filter((n) => 'updateComplete' in n)
          .map((n) => n.updateComplete),
      ),
    ]);
    await delay(200);
    const waitFor = async (test) => {
      for (let i = 0; i < 40 && !test(); i++) await delay(50);
    };
    if (doc.querySelector('#drag-drop-list-rich'))
      await waitFor(() =>
        doc
          .querySelector('#drag-drop-list-rich tp-drag-drop-list')
          ?.shadowRoot?.querySelector('li'),
      );
    if (doc.querySelector('#file-upload-grid'))
      await waitFor(() => doc.querySelector('#file-upload-grid').value?.length === 4);
    if (doc.querySelector('#toggle-artwork'))
      await waitFor(() =>
        [...doc.querySelectorAll('#toggle-artwork tp-toggle')].every((n) =>
          n.shadowRoot?.textContent.includes('Save'),
        ),
      );
    if (doc.querySelector('#list-people-example'))
      await waitFor(() =>
        doc.querySelector('#list-people-example tp-icon')?.shadowRoot?.querySelector('svg'),
      );
    await delay(100);
  };
  const snapshot = (doc) =>
    [...doc.querySelectorAll('.docs-story')].map((section) => {
      const box = section.getBoundingClientRect();
      return [...section.querySelectorAll('*')]
        .filter(
          (n) =>
            n.localName !== 'tp-stack' &&
            (n.localName.startsWith('tp-') ||
              n.matches(
                'p,strong,span,output,label,button,input,select,textarea,ul,li,dl,dt,dd,form,fieldset,legend,figure,figcaption,a',
              )),
        )
        .flatMap((n) => {
          const b = n.getBoundingClientRect();
          if (!b.width || !b.height) return [];
          // Cursor portals live outside their example's normal flow.
          if (b.bottom < box.top || b.top > box.bottom) return [];
          const css = doc.defaultView.getComputedStyle(n);
          return [
            {
              tag: n.localName,
              id: n.id,
              text: n.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
              x: b.x - box.x,
              y: b.y - box.y,
              w: b.width,
              h: b.height,
              color: css.color,
              font: css.fontSize,
            },
          ];
        });
    });
  const capture = async (url, page) => {
    frame.style.width = '1100px';
    await new Promise((resolve) => {
      frame.onload = resolve;
      frame.src = url + 'iframe.html?id=' + page.storyId + '&viewMode=docs';
      setTimeout(resolve, 4000);
    });
    for (
      let i = 0;
      i < 120 &&
      (!frame.contentDocument?.URL.includes(page.storyId) ||
        !frame.contentDocument?.querySelector('.docs-story'));
      i++
    )
      await delay(25);
    const doc = frame.contentDocument;
    await settle(doc);
    const result = {};
    for (const width of [1100, 420]) {
      frame.style.width = width + 'px';
      await delay(100);
      await Promise.race([
        delay(2000),
        Promise.all(
          [...doc.querySelectorAll('*')]
            .filter((n) => 'updateComplete' in n)
            .map((n) => n.updateComplete),
        ),
      ]);
      result[width] = snapshot(doc);
    }
    return result;
  };
  const results = [];
  for (const page of pages) {
    const before = await capture(base, page),
      after = await capture(next, page),
      differences = [];
    for (const width of [1100, 420]) {
      const b = before[width],
        a = after[width];
      if (a.length !== page.count || b.length !== page.count)
        differences.push({ width, expected: page.count, counts: [b.length, a.length] });
      for (let i = 0; i < Math.min(b.length, a.length); i++) {
        if (a[i].length !== b[i].length) {
          differences.push({ width, preview: i, nodeCounts: [b[i].length, a[i].length] });
          continue;
        }
        for (let n = 0; n < a[i].length; n++) {
          const x = b[i][n],
            y = a[i][n];
          if (x.tag !== y.tag || x.id !== y.id) {
            differences.push({
              width,
              preview: i,
              node: n,
              identity: [x.tag + '#' + x.id, y.tag + '#' + y.id],
            });
            continue;
          }
          const geometry = Object.fromEntries(
            ['x', 'y', 'w', 'h']
              .filter((k) => Math.abs(x[k] - y[k]) > 1.1)
              .map((k) => [k, [Math.round(x[k] * 100) / 100, Math.round(y[k] * 100) / 100]]),
          );
          if (Object.keys(geometry).length || x.color !== y.color || x.font !== y.font)
            differences.push({
              width,
              preview: i,
              node: n,
              tag: x.tag,
              id: x.id,
              text: x.text,
              geometry,
              ...(x.color !== y.color ? { color: [x.color, y.color] } : {}),
              ...(x.font !== y.font ? { font: [x.font, y.font] } : {}),
            });
        }
      }
    }
    results.push({ id: page.id, previews: page.count, differences });
  }
  return results;
}
