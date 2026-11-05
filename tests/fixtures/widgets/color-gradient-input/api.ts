/* Assertion helpers for the color gradient input fixture; each returns `{ checks, passed }`. */
interface Stop {
  readonly position: number;
  readonly color: string;
  readonly midpoint?: number;
}
type Gradient = HTMLElement & {
  value: readonly Stop[];
  defaultValue: readonly Stop[] | undefined;
  selected: number;
  updateComplete: Promise<unknown>;
  onValueChange: ((event: CustomEvent<{ value: readonly Stop[] }>) => void) | undefined;
  setValue(stops: readonly Stop[]): boolean;
  setStop(index: number, changes: Partial<Stop>): boolean;
};
interface Check {
  readonly name: string;
  readonly passed: boolean;
  readonly detail?: unknown;
}

const byId = (id: string) => document.getElementById(id) as Gradient;
const positions = (element: Gradient) => element.value.map((stop) => stop.position).join(',');
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const settle = async (element: Gradient) => {
  await frame();
  await frame();
  await element.updateComplete;
};
const result = (checks: Check[]) => ({ checks, passed: checks.every((check) => check.passed) });
const check = (name: string, passed: boolean, detail?: unknown): Check => ({
  name,
  passed,
  ...(passed ? {} : { detail }),
});

/** The deepest element under a point, as hit testing chooses it. */
function deep(x: number, y: number): Element | null {
  let target = document.elementFromPoint(x, y);
  while (target?.shadowRoot) {
    const inner = target.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === target) break;
    target = inner;
  }
  return target;
}

/** Pointer sessions at fractions of the track, on the track row or the midpoint row. */
export function pointer(element: Gradient) {
  const root = element.shadowRoot!;
  let current = { x: 0, y: 0 };
  const at = (fraction: number, row: 'stop' | 'midpoint') => {
    const box = root.querySelector('.frame')!.getBoundingClientRect();
    const track = root.querySelector('.track')!.getBoundingClientRect();
    const mid = root.querySelector('.midpoint:not([hidden])')?.getBoundingClientRect();
    const rtl = getComputedStyle(element).direction === 'rtl';
    const x = box.left + box.width * (rtl ? 1 - fraction : fraction);
    return {
      x,
      y: row === 'midpoint' && mid ? mid.top + mid.height / 2 : track.top + track.height / 2,
    };
  };
  const fire = (type: string) =>
    deep(current.x, current.y)?.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        composed: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        button: type === 'pointermove' ? -1 : 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: current.x,
        clientY: current.y,
      }),
    );
  return {
    async press(fraction: number, row: 'stop' | 'midpoint' = 'stop') {
      current = at(fraction, row);
      fire('pointerdown');
      await settle(element);
    },
    async move(fraction: number, row: 'stop' | 'midpoint' = 'stop') {
      current = at(fraction, row);
      fire('pointermove');
      await settle(element);
    },
    async up() {
      fire('pointerup');
      await settle(element);
    },
  };
}

function record(element: Gradient): string[] {
  const log: string[] = [];
  for (const type of ['tp-value-change', 'tp-value-commit', 'tp-selection-change'])
    element.addEventListener(type, (event) =>
      log.push(`${type.slice(3)}:${(event as CustomEvent<{ reason: string }>).detail.reason}`),
    );
  return log;
}

