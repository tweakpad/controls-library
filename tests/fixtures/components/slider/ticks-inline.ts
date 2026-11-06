import type { TpSlider, TpSliderThumb } from '../../../../src/components/slider/index.js';
import type { TpField } from '../../../../src/components/field/index.js';

const built = new URLSearchParams(location.search).has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')!.href = '/dist/styles.css';
await import(/* @vite-ignore */ built ? '/dist/register.js' : '/src/register.ts');

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
$<TpSlider>('#price').format = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };
$<TpSlider>('#distance').format = { style: 'unit', unit: 'kilometer' };

interface Record {
  id: string;
  passed: boolean;
  detail: unknown;
}
const records: Record[] = [];
const check = (id: string, passed: boolean, detail: unknown) => {
  records.push({ id, passed, detail });
  if (!passed) throw new Error(`${id}: ${JSON.stringify(detail)}`);
};
const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
async function settle(slider: TpSlider) {
  await slider.updateComplete;
  await Promise.all(
    [...slider.shadowRoot!.querySelectorAll<TpSliderThumb>('tp-slider-thumb')].map(
      (thumb) => thumb.updateComplete,
    ),
  );
  await frame();
}
/** A press (and optional drag) on the element hit at the point, as the pointer would reach it. */
async function press(slider: TpSlider, x: number, y: number, dragTo?: number) {
  const target = slider.shadowRoot!.elementFromPoint(x, y)!;
  const init = (clientX: number, buttons: number): PointerEventInit => ({
    bubbles: true,
    composed: true,
    button: 0,
    buttons,
    pointerId: 41,
    pointerType: 'mouse',
    isPrimary: true,
    clientX,
    clientY: y,
  });
  target.dispatchEvent(new PointerEvent('pointerdown', init(x, 1)));
  if (dragTo !== undefined) target.dispatchEvent(new PointerEvent('pointermove', init(dragTo, 1)));
  target.dispatchEvent(new PointerEvent('pointerup', init(dragTo ?? x, 0)));
  await settle(slider);
  return slider.value;
}
const controlRect = (slider: TpSlider) =>
  slider.shadowRoot!.querySelector('.control')!.getBoundingClientRect();
const ticksOf = (slider: TpSlider) => [
  ...slider.shadowRoot!.querySelectorAll<HTMLElement>('[part~="slider-tick"]'),
];

/** T01–T06: tick geometry, markers, snapping and the center detent. */
async function assertTicks() {
  records.length = 0;
  const balance = $<TpSlider>('#ticks');
  await settle(balance);
  const ticks = ticksOf(balance);
  check(
    'T01 a tick every interval with one center tick',
    ticks.length === 11 &&
      ticks.filter((tick) => tick.hasAttribute('data-center')).length === 1 &&
      ticks[5]!.hasAttribute('data-center') &&
      ticks.every((tick) => tick.getAttribute('aria-hidden') === null),
    ticks.map((tick) => tick.style.left),
  );
  check(
    'T02 ticks sit inside the aria-hidden track and mark the filled part',
    ticks[0]!.closest('[part~="slider-track"]')!.getAttribute('aria-hidden') === 'true' &&
      ticks.filter((tick) => tick.hasAttribute('data-filled')).length === 9,
    ticks.map((tick) => tick.hasAttribute('data-filled')),
  );
  const rect = controlRect(balance);
  const center = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const detent: unknown[] = [];
  for (const offset of [-6, -3, 5, 7, 12]) {
    balance.setValue(-40);
    await settle(balance);
    detent.push([offset, await press(balance, center + offset, y)]);
  }
  check(
    'T03 a free press within 6px of the center lands on it, farther presses do not',
    JSON.stringify(detent) === '[[-6,0],[-3,0],[5,0],[7,1],[12,2]]',
    detent,
  );
  balance.setValue(-40);
  await settle(balance);
  const dragged = await press(balance, center - 150, y, center + 4);
  check('T04 a drag ending near the center lands on it', dragged === 0, dragged);
  balance.setValue(1);
  await settle(balance);
  check('T05 programmatic values ignore the detent', balance.value === 1, balance.value);
  balance.setValue(30);
  const speed = $<TpSlider>('#snap');
  await settle(speed);
  const speedRect = controlRect(speed);
  const snapped = await press(
    speed,
    speedRect.left + speedRect.width * 0.6,
    speedRect.top + speedRect.height / 2,
  );
  const input = speed.shadowRoot!.querySelector<TpSliderThumb>('tp-slider-thumb')!.inputElement!;
  check(
    'T06 snap-to-ticks makes the interval the step for pointer and native input',
    snapped === 1.25 && (input as HTMLInputElement).step === '0.25',
    { snapped, step: (input as HTMLInputElement).step },
  );
  speed.setValue(1);
  return { checks: records.length, records: [...records] };
}

