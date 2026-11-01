import type { TpSelect } from '../../../../src/components/select/index.js';

const built = new URLSearchParams(location.search).has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')!.href = '/dist/styles.css';
await import(/* @vite-ignore */ built ? '/dist/register.js' : '/src/register.ts');

const $ = <T extends Element>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector)!;
const items = (names: string[]) =>
  names.map((name) => ({ value: name.toLowerCase(), label: name }));
for (const id of ['default-select', 'compact-select', 'compact-portaled', 'live-select'])
  $<TpSelect>(`#${id}`).items = items(['Spring', 'Summer', 'Autumn', 'Winter']);
// A portaled popup leaves the region's DOM subtree and must keep its density.
$<TpSelect>('#compact-portaled').container = document.body;
$<TpSelect>('#live-select').container = document.body;

// A library element with its own density inside an application shadow root, where the default
// stylesheet's document rules do not reach.
const shadow = $<HTMLElement>('#shadow-host').attachShadow({ mode: 'open' });
shadow.innerHTML = `<tp-card id="shadow-card" density="compact"><h2 slot="header">Compact card in a shadow root</h2><tp-button id="shadow-button">Save draft</tp-button></tp-card>`;

interface Check {
  id: string;
  passed: boolean;
  detail: unknown;
}
const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
const height = (element: Element) => Math.round(element.getBoundingClientRect().height * 100) / 100;
const token = (element: Element, name: string) =>
  getComputedStyle(element).getPropertyValue(name).trim();
const px = (element: Element, name: string) => {
  // Resolve a length token through a probe in the element's own scope.
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${name})`;
  (element.shadowRoot ?? element).append(probe);
  const value = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.round(value * 100) / 100;
};
/** The button box: a Button's own control surface. */
const buttonBox = (button: Element) =>
  height(button.shadowRoot!.querySelector('[part~="button"]') ?? button);

async function openPopup(select: TpSelect) {
  select.setOpen(true);
  for (let i = 0; i < 20 && !popupItem(select); i++) await frame();
  return popupItem(select);
}
/** The first option of this Select's own listbox, in its shadow root or in its portal. */
function popupItem(select: TpSelect): HTMLElement | null {
  // The listbox carries the combobox id with `-list`, also when it is portaled to another root.
  const combobox = select.shadowRoot!.querySelector('[role="combobox"]');
  const id = combobox?.id ? `${combobox.id}-list` : '';
  if (!id) return null;
  const roots: ParentNode[] = [select.shadowRoot!];
  for (const host of document.querySelectorAll('[data-select-portal]'))
    if (host.shadowRoot) roots.push(host.shadowRoot);
  for (const root of roots) {
    const listbox = root.querySelector(`[id="${id}"]`);
    const item = listbox?.querySelector<HTMLElement>('[role="option"]');
    if (item && item.getBoundingClientRect().height > 0) return item;
  }
  return null;
}

async function assertDensity() {
  const checks: Check[] = [];
  const check = (id: string, passed: boolean, detail: unknown) =>
    checks.push({ id, passed, detail });
  await customElements.whenDefined('tp-button');
  await frame();
  const compact = $('#compact-region');
  const defaultRegion = $('#default-region');
  check(
    'D01 a compact region re-derives the scale from its seed',
    px(compact, '--tp-control-height-md') === 24 &&
      px(defaultRegion, '--tp-control-height-md') === 32,
    {
      compact: [
        token(compact, '--tp-spacing'),
        px(compact, '--tp-control-height-md'),
        px(compact, '--tp-space-2'),
      ],
      default: [
        token(defaultRegion, '--tp-spacing'),
        px(defaultRegion, '--tp-control-height-md'),
        px(defaultRegion, '--tp-space-2'),
      ],
    },
  );
  const pairs = ['button', 'input', 'slider', 'switch'].map((name) => {
    const a = $(`#default-${name}`);
    const b = $(`#compact-${name}`);
    return [
      name,
      name === 'button' ? buttonBox(a) : height(a),
      name === 'button' ? buttonBox(b) : height(b),
    ] as const;
  });
  check(
    'D02 controls in the compact region are smaller than in the default region',
    pairs.every(([, a, b]) => b < a),
    pairs,
  );
  check(
    'D03 a default island inside a compact region restores the default scale',
    buttonBox($('#island-button')) === buttonBox($('#default-button')),
    { island: buttonBox($('#island-button')), default: buttonBox($('#default-button')) },
  );
  const shadowButton = $('#shadow-button', shadow);
  check(
    'D04 a library element with density inside another shadow root takes it',
    buttonBox(shadowButton) === buttonBox($('#compact-button')),
    { shadow: buttonBox(shadowButton), compact: buttonBox($('#compact-button')) },
  );
  const inPlace = await openPopup($('#compact-select'));
  const inPlaceHeight = inPlace ? px(inPlace, '--tp-control-height-md') : null;
  $<TpSelect>('#compact-select').setOpen(false);
  const portaled = await openPopup($('#compact-portaled'));
  const portaledHeight = portaled ? px(portaled, '--tp-control-height-md') : null;
  const portalHost = document.querySelector('[data-select-portal]');
  $<TpSelect>('#compact-portaled').setOpen(false);
  const reference = await openPopup($('#default-select'));
  const referenceHeight = reference ? px(reference, '--tp-control-height-md') : null;
  $<TpSelect>('#default-select').setOpen(false);
  check(
    'D05 popups of a compact region resolve the compact scale, in place and portaled to the body',
    !!inPlaceHeight &&
      !!portaledHeight &&
      !!referenceHeight &&
      inPlaceHeight < referenceHeight &&
      portaledHeight === inPlaceHeight,
    {
      inPlace: inPlaceHeight,
      portaled: portaledHeight,
      default: referenceHeight,
      portalParent: portalHost?.parentElement?.localName,
    },
  );
  const live = $('#live-region');
  const liveSelect = $<TpSelect>('#live-select');
  const before = await openPopup(liveSelect);
  const beforeHeight = before ? px(before, '--tp-control-height-md') : null;
  live.setAttribute('density', 'compact');
  for (let i = 0; i < 10; i++) await frame();
  const after = popupItem(liveSelect);
  const afterHeight = after ? px(after, '--tp-control-height-md') : null;
  liveSelect.setOpen(false);
  live.removeAttribute('density');
  await frame();
  check(
    'D06 switching a region live re-resolves an open portaled popup',
    !!beforeHeight && !!afterHeight && afterHeight < beforeHeight && afterHeight === inPlaceHeight,
    { before: beforeHeight, after: afterHeight },
  );
  const card = $('#default-card') as HTMLElement & { density?: string };
  card.density = 'compact';
  await frame();
  await frame();
  const reflected = card.getAttribute('density');
  const compactInCard = buttonBox($('#default-button'));
  card.density = undefined;
  await frame();
  await frame();
  check(
    'D07 the density property reflects and applies on a library element',
    reflected === 'compact' &&
      compactInCard === buttonBox($('#compact-button')) &&
      !card.hasAttribute('density'),
    { reflected, compactInCard, cleared: !card.hasAttribute('density') },
  );
  return { passed: checks.every((entry) => entry.passed), checks };
}

Object.assign(window, { densityAPI: { assertDensity } });
document.documentElement.dataset.fixtureReady = 'true';