/** Track press adds a sampled stop, a drag passes neighbors with the selection, Escape restores. */
export async function assertPointer(): Promise<ReturnType<typeof result>> {
  const element = byId('default');
  const log = record(element);
  const drag = pointer(element);
  const checks: Check[] = [];
  await drag.press(0.2);
  checks.push(
    check('press adds a stop', positions(element) === '0,0.2,0.45,0.75,1', positions(element)),
  );
  checks.push(
    check('the new stop is hex', /^#[0-9a-f]{6}$/.test(element.value[1]!.color), element.value[1]),
  );
  checks.push(check('the new stop is selected', element.selected === 1, element.selected));
  await drag.move(0.8);
  await drag.up();
  checks.push(
    check(
      'it passes two neighbors',
      positions(element) === '0,0.45,0.75,0.8,1',
      positions(element),
    ),
  );
  checks.push(check('selection follows it', element.selected === 3, element.selected));
  checks.push(
    check(
      'one commit per gesture',
      log.filter((entry) => entry.startsWith('value-commit')).length === 1,
      log,
    ),
  );
  const before = positions(element);
  await drag.press(0.45);
  await drag.move(0.1);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await settle(element);
  await drag.up();
  checks.push(
    check('Escape restores the stops', positions(element) === before, positions(element)),
  );
  const midpoints = element.shadowRoot!.querySelectorAll('.midpoint');
  checks.push(
    check('a midpoint per span', midpoints.length === element.value.length - 1, midpoints.length),
  );
  return result(checks);
}

/** A late owner (writes back a microtask later) publishes; a silent owner keeps its stops. */
export async function assertControlled(): Promise<ReturnType<typeof result>> {
  const checks: Check[] = [];
  const initial: Stop[] = [
    { position: 0, color: '#000000' },
    { position: 1, color: '#ffffff' },
  ];
  const make = (writeBack: boolean) => {
    const element = document.createElement('tp-color-gradient-input') as Gradient;
    element.setAttribute('label', writeBack ? 'Late owner' : 'Silent owner');
    element.value = initial;
    element.onValueChange = (event) => {
      if (writeBack) queueMicrotask(() => (element.value = event.detail.value));
    };
    document.querySelector('main')!.append(element);
    return element;
  };
  const late = make(true);
  const silent = make(false);
  await settle(late);
  const commits: number[] = [];
  late.addEventListener('tp-value-commit', () => commits.push(late.value.length));
  const lateDrag = pointer(late);
  await lateDrag.press(0.5);
  await lateDrag.up();
  await settle(late);
  checks.push(check('a late owner publishes the press', late.value.length === 3, positions(late)));
  checks.push(check('its commit carries the published stops', commits.join() === '3', commits));
  const silentDrag = pointer(silent);
  await silentDrag.press(0.5);
  await silentDrag.up();
  checks.push(
    check('a silent owner keeps its stops', silent.value.length === 2, positions(silent)),
  );
  late.remove();
  silent.remove();
  return result(checks);
}

/** The stops submit as JSON under `name`, and a form reset restores the default stops. */
export async function assertForm(): Promise<ReturnType<typeof result>> {
  const element = byId('field');
  const form = document.getElementById('form') as HTMLFormElement;
  const checks: Check[] = [];
  const submitted = () => JSON.parse(String(new FormData(form).get('ramp') ?? 'null')) as Stop[];
  checks.push(check('submits the stops as JSON', submitted().length === 2, submitted()));
  element.setStop(1, { color: '#ff0000' });
  await settle(element);
  checks.push(check('submits an edit', submitted()[1]?.color === '#ff0000', submitted()));
  form.reset();
  await settle(element);
  checks.push(
    check('reset restores the default', element.value[1]?.color === '#ffffff', element.value),
  );
  return result(checks);
}

/** Read-only and disabled instances refuse every edit; RTL mirrors positions. */
export async function assertStates(): Promise<ReturnType<typeof result>> {
  const checks: Check[] = [];
  for (const id of ['readonly', 'disabled']) {
    const element = byId(id);
    const before = positions(element);
    const drag = pointer(element);
    await drag.press(0.5);
    await drag.up();
    checks.push(check(`${id} refuses a press`, positions(element) === before, positions(element)));
  }
  const rtl = byId('rtl');
  const first = rtl.shadowRoot!.querySelector('.stop')!.getBoundingClientRect();
  const last = [...rtl.shadowRoot!.querySelectorAll('.stop')].at(-1)!.getBoundingClientRect();
  checks.push(
    check('RTL places the first stop at the right', first.left > last.left, [
      first.left,
      last.left,
    ]),
  );
  const rtlDrag = pointer(rtl);
  await rtlDrag.press(0.25);
  await rtlDrag.up();
  checks.push(
    check('RTL adds at the pressed position', rtl.value[1]?.position === 0.25, rtl.value),
  );
  return result(checks);
}