/** I01–I07: inline layout, output, label source, edge ticks and geometry. */
async function assertInline() {
  records.length = 0;
  const distance = $<TpSlider>('#distance');
  await settle(distance);
  const root = distance.shadowRoot!;
  const control = root.querySelector('.control')!.getBoundingClientRect();
  const track = root.querySelector('[part~="slider-track"]')!.getBoundingClientRect();
  check(
    'I01 the track fills the control-height row',
    Math.abs(track.height - control.height) < 1 && control.height >= 32,
    { track: track.height, control: control.height },
  );
  check(
    'I02 the output shows without a contract',
    root.querySelector('[part~="slider-output"]')?.textContent?.trim() === '7 km',
    root.querySelector('[part~="slider-output"]')?.textContent,
  );
  const range = root.querySelector<HTMLElement>('[part~="slider-range"]')!.getBoundingClientRect();
  check(
    'I03 the range ends exactly at the value',
    Math.abs(range.right - (track.left + 1 + (track.width - 2) * 0.35)) < 1.5,
    { range: range.right, track: [track.left, track.width] },
  );
  const label = root.querySelector('[part~="slider-label"]')!.getBoundingClientRect();
  const fromLabel = await press(distance, label.left + 4, label.top + label.height / 2);
  check(
    'I04 a press on the label moves the value',
    typeof fromLabel === 'number' && fromLabel !== 7 && fromLabel < 2,
    fromLabel,
  );
  distance.setValue(7);
  const rating = $<TpSlider>('#rating');
  await settle(rating);
  const edges = ticksOf(rating).filter((tick) => tick.hasAttribute('data-edge'));
  check(
    'I05 ticks on the bounds are not drawn in the row',
    edges.length === 2 && edges.every((tick) => getComputedStyle(tick).display === 'none'),
    edges.map((tick) => getComputedStyle(tick).display),
  );
  const field = $<TpField>('#inline-field');
  const fieldSlider = field.querySelector<TpSlider>('tp-slider')!;
  await settle(fieldSlider);
  await field.updateComplete;
  const fieldLabel = field.shadowRoot!.querySelector<HTMLElement>('[part~="field-label"]')!;
  const barLabel = fieldSlider.shadowRoot!.querySelector<HTMLElement>('[part~="slider-label"]')!;
  const thumbInput =
    fieldSlider.shadowRoot!.querySelector<TpSliderThumb>('tp-slider-thumb')!.inputElement!;
  check(
    'I06 the Field label moves into the row and still names the control',
    fieldLabel.hasAttribute('data-control-label') &&
      fieldLabel.getBoundingClientRect().width <= 1 &&
      barLabel.textContent?.trim() === 'Check-in flexibility' &&
      barLabel.getAttribute('aria-hidden') === 'true' &&
      thumbInput.getAttribute('aria-label') === 'Check-in flexibility',
    {
      marked: fieldLabel.hasAttribute('data-control-label'),
      bar: barLabel.textContent,
      name: thumbInput.getAttribute('aria-label'),
    },
  );
  fieldSlider.variant = 'default';
  await settle(fieldSlider);
  await new Promise((resolve) => setTimeout(resolve, 0));
  await field.updateComplete;
  const restored = field.shadowRoot!.querySelector<HTMLElement>('[part~="field-label"]')!;
  check(
    'I07 a default slider gives the Field its visible label back',
    !restored.hasAttribute('data-control-label') &&
      restored.getBoundingClientRect().width > 1 &&
      !fieldSlider.shadowRoot!.querySelector('[part~="slider-label"]'),
    { marked: restored.hasAttribute('data-control-label') },
  );
  fieldSlider.variant = 'inline';
  const vertical = $<TpSlider>('#inline-vertical');
  await settle(vertical);
  check(
    'I08 a vertical inline slider keeps the default look',
    !vertical.shadowRoot!.querySelector('[part~="slider-output"]') &&
      getComputedStyle(
        vertical.shadowRoot!.querySelector<TpSliderThumb>('tp-slider-thumb')!.visualElement!,
      ).backgroundColor !== 'rgba(0, 0, 0, 0)',
    null,
  );
  return { checks: records.length, records: [...records] };
}

