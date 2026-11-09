// Run through Chrome DevTools MCP on the Tabs fixture, source or ?built.
export async function run() {
  const results = [];
  const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
  const check = (name, passed, detail) => results.push({ name, passed: Boolean(passed), detail });
  const container = document.createElement('div');
  document.querySelector('#dynamic').append(container);
  const make = async (props = {}, labels = ['Scene', 'Style', 'Stats']) => {
    const tabs = document.createElement('tp-tabs');
    tabs.style.width = '269px'; // Reproduce the compact consumer's available space.
    Object.assign(tabs, { label: 'Editor', ...props });
    labels.forEach((label, index) => {
      const tab = document.createElement('button');
      tab.slot = 'tab';
      tab.value = String(index);
      tab.textContent = label;
      const panel = document.createElement('p');
      panel.slot = 'panel';
      panel.setAttribute('value', String(index));
      panel.textContent = `${label} content`;
      tabs.append(tab, panel);
    });
    container.append(tabs);
    await wait();
    return tabs;
  };
  const list = (tabs) => tabs.shadowRoot.querySelector('.list');
  const buttons = (tabs) => [...tabs.querySelectorAll(':scope > [slot=tab]')];
  const width = (element) => element.getBoundingClientRect().width;
  const equal = (tabs) => {
    const sizes = buttons(tabs)
      .filter((tab) => !tab.hidden)
      .map(width);
    return Math.max(...sizes) - Math.min(...sizes) < 0.1;
  };
  const aligned = (tabs) => {
    const selected = tabs.querySelector('[aria-selected=true]').getBoundingClientRect();
    const indicator = (
      tabs.querySelector('[slot=indicator]') ?? tabs.shadowRoot.querySelector('.indicator')
    ).getBoundingClientRect();
    if (tabs.variant === 'underline') {
      const border = Number.parseFloat(
        getComputedStyle(tabs.querySelector('[aria-selected=true]')).borderBottomWidth,
      );
      return (
        Math.abs(selected.x - indicator.x) < 1 &&
        Math.abs(selected.width - indicator.width) < 1 &&
        Math.abs(selected.bottom - indicator.bottom) < 1 &&
        Math.abs(indicator.height - border) < 1
      );
    }
    return ['x', 'y', 'width', 'height'].every(
      (key) => Math.abs(selected[key] - indicator[key]) < 1,
    );
  };
  for (const variant of ['enclosed', 'underline']) {
    const tabs = await make({ variant });
    const normal = width(list(tabs));
    const original = buttons(tabs);
    const appearance = original.map((tab) => {
      const css = getComputedStyle(tab);
      return [css.fontSize, css.padding, css.borderRadius, css.color].join(';');
    });
    check(
      `${variant}: content width by default`,
      tabs.fullWidth === false && !tabs.hasAttribute('full-width') && normal < 269,
    );
    tabs.fullWidth = true;
    await wait();
    check(
      `${variant}: full width, equal shares and reflection`,
      tabs.hasAttribute('full-width') && Math.abs(width(list(tabs)) - 269) < 0.1 && equal(tabs),
      buttons(tabs).map(width),
    );
    check(
      `${variant}: nodes and appearance preserved`,
      buttons(tabs).every(
        (tab, index) =>
          tab === original[index] &&
          [
            getComputedStyle(tab).fontSize,
            getComputedStyle(tab).padding,
            getComputedStyle(tab).borderRadius,
            getComputedStyle(tab).color,
          ].join(';') === appearance[index],
      ),
    );
    tabs.setValue('2');
    await wait(350);
    check(`${variant}: selected indicator follows`, aligned(tabs));
    tabs.removeAttribute('full-width');
    await wait();
    check(
      `${variant}: removal restores content width`,
      !tabs.fullWidth && Math.abs(width(list(tabs)) - normal) < 0.1,
    );
    tabs.setAttribute('full-width', '');
    tabs.orientation = 'vertical';
    await wait();
    const vertical = width(list(tabs));
    tabs.fullWidth = false;
    await wait();
    check(`${variant}: vertical ignores full width`, Math.abs(width(list(tabs)) - vertical) < 0.1);
    tabs.fullWidth = true;
    tabs.orientation = 'horizontal';
    tabs.dir = 'rtl';
    await wait(350);
    check(
      `${variant}: orientation toggle and RTL`,
      equal(tabs) &&
        Math.abs(width(list(tabs)) - 269) < 0.1 &&
        buttons(tabs)[0].getBoundingClientRect().x > buttons(tabs)[2].getBoundingClientRect().x &&
        aligned(tabs),
    );
    tabs.remove();
  }
  const narrow = await make({ fullWidth: true }, [
    'Scene configuration',
    'Material appearance',
    'Performance statistics',
    'Resource allocation',
  ]);
  check(
    'overflow: label minima retained',
    list(narrow).scrollWidth > list(narrow).clientWidth &&
      buttons(narrow).every((tab) => tab.scrollWidth <= tab.clientWidth + 1),
    { scrollWidth: list(narrow).scrollWidth, clientWidth: list(narrow).clientWidth },
  );
  for (const dir of ['ltr', 'rtl']) {
    narrow.dir = dir;
    narrow.setValue('3');
    await wait(350);
    list(narrow).scrollLeft = dir === 'rtl' ? -list(narrow).scrollWidth : list(narrow).scrollWidth;
    await wait();
    check(`${dir}: scrolling retains indicator alignment`, aligned(narrow));
  }
  narrow.scrollEdgeFade = true;
  await wait();
  check(
    'scroll fade is independently opt-in',
    narrow.hasAttribute('scroll-edge-fade') && list(narrow).scrollWidth > list(narrow).clientWidth,
  );
  narrow.remove();

  const tabs = await make({ fullWidth: true });
  const original = buttons(tabs)[0];
  const added = document.createElement('button');
  added.slot = 'tab';
  added.value = '3';
  added.textContent = 'Help';
  const panel = document.createElement('p');
  panel.slot = 'panel';
  panel.setAttribute('value', '3');
  panel.textContent = 'Help content';
  tabs.append(added, panel);
  await wait();
  check(
    'dynamic addition redistributes without replacing tabs',
    buttons(tabs).length === 4 && equal(tabs) && buttons(tabs)[0] === original,
  );
  added.hidden = true;
  await wait();
  check('hidden member does not consume a share', equal(tabs) && width(added) === 0);
  added.remove();
  panel.remove();
  await wait();
  tabs.setAttribute('density', 'compact');
  await wait();
  check(
    'compact density preserves full-width allocation',
    equal(tabs) && width(list(tabs)) === 269 && aligned(tabs),
  );
  const custom = document.createElement('span');
  custom.slot = 'indicator';
  tabs.append(custom);
  tabs.setValue('1');
  await wait(350);
  check('custom indicator follows full-width tabs', aligned(tabs));
  tabs.remove();
  container.append(tabs);
  await wait(350);
  check(
    'reconnect retains full-width selection and geometry',
    tabs.value === '1' && tabs.fullWidth && equal(tabs) && aligned(tabs),
  );
  const nested = await make({ fullWidth: true });
  nested.style.width = '100%';
  tabs.querySelector('[slot=panel]').append(nested);
  await wait();
  check(
    'nested tabs retain independent layout and selection',
    equal(tabs) && equal(nested) && tabs.value === '1' && nested.value === '0',
  );
  container.remove();
  return results;
}
