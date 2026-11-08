/** Run only through Chrome DevTools MCP in a page that registers tp-menu and tp-popover. */
export async function reviewScrollContentRepair() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const settle = async (menu) => {
    await Promise.race([menu.updateComplete, wait(1000)]);
    await menu.updatePosition();
    await wait(220);
  };
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, width: box.width, height: box.height };
  };
  const results = [];
  for (const direction of ['ltr', 'rtl']) {
    for (const portal of [true, false]) {
      for (const edge of [false, true]) {
        const fixture = document.createElement('div');
        fixture.dir = direction;
        fixture.style.cssText = `position:fixed;top:120px;${direction === 'ltr' ? 'left' : 'right'}:${edge ? Math.max(20, innerWidth - 270) : 20}px;z-index:99999`;
        const menu = document.createElement('tp-menu');
        menu.label = 'Regression commands';
        menu.modal = false;
        menu.portal = portal;
        menu.align = 'start';
        menu.innerHTML = '<tp-button slot="trigger">Commands</tp-button><tp-menu-item>A substantially wider command row</tp-menu-item><tp-menu label="Nested commands"><tp-button slot="trigger" variant="ghost">Share</tp-button><tp-menu-item>Copy link</tp-menu-item><tp-menu-item>Email invitation</tp-menu-item></tp-menu>';
        fixture.append(menu);
        document.body.append(fixture);
        const sub = menu.querySelector('tp-menu');
        sub.modal = false;
        sub.portal = portal;
        menu.setOpen(true);
        await settle(menu);
        sub.setOpen(true);
        await settle(sub);
        const body = menu.popupElement.querySelector('.body');
        const wrapper = body.querySelector('.scroll-content');
        const parent = rect(menu.popupElement), trigger = rect(sub.menuTriggerHost), child = rect(sub.popupElement);
        const side = sub.positioningResult?.placement ?? sub.positioner.dataset.side;
        const overlap = Math.max(0, Math.min(trigger.right, child.right) - Math.max(trigger.left, child.left));
        const failures = [];
        if (trigger.width < wrapper.clientWidth - 2) failures.push('Trigger shrank below its row');
        if (overlap > 2) failures.push('Submenu overlaps trigger row');
        if (child.left < -1 || child.right > innerWidth + 1) failures.push('Submenu outside viewport');
        results.push({ direction, portal, edge, side, parent, trigger, child, failures });
        menu.setOpen(false);
        fixture.remove();
      }
    }
  }
  // A long menu must keep natural content height and a usable native scrollport,
  // independently of whether scroll-edge presentation is enabled.
  for (const fade of [false, true]) {
    const menu = document.createElement('tp-menu');
    menu.label = 'Scrollable commands';
    menu.modal = false;
    menu.scrollEdgeFade = fade;
    menu.partPresentation = { 'menu-content': { styleHook: { 'max-block-size': '160px' } } };
    menu.innerHTML = '<tp-button slot="trigger">Long menu</tp-button>' + Array.from({ length: 25 }, (_, i) => `<tp-menu-item>Command ${i + 1}</tp-menu-item>`).join('');
    document.body.append(menu);
    menu.setOpen(true);
    await settle(menu);
    const body = menu.popupElement.querySelector('.body');
    body.scrollTop = 50;
    await wait(120);
    const failures = [];
    if (body.scrollHeight <= body.clientHeight || body.scrollTop === 0) failures.push('Native scrolling lost');
    const layer = menu.popupElement.querySelector('.scroll-content');
    if (layer.scrollHeight > layer.clientHeight + 1) failures.push('Content layer shrank');
    const masked = layer.hasAttribute('data-tp-scroll-edge-mask');
    if (masked !== fade) failures.push('Scroll-edge opt-in state incorrect');
    results.push({ fade, masked, viewport: body.clientHeight, content: body.scrollHeight, scrollTop: body.scrollTop, failures });
    menu.setOpen(false);
    menu.remove();
  }
  const popover = document.createElement('tp-popover');
  popover.label = 'Shared layout check';
  popover.modal = false;
  popover.innerHTML = '<tp-button slot="trigger">Details</tp-button><p>A deliberately wider line of popup content</p><tp-button>Continue</tp-button>';
  document.body.append(popover);
  const button = popover.querySelector('tp-button:not([slot])');
  popover.setOpen(true);
  await settle(popover);
  const layer = popover.popupElement.querySelector('.scroll-content');
  results.push({ consumer: 'popover', wrapper: rect(layer), button: rect(button), failures: button.getBoundingClientRect().width < layer.clientWidth - 2 ? ['Popover child failed to stretch'] : [] });
  popover.setOpen(false);
  popover.remove();
  return results;
}
