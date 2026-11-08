/** Capability checks for the docs cleanup; invoke only through Chrome DevTools MCP. */
export async function reviewWidthPages(frame, pages, base = 'http://127.0.0.1:5176/', renderer = 'storybook') {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const results = [];
  const website = renderer === 'website';
  const sections = website ? '.preview__canvas' : '.docs-story';
  for (const page of pages) {
    frame.style.width = '1100px';
    await new Promise((resolve) => {
      frame.onload = resolve;
      frame.src = website ? base + 'docs/' + page.id + '/' : base + 'iframe.html?id=' + page.storyId + '&viewMode=docs';
      setTimeout(resolve, 4000);
    });
    for (
      let i = 0;
      i < 100 &&
      (!frame.contentDocument?.URL.includes(website ? page.id : page.storyId) ||
        !frame.contentDocument?.querySelector(sections));
      i++
    )
      await delay(25);
    const doc = frame.contentDocument;
    await Promise.race([doc.fonts.ready, delay(1500)]);
    await Promise.race([
      Promise.all(
        [...doc.querySelectorAll('*')]
          .filter((n) => 'updateComplete' in n)
          .map((n) => n.updateComplete),
      ),
      delay(1500),
    ]);
    await delay(100);
    const counts = doc.querySelectorAll(sections).length;
    const failures = [];
    if (counts !== page.previews)
      failures.push({ kind: 'preview-count', expected: page.previews, actual: counts });
    for (const width of [1100, 420]) {
      frame.style.width = width + 'px';
      await delay(100);
      for (const title of page.changed) {
        const previewIndex = page.titles.indexOf(title),
          section = doc.querySelectorAll(sections)[previewIndex];
        if (!section) {
          failures.push({ width, title, kind: 'missing-preview' });
          continue;
        }
        const canvas = website ? section : section.querySelector('.tp-docs-example-preview');
        // Storybook's primary canvas is rendered by its Default story rather than this host.
        if (!canvas) continue;
        const bounds = canvas.getBoundingClientRect();
        const css = doc.defaultView.getComputedStyle(canvas);
        const contentLeft = bounds.left + parseFloat(css.paddingLeft);
        const contentRight = bounds.right - parseFloat(css.paddingRight);
        if (website && /demo-frame|demo-w-/.test(canvas.parentElement.querySelector('[data-source]')?.innerHTML ?? ''))
          failures.push({ width, title, kind: 'helper-in-copied-code' });
        const roots = [...canvas.children]
          .filter((n) => !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(n.tagName))
          .filter((n) => {
            const r = n.getBoundingClientRect();
            return r.width && r.height;
          });
        if (!roots.length) failures.push({ width, title, kind: 'no-visible-content' });
        if (!canvas.classList.contains('demo-frame'))
          failures.push({ width, title, kind: 'missing-demo-frame' });
        const cap = parseFloat(doc.defaultView.getComputedStyle(canvas).getPropertyValue('--demo-width')) * parseFloat(doc.defaultView.getComputedStyle(doc.documentElement).fontSize);
        if (!Number.isFinite(cap)) failures.push({ width, title, kind: 'missing-width-preset' });
        for (const root of roots) {
          const r = root.getBoundingClientRect();
          if (r.width > cap + 2) failures.push({ width, title, kind: 'preset-exceeded', cap, actual: r.width });
          if (r.left < contentLeft - 2 || r.right > contentRight + 2)
            failures.push({
              width,
              title,
              kind: 'root-overflow',
              tag: root.localName,
              canvas: Math.round(bounds.width),
              root: Math.round(r.width),
            });
        }
      }
    }
    results.push({ page: page.id, previews: counts, changed: page.changed.length, failures });
  }
  return results;
}
