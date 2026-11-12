// Manual ordering of a collection's colors: pick a collection, drag the rows, the preview palette
// follows, and Copy order gives `{ collection, order }` (the color values in order) to bake into
// that collection's source.
import { html } from 'lit';
import '/src/register.ts';
import '/src/register/widgets.ts';
import {
  defaultColorCollection,
  reducedColorCollection,
} from '/src/foundation/color-palette/index.ts';
import cssNamed from '/src/foundation/color-palette/collections/css-named/index.ts';
import riso from '/src/foundation/color-palette/collections/riso/index.ts';
import colorBrewer from '/src/foundation/color-palette/collections/colorbrewer/index.ts';
import nipponColors from '/src/foundation/color-palette/collections/nippon/index.ts';
import sanzoWada from '/src/foundation/color-palette/collections/sanzo-wada/index.ts';
import wesAnderson from '/src/foundation/color-palette/collections/wes-anderson/index.ts';
import leCorbusier from '/src/foundation/color-palette/collections/le-corbusier/index.ts';
import wernerColors from '/src/foundation/color-palette/collections/werner/index.ts';
import lospecPalettes from '/src/foundation/color-palette/collections/lospec/index.ts';
import niceColorPalettes from '/src/foundation/color-palette/collections/nice-color-palettes/index.ts';
import type { ColorCollection } from '/src/foundation/color-palette/index.ts';

const collections: readonly ColorCollection[] = [
  riso,
  colorBrewer,
  nipponColors,
  sanzoWada,
  wesAnderson,
  leCorbusier,
  wernerColors,
  lospecPalettes,
  niceColorPalettes,
  cssNamed,
  defaultColorCollection,
  reducedColorCollection,
];
type Row = { id: string; label: string; value: string };
const keyOf = (id: string) => `tp-collection-order:${id}`;
const rowsOf = (collection: ColorCollection): Row[] =>
  collection.colors.map((color) => {
    const value = typeof color === 'string' ? color : color.value;
    const name = typeof color === 'string' ? undefined : color.name;
    return { id: value, label: name ?? value, value };
  });
const savedOrder = (id: string): string[] | null => {
  try {
    const order: unknown = JSON.parse(localStorage.getItem(keyOf(id)) ?? 'null');
    return Array.isArray(order) ? (order as string[]) : null;
  } catch {
    return null;
  }
};

const select = document.querySelector('#collection') as HTMLElement & {
  items: { value: string; label: string }[];
  value: string;
};
const copy = document.querySelector('#copy') as HTMLElement & { value: string };
const preview = document.querySelector('#preview') as HTMLElement & {
  collections: unknown[];
  collection: string;
};
const host = document.querySelector('#list')!;
// Rows render inside the list's shadow root, so their styles are inline.
const chip =
  // The chip reaches over the row's 1px edge, so neighbouring chips are 1px apart.
  'display:inline-block;inline-size:220px;block-size:46px;margin-block:-1px;vertical-align:middle;margin-inline-end:12px;background:';
const muted =
  'color:var(--tp-muted-foreground);font-family:var(--tp-font-mono);margin-inline-start:8px';

let active = collections[0]!;
const publish = (rows: readonly Row[]): void => {
  const order = rows.map((row) => row.value);
  copy.value = JSON.stringify({ collection: active.id, order });
  try {
    localStorage.setItem(keyOf(active.id), JSON.stringify(order));
  } catch {
    /* the order still copies */
  }
  const byValue = new Map(
    active.colors.map((color) => [typeof color === 'string' ? color : color.value, color]),
  );
  preview.collections = [{ ...active, colors: order.map((value) => byValue.get(value)!) }];
  preview.collection = active.id;
};

/** Shows a collection: its saved order, with any color the order misses appended. */
const show = (collection: ColorCollection): void => {
  active = collection;
  const rows = rowsOf(collection);
  const byValue = new Map(rows.map((row) => [row.value, row]));
  const saved = savedOrder(collection.id);
  const initial = saved
    ? [
        ...saved.map((value) => byValue.get(value)).filter((row): row is Row => !!row),
        ...rows.filter((row) => !saved.includes(row.value)),
      ]
    : rows;
  // A list takes its items before its first render, so each collection mounts a new one.
  const list = document.createElement('tp-drag-drop-list') as HTMLElement & {
    label: string;
    size: string;
    renderItem: (item: Row) => unknown;
    defaultValue: Row[];
    value: Row[];
  };
  list.label = collection.name ?? collection.id;
  list.size = 'sm';
  list.renderItem = (item) =>
    html`<span
      ><span style=${chip + item.value}></span>${item.label}${
        item.label === item.value ? '' : html`<span style=${muted}>${item.value}</span>`
      }</span
    >`;
  list.defaultValue = initial;
  list.addEventListener('tp-value-commit', (event) => {
    if (event.target === list) publish(list.value);
  });
  host.replaceChildren(list);
  publish(initial);
};

select.items = collections.map((collection) => ({
  value: collection.id,
  label: `${collection.name ?? collection.id} (${collection.colors.length})`,
}));
select.value = active.id;
select.addEventListener('tp-value-change', (event) => {
  const id = (event as CustomEvent<{ value: string }>).detail.value;
  const next = collections.find((collection) => collection.id === id);
  if (next) queueMicrotask(() => show(next));
});
show(active);

document.querySelector('#reset')!.addEventListener('click', () => {
  try {
    localStorage.removeItem(keyOf(active.id));
  } catch {
    /* nothing kept */
  }
  show(active);
});
