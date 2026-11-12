/* Color palette fixture bootstrap. Driven only through Chrome DevTools MCP (see README.md). */
const params = new URLSearchParams(location.search);
const built = params.has('built');
// `?only=<id>` keeps one instance (smaller accessibility snapshots for real pointer input).
const only = params.get('only');
if (only)
  for (const palette of document.querySelectorAll('tp-color-palette'))
    if (palette.id !== only && !palette.closest(`#${only}`)) palette.remove();
if (built)
  document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')!.href = '/dist/styles.css';
await import(/* @vite-ignore */ built ? '/dist/register.js' : '/src/register.ts');
await import(/* @vite-ignore */ built ? '/dist/register/widgets.js' : '/src/register/widgets.ts');
const api = await import(/* @vite-ignore */ built ? '/dist/widgets.js' : '/src/widgets/index.ts');
/** A loader that answers after `delay` ms, failing first when `failures` is above zero. */
function slowLoader(id: string, name: string, delay: number, failures = 0) {
  let left = failures;
  return {
    id,
    name,
    calls: 0,
    load(this: { calls: number }) {
      this.calls++;
      return new Promise<{ id: string; name: string; colors: string[] }>((resolve, reject) =>
        setTimeout(() => {
          if (left-- > 0) reject(new Error('The collection server is not reachable.'));
          else
            resolve({ id, name, colors: ['#e4572e', '#29335c', '#f3a712', '#a8c686', '#669bbc'] });
        }, delay),
      );
    },
  };
}

/** About 600 colors: 24 hues × 25 lightness and chroma steps, a stress test for the window. */
function stressCollection() {
  const colors: { value: string; name: string; group: string }[] = [];
  const groups: { id: string; name: string }[] = [];
  for (let hue = 0; hue < 24; hue++) {
    const id = `h${hue * 15}`;
    groups.push({ id, name: `Hue ${hue * 15}°` });
    for (let step = 0; step < 25; step++) {
      const l = 0.25 + (step % 5) * 0.15;
      const c = 0.04 + Math.floor(step / 5) * 0.035;
      colors.push({
        value: `oklch(${l.toFixed(2)} ${c.toFixed(3)} ${hue * 15})`,
        name: `${id}-${step}`,
        group: id,
      });
    }
  }
  return { id: 'stress', name: 'Stress', groups, colors };
}

interface Recorded {
  readonly type: string;
  readonly target: string;
  readonly value: unknown;
  readonly reason: unknown;
  readonly metadata: unknown;
}
const events: Recorded[] = [];
const leaked: Recorded[] = [];
const LANES = [
  'tp-value-change',
  'tp-value-commit',
  'tp-collection-change',
  'tp-mode-change',
  'tp-grouping-change',
  'tp-sort-change',
  'tp-sort-direction-change',
  'tp-layout-change',
  'tp-palette-style-change',
  'tp-favorites-change',
  'tp-size-change',
];
for (const type of LANES)
  document.addEventListener(type, (event) => {
    const detail = (event as CustomEvent<Record<string, unknown>>).detail ?? {};
    const target = event.target as HTMLElement;
    const entry = {
      type,
      target: target.id || target.localName,
      value: detail.value,
      reason: detail.reason,
      metadata: detail.metadata,
    };
    if (target.localName === 'tp-color-palette') events.push(entry);
    else leaked.push(entry);
  });

const byId = (id: string) => document.getElementById(id) as HTMLElement & Record<string, unknown>;
const collections = byId('collections');
if (collections)
  // Every shipped collection as a loader: only the active one downloads.
  collections.collections = [...api.colorCollectionCatalog, api.reducedColorCollection];
const loading = byId('loading');
if (loading) loading.collections = [slowLoader('slow', 'Slow collection', 1500)];
const failing = byId('failing');
if (failing) failing.collections = [slowLoader('flaky', 'Flaky collection', 600, 1)];
const large = byId('large');
if (large) large.collections = [stressCollection()];

function listRoot(id: string): ShadowRoot | null | undefined {
  return byId(id)?.shadowRoot;
}

Object.assign(window, {
  colorPaletteAPI: {
    events,
    leaked,
    clear: () => {
      events.length = 0;
      leaked.length = 0;
    },
    /** Mounted options and rows of a palette's window. */
    windowStats(id: string) {
      const root = listRoot(id);
      return {
        options: root?.querySelectorAll('[role="option"]').length ?? 0,
        rows: root?.querySelectorAll('.row').length ?? 0,
        labels: root?.querySelectorAll('.label').length ?? 0,
      };
    },
    /** Each mounted cell's box and paint, for gap and edge checks. */
    cells(id: string, count = 12) {
      const root = listRoot(id);
      return [...(root?.querySelectorAll<HTMLElement>('.row > [role="option"]') ?? [])]
        .slice(0, count)
        .map((cell) => {
          const box = cell.getBoundingClientRect();
          const style = getComputedStyle(cell);
          return {
            name: cell.getAttribute('aria-label'),
            x: Math.round(box.x * 10) / 10,
            y: Math.round(box.y * 10) / 10,
            w: Math.round(box.width * 10) / 10,
            h: Math.round(box.height * 10) / 10,
            border: style.borderTopWidth,
            shadow: style.boxShadow,
            selected: cell.hasAttribute('data-selected'),
          };
        });
    },
    stressCollection,
  },
});
document.documentElement.setAttribute('data-fixture-ready', '');
