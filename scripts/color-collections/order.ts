// Shared ordering for generated color collections: the hue families in order; inside each, the
// vivid colors, then the moderate, then the muted (OKLCH chroma bands), each band light to dark.
import { existsSync, readFileSync } from 'node:fs';
import { convertColor } from '../../src/foundation/color/convert.ts';
import { parseColor } from '../../src/foundation/color/parse.ts';
import { HUE_FAMILIES, hueFamily } from '../../src/foundation/color/palette.ts';

export const GROUP_NAMES: Readonly<Record<string, string>> = {
  red: 'Reds',
  orange: 'Oranges',
  yellow: 'Yellows',
  green: 'Greens',
  teal: 'Teals',
  blue: 'Blues',
  purple: 'Purples',
  pink: 'Pinks',
  neutral: 'Neutrals',
};

/** The hue family of a color text. */
export function familyOf(value: string): string {
  const color = parseColor(value);
  if (!color) throw new Error(`not a color: ${value}`);
  return hueFamily(color);
}

/**
 * Orders items by family, then chroma band, then lightness. An explicit `order` (color values, as
 * the collection-order fixture copies them) wins; items it misses follow in the computed order.
 */
export function orderColors<T>(
  items: readonly T[],
  valueOf: (item: T) => string,
  order?: readonly string[],
): T[] {
  const lch = (value: string) => convertColor(parseColor(value)!, 'oklch').coords;
  const band = (chroma: number) => (chroma >= 0.12 ? 0 : chroma >= 0.06 ? 1 : 2);
  const computed = HUE_FAMILIES.flatMap((family) =>
    items
      .filter((item) => familyOf(valueOf(item)) === family)
      .map((item) => ({ item, l: lch(valueOf(item))[0]!, c: lch(valueOf(item))[1]! }))
      .sort((a, b) => band(a.c) - band(b.c) || b.l - a.l)
      .map((entry) => entry.item),
  );
  if (computed.length !== items.length) throw new Error('a color has no family');
  if (!order?.length) return computed;
  const rank = new Map(order.map((value, index) => [value.toLowerCase(), index]));
  const listed = computed
    .filter((item) => rank.has(valueOf(item).toLowerCase()))
    .sort((a, b) => rank.get(valueOf(a).toLowerCase())! - rank.get(valueOf(b).toLowerCase())!);
  return [...listed, ...computed.filter((item) => !rank.has(valueOf(item).toLowerCase()))];
}

/** Text without emoji (pictographs, flags, keycaps, joiners and variation selectors). */
export const plain = (text: string): string =>
  text
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u{20E3}|\u{200D}|\u{FE0F}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** A single-quoted TypeScript string literal of the text, without emoji. */
export const quote = (text: string): string =>
  `'${plain(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/**
 * The hand-picked order of a collection: the given `{ collection, order }` file, otherwise the one
 * saved in scripts/color-collections/orders/<id>.json, otherwise none.
 */
export function savedOrder(id: string, file?: string): readonly string[] | undefined {
  const path = file ?? new URL(`./orders/${id}.json`, import.meta.url).pathname;
  if (!existsSync(path)) return undefined;
  const saved = JSON.parse(readFileSync(path, 'utf8')) as { collection?: string; order?: string[] };
  if (saved.collection && saved.collection !== id)
    throw new Error(`${path} orders ${saved.collection}, not ${id}`);
  return saved.order;
}

/** How a generated collection's colors are ordered, for its header comment. */
export const orderNote = (order: readonly string[] | undefined): string =>
  order?.length
    ? 'listed in a hand-picked order (scripts/color-collections/orders)'
    : 'ordered vivid to muted and light to dark inside each family';