/** Adjacent value field: deterministic API/event checks; real gestures are exercised through MCP. */
async function assertEditable() {
  records.length = 0;
  const opacity = $<TpSlider>('#opacity');
  const width = $<TpSlider>('#width');
  const editorOf = (slider: TpSlider) =>
    slider.shadowRoot!.querySelector<HTMLElement & { inputElement?: HTMLInputElement | null }>(
      '[data-value-editor] tp-input',
    )?.inputElement ?? null;
  const ready = async (slider: TpSlider) => {
    for (let i = 0; i < 4; i++) await settle(slider);
  };
  const type = (editor: HTMLInputElement, text: string) => {
    editor.focus();
    editor.value = text;
    editor.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };
  const key = (target: Element, name: string) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: name, bubbles: true, composed: true, cancelable: true }),
    );
  await ready(opacity);
  await ready(width);
  const events: string[] = [];
  const log = (event: Event) => {
    const detail = (event as CustomEvent<{ value?: unknown; reason?: string }>).detail;
    events.push(`${event.type} ${detail?.reason ?? ''} ${JSON.stringify(detail?.value)}`);
  };
  for (const name of ['tp-value-change', 'tp-value-commit', 'tp-field-value'])
    opacity.addEventListener(name, log);
  try {
    const bar = opacity.shadowRoot!.querySelector<HTMLElement>('.root')!;
    const field = opacity.shadowRoot!.querySelector<HTMLElement>('[data-value-editor]')!;
    check(
      'E01 persistent number field is outside the draggable bar',
      !!editorOf(opacity) &&
        !bar.contains(field) &&
        field.getBoundingClientRect().left >= bar.getBoundingClientRect().right,
      { bar: bar.getBoundingClientRect().right, field: field.getBoundingClientRect().left },
    );
    check(
      'E02 Copy actions are absent from Slider',
      [...document.querySelectorAll('tp-slider')].every(
        (slider) => !slider.shadowRoot?.querySelector('tp-copy-button'),
      ),
      {},
    );
    check(
      'E03 range/default keep their presentation and disabled scalar field stays visible',
      !editorOf($<TpSlider>('#editable-range')) &&
        !editorOf($<TpSlider>('#editable-default')) &&
        !!editorOf($<TpSlider>('#editable-disabled'))?.disabled,
      {},
    );
    check(
      'E04 the adjacent field is the only visible value',
      !opacity.shadowRoot!.querySelector('[part~="slider-output"]'),
      {},
    );
    opacity.setValue(0.35);
    await ready(opacity);
    events.length = 0;
    type(editorOf(opacity)!, '0.57');
    key(editorOf(opacity)!, 'Enter');
    await ready(opacity);
    check(
      'E05 Enter commits one Slider change and commit without inner field events',
      opacity.value === 0.57 &&
        events.filter((e) => e.startsWith('tp-value-change')).length === 1 &&
        events.filter((e) => e.startsWith('tp-value-commit')).length === 1 &&
        events.every((e) => e.includes(' input ')),
      { events: [...events] },
    );
    events.length = 0;
    type(editorOf(opacity)!, '0.22');
    key(editorOf(opacity)!, 'Escape');
    await ready(opacity);
    check(
      'E06 Escape discards the draft while the field remains',
      opacity.value === 0.57 && editorOf(opacity)?.value === '0.57' && events.length === 0,
      { events: [...events] },
    );
    type(editorOf(opacity)!, '0.25');
    editorOf(opacity)!.blur();
    await ready(opacity);
    check(
      'E07 blur commits the draft',
      opacity.value === 0.25 && editorOf(opacity)?.value === '0.25',
      {},
    );
    type(editorOf(opacity)!, '5');
    key(editorOf(opacity)!, 'Enter');
    await ready(opacity);
    check(
      'E08 typed values clamp to bounds',
      opacity.value === 1 && editorOf(opacity)?.value === '1',
      {},
    );
    type(editorOf(width)!, '251.74');
    key(editorOf(width)!, 'Enter');
    await ready(width);
    check(
      'E09 typed values round to the Slider step',
      width.value === 251.7 && editorOf(width)?.value === '251.7',
      {},
    );
    const reject = (event: Event) => event.preventDefault();
    opacity.addEventListener('tp-value-change', reject);
    type(editorOf(opacity)!, '0.42');
    key(editorOf(opacity)!, 'Enter');
    await ready(opacity);
    opacity.removeEventListener('tp-value-change', reject);
    check(
      'E10 rejected proposals reconcile the adjacent field',
      opacity.value === 1 && editorOf(opacity)?.value === '1',
      {},
    );
    opacity.setValue(0.4);
    await ready(opacity);
    check('E11 external values synchronize the field', editorOf(opacity)?.value === '0.4', {});
    opacity.readOnly = true;
    await ready(opacity);
    check('E12 read-only field stays visible and read-only', !!editorOf(opacity)?.readOnly, {});
    opacity.readOnly = false;
    opacity.disabled = true;
    await ready(opacity);
    check('E13 disabled field stays visible and disabled', !!editorOf(opacity)?.disabled, {});
    opacity.disabled = false;
    await ready(opacity);
    const form = document.createElement('form');
    let slider = document.createElement('tp-slider') as TpSlider;
    slider.variant = 'inline';
    slider.editableValue = true;
    slider.label = 'Gain';
    slider.name = 'gain';
    slider.defaultValue = 20;
    form.append(slider);
    document.body.append(form);
    await ready(slider);
    type(editorOf(slider)!, '35');
    key(editorOf(slider)!, 'Enter');
    await ready(slider);
    check(
      'E14 only Slider submits the value',
      JSON.stringify([...new FormData(form)]) === JSON.stringify([['gain', '35']]),
      { data: [...new FormData(form)] },
    );
    form.reset();
    await ready(slider);
    check(
      'E15 form reset synchronizes both controls',
      slider.value === 20 && editorOf(slider)?.value === '20',
      {},
    );
    slider.remove();
    slider = document.createElement('tp-slider') as TpSlider;
    slider.variant = 'inline';
    slider.editableValue = true;
    slider.label = 'Controlled gain';
    slider.value = 40;
    form.append(slider);
    await ready(slider);
    type(editorOf(slider)!, '55');
    key(editorOf(slider)!, 'Enter');
    await ready(slider);
    check(
      'E16 unaccepted controlled proposal restores both controls',
      slider.value === 40 && editorOf(slider)?.value === '40',
      {},
    );
    const accept = (event: Event) => {
      slider.value = (event as CustomEvent<{ value: number }>).detail.value;
    };
    slider.addEventListener('tp-value-change', accept);
    type(editorOf(slider)!, '65');
    key(editorOf(slider)!, 'Enter');
    await ready(slider);
    check(
      'E17 controlled owner can accept a field proposal',
      slider.value === 65 && editorOf(slider)?.value === '65',
      {},
    );
    slider.removeEventListener('tp-value-change', accept);
    slider.maximum = 50;
    slider.step = 5;
    await ready(slider);
    check(
      'E18 updated bounds reach the field',
      editorOf(slider)?.getAttribute('aria-valuemax') === '50',
      {},
    );
    slider.minimum = 80;
    await ready(slider);
    check(
      'E21 an indeterminate domain disables its field without throwing',
      !!editorOf(slider)?.disabled,
      {},
    );
    slider.minimum = 0;
    await ready(slider);
    slider.editableValue = false;
    await ready(slider);
    check('E19 disabling the option disposes and removes the editor', !editorOf(slider), {});
    slider.editableValue = true;
    await ready(slider);
    slider.orientation = 'vertical';
    await ready(slider);
    check('E20 vertical keeps its ordinary presentation', !editorOf(slider), {});
    form.remove();
  } finally {
    for (const name of ['tp-value-change', 'tp-value-commit', 'tp-field-value'])
      opacity.removeEventListener(name, log);
    opacity.disabled = false;
    opacity.readOnly = false;
    opacity.setValue(0.35);
    width.setValue(120);
    await ready(opacity);
  }
  return { checks: records.length, records: [...records] };
}

Object.assign(window, {
  sliderTicksInlineAPI: { assertTicks, assertInline, assertEditable, settle, press },
});
document.documentElement.dataset.fixtureReady = 'true';
