export async function assertStack() {
  const host = document.querySelector('#stack');
  await host.updateComplete;
  const box = document.querySelector('#sizer');
  const root = () => host.shadowRoot.querySelector('.root');
  const style = () => getComputedStyle(root());
  const frame = () => new Promise(requestAnimationFrame);
  const checks = [];
  const check = (name, passed, actual) => checks.push({ name, passed, actual });
  const originalChildren = [...host.children];
  host.direction = { xs: 'column', sm: 'row', md: 'column', lg: 'row', xl: 'column' };
  await host.updateComplete;
  let updates = 0;
  const updated = host.updated;
  host.updated = function (changed) {
    updates++;
    return updated.call(this, changed);
  };
  for (const [width, expected] of [
    [479, 'column'],
    [480, 'row'],
    [481, 'row'],
    [767, 'row'],
    [768, 'column'],
    [769, 'column'],
    [1023, 'column'],
    [1024, 'row'],
    [1025, 'row'],
    [1279, 'row'],
    [1280, 'column'],
    [1281, 'column'],
  ]) {
    box.style.inlineSize = width + 'px';
    await frame();
    check('boundary ' + width, style().flexDirection === expected, style().flexDirection);
  }
  check('no JavaScript resize updates', updates === 0, updates);
  host.direction = { md: 'row' };
  box.style.inlineSize = '479px';
  await host.updateComplete;
  await frame();
  check('sparse default', style().flexDirection === 'column', style().flexDirection);
  const diagnostics = [];
  host.addEventListener('tp-diagnostic', (e) => diagnostics.push(e.detail));
  host.setAttribute('direction', '{broken');
  await host.updateComplete;
  await frame();
  check('malformed JSON diagnostic', diagnostics.length > 0, diagnostics);
  host.setAttribute('gap', '{"xs":1.5,"sm":999,"typo":4}');
  await host.updateComplete;
  check('valid entries survive', JSON.stringify(host.gap) === '{"xs":1.5}', host.gap);
  check('fractional token', style().gap === '6px', style().gap);
  host.density = 'compact';
  await host.updateComplete;
  await frame();
  check('density changes gap', style().gap !== '6px', style().gap);
  host.removeAttribute('density');
  host.direction = 'row';
  host.align = 'end';
  host.justify = 'space-between';
  host.wrap = 'wrap';
  await host.updateComplete;
  check(
    'independent flex options',
    style().alignItems === 'flex-end' &&
      style().justifyContent === 'space-between' &&
      style().flexWrap === 'wrap',
    [style().alignItems, style().justifyContent, style().flexWrap],
  );
  box.dir = 'rtl';
  await frame();
  check(
    'RTL inherited independently',
    getComputedStyle(host).direction === 'rtl' && host.direction === 'row',
    getComputedStyle(host).direction,
  );
  const first = host.children[0].getBoundingClientRect(),
    second = host.children[1].getBoundingClientRect();
  check('RTL row geometry', first.x > second.x, [first.x, second.x]);
  const nested = document.createElement('tp-stack');
  nested.direction = { xs: 'column', sm: 'row' };
  nested.style.inlineSize = '200px';
  nested.append(document.createElement('span'), document.createElement('span'));
  host.append(nested);
  box.style.inlineSize = '800px';
  await nested.updateComplete;
  await frame();
  check(
    'nested own container',
    getComputedStyle(nested.shadowRoot.querySelector('.root')).flexDirection === 'column',
    nested.getBoundingClientRect().width,
  );
  nested.remove();
  host.remove();
  box.append(host);
  await host.updateComplete;
  await frame();
  check(
    'reconnect children preserved',
    originalChildren.every((n, i) => host.children[i] === n),
    host.children.length,
  );
  host.removeAttribute('direction');
  await host.updateComplete;
  check('removal default', host.direction === 'column', host.direction);
  const container = document.querySelector('#many');
  container.replaceChildren();
  const start = performance.now(),
    nodes = [];
  for (let i = 0; i < 100; i++) {
    const n = document.createElement('tp-stack');
    n.direction = { xs: 'column', sm: 'row' };
    n.gap = { xs: 1, sm: 2 };
    nodes.push(n);
    container.append(n);
  }
  await Promise.all(nodes.map((n) => n.updateComplete));
  const mount100Ms = performance.now() - start;
  const sheets = nodes.map((n) => n.shadowRoot.adoptedStyleSheets.at(-1));
  check(
    'identical instances share layout sheet',
    sheets.every((s) => s === sheets[0]),
    sheets.length,
  );
  check(
    'no inline token override',
    host.getAttribute('style') === null,
    host.getAttribute('style'),
  );
  container.replaceChildren();
  return { passed: checks.every((c) => c.passed), checks, mount100Ms };
}
