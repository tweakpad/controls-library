import { fillTemplate } from '../../foundation/template.js';
import { contrastColor } from '../../foundation/color/contrast.js';
import { convertColor, mixColors } from '../../foundation/color/convert.js';
import { parseColor } from '../../foundation/color/parse.js';
import { normalizeWeights } from '../../foundation/color-palette/parse.js';
import { displayColor, flatGradient, serializeColor } from '../../foundation/color/serialize.js';
import type { ColorValue } from '../../foundation/color/types.js';
import {
  MAX_PALETTE_STOPS,
  groupSwatches,
  type PaletteGroup,
  type PaletteGrouping,
  type PaletteSet,
  type PaletteSort,
  type PaletteSwatch,
  type ResolvedColorCollection,
  type SortDirection,
} from '../../foundation/color-palette/index.js';
import { FAMILY_KEYS } from './strings.js';
import type {
  ColorPaletteFavorite,
  ColorPaletteLayout,
  ColorPaletteMode,
  ColorPalettePaletteStyle,
  ColorPaletteStrings,
  ColorPaletteSwatchInfo,
} from './types.js';

/** One listed color: an option of the list. */
export interface PaletteSlot {
  readonly key: string;
  readonly swatch: PaletteSwatch;
  readonly set?: PaletteSet;
  /** Display name of the set. */
  readonly setName?: string;
  readonly share?: number;
  /** Whether the option shows its stretch of its palette's blended gradient. */
  readonly blend?: boolean;
  /** Index of the favorite it belongs to, in the favorites mode. */
  readonly favorite?: number;
  /** Value paint of the option, as custom properties. */
  readonly paint: Readonly<Record<string, string>>;
}

/** A group of the list: a color group or a palette. */
export interface PaletteListGroup {
  readonly key: string;
  /** Accessible name of the group; absent for an unnamed group. */
  readonly name?: string;
  /** Visible label content; absent for an unnamed group, which shows no label row. */
  readonly label?: unknown;
  /** A section heading of the favorites, above the groups of its kind. */
  readonly section?: boolean;
}

/**
 * One row of the virtual window, all one cell tall: a group's label, or a row of its options.
 */
export type PaletteUnit =
  | { readonly kind: 'label'; readonly key: string; readonly group: number }
  | {
      readonly kind: 'row';
      readonly key: string;
      readonly group: number;
      readonly slots: readonly PaletteSlot[];
      /** A palette's row: its options share the row by their shares. */
      readonly palette?: boolean;
    };

/** The groups and rows of one mode and the slots behind their options. */
export interface PaletteListModel {
  readonly groups: readonly PaletteListGroup[];
  /** Label and option rows in display order. */
  readonly units: readonly PaletteUnit[];
  readonly slots: ReadonlyMap<string, PaletteSlot>;
  /** Option keys in list order. */
  readonly keys: readonly string[];
  /** Index in `units` of the row that holds each option key. */
  readonly rowOf: ReadonlyMap<string, number>;
  /** Options per grid row. */
  readonly columns: number;
  /** The longest set, for the sets modes. */
  readonly longest: number;
}

export interface PaletteListInput {
  readonly collection: ResolvedColorCollection;
  readonly mode: ColorPaletteMode;
  /** How the colors mode shows its colors. */
  readonly layout: ColorPaletteLayout;
  /** How the palettes mode shows each palette: hard stops, or one blended gradient. */
  readonly paletteStyle: ColorPalettePaletteStyle;
  readonly grouping: PaletteGrouping;
  readonly sort: PaletteSort;
  readonly direction: SortDirection;
  readonly strings: ColorPaletteStrings;
  /** Grid columns (the palettes mode puts each palette on one row). */
  readonly columns: number;
  /** The bookmarked colors, palettes and gradients, for the favorites mode. */
  readonly favorites: readonly ColorPaletteFavorite[];
}

/** The display name of a swatch: its name, otherwise its color text. */
export const swatchName = (swatch: PaletteSwatch): string => swatch.name ?? swatch.value;

/** The HSL text of a color, in whole degrees and percents. */
export function hslText(swatch: PaletteSwatch, strings: ColorPaletteStrings): string {
  const [hue, saturation, lightness] = convertColor(swatch.color, 'hsl').coords;
  const whole = (value: number) => String(Number.isFinite(value) ? Math.round(value) : 0);
  return fillTemplate(strings.hsl, {
    h: whole(((hue % 360) + 360) % 360),
    s: whole(saturation),
    l: whole(lightness),
  });
}

/** The visible text of a list row: the color's name, otherwise its HSL text. */
export const listText = (swatch: PaletteSwatch, strings: ColorPaletteStrings): string =>
  swatch.name ?? hslText(swatch, strings);

/** The display name of a grid group. */
export function groupName(group: PaletteGroup, strings: ColorPaletteStrings): string | undefined {
  if (group.family) return strings[FAMILY_KEYS[group.family]];
  if (group.ungrouped) return strings.other;
  return group.name;
}

/** The display name of a palette: its name, otherwise its number. */
export function setName(set: PaletteSet, index: number, strings: ColorPaletteStrings): string {
  return set.name ?? fillTemplate(strings.palette, { number: index + 1 });
}

/** Swatch information for events and `activeSwatch`. */
export function swatchInfo(slot: PaletteSlot): ColorPaletteSwatchInfo {
  const { swatch, set } = slot;
  return {
    value: swatch.value,
    ...(swatch.name ? { name: swatch.name } : {}),
    ...(swatch.group !== undefined ? { group: swatch.group } : {}),
    ...(set ? { set: { name: slot.setName ?? '' } } : {}),
    ...(slot.share !== undefined ? { share: slot.share } : {}),
  };
}

/** Builds the groups and rows of the active mode. */
export function buildListModel(input: PaletteListInput): PaletteListModel {
  const { collection, strings } = input;
  const slots = new Map<string, PaletteSlot>();
  const keys: string[] = [];
  const groups: PaletteListGroup[] = [];
  const units: PaletteUnit[] = [];
  const rowOf = new Map<string, number>();
  const list = input.mode === 'colors' && input.layout === 'list';
  const slot = (
    fields: Omit<PaletteSlot, 'paint' | 'blend'>,
    blend?: Readonly<Record<string, string>>,
  ): PaletteSlot => {
    const { color } = fields.swatch;
    const paint: Record<string, string> = list
      ? // A list row paints only its color; the row stays on the surface.
        { '--_tp-color-palette-swatch-paint': flatGradient(color) }
      : {
          // Value paint: the swatch's own color and a mark color that reads on it.
          '--_tp-color-palette-paint': flatGradient(color),
          '--_tp-color-palette-contrast': contrastColor(color),
          ...blend,
        };
    // A weighted palette's share sizes its option, so the row is its proportion block.
    if (fields.share !== undefined) paint['--_tp-color-palette-share'] = String(fields.share);
    const result = { ...fields, paint, ...(blend ? { blend: true } : {}) };
    slots.set(result.key, result);
    keys.push(result.key);
    return result;
  };
  const group = (entry: PaletteListGroup): number => {
    const index = groups.push(entry) - 1;
    if (entry.label !== undefined)
      units.push({ kind: 'label', key: `${entry.key}:label`, group: index });
    return index;
  };
  const row = (index: number, key: string, members: readonly PaletteSlot[], palette = false) => {
    for (const member of members) rowOf.set(member.key, units.length);
    units.push({ kind: 'row', key, group: index, slots: members, ...(palette ? { palette } : {}) });
  };
  const cells = (index: number, key: string, members: readonly PaletteSlot[], columns: number) => {
    for (let start = 0; start < members.length; start += columns)
      row(index, `${key}:${start}`, members.slice(start, start + columns));
  };
  // The options of one palette: hard stops, or stretches of one row-wide blend.
  const paletteRow = (
    key: string,
    palette: PaletteSet,
    name: string,
    blended: boolean,
    favorite?: number,
  ): PaletteSlot[] => {
    const count = palette.swatches.length;
    const shares = palette.weights ?? palette.swatches.map(() => 1 / count);
    const blend = blended
      ? blendPaint(
          palette.swatches.map((swatch) => swatch.color),
          shares,
        )
      : undefined;
    let start = 0;
    return palette.swatches.map((swatch, position) => {
      const share = shares[position]!;
      const option = slot(
        {
          key: `${key}:${position}`,
          swatch,
          set: palette,
          setName: name,
          ...(palette.weights ? { share } : {}),
          ...(favorite !== undefined ? { favorite } : {}),
        },
        blend && {
          '--_tp-color-palette-blend': blend.ltr,
          '--_tp-color-palette-blend-rtl': blend.rtl,
          // The gradient spans the whole row: each option shows its own stretch of it.
          '--_tp-color-palette-blend-size': `${round(100 / share)}% 100%`,
          '--_tp-color-palette-blend-x': `${offset(start, share)}%`,
          '--_tp-color-palette-blend-x-rtl': `${offset(1 - start - share, share)}%`,
        },
      );
      start += share;
      return option;
    });
  };
  if (input.mode === 'colors') {
    const columns = list ? 1 : Math.max(1, input.columns);
    groupSwatches(collection, input.grouping, input.sort, input.direction).forEach(
      (entry, index) => {
        const name = groupName(entry, strings);
        cells(
          group({ key: `g${index}`, ...(name ? { name, label: name } : {}) }),
          `g${index}`,
          entry.swatches.map((swatch) => slot({ key: `g:${swatch.key}`, swatch })),
          columns,
        );
      },
    );
    return { groups, units, slots, keys, rowOf, columns, longest: 0 };
  }
  let longest = 1;
  if (input.mode === 'palettes') {
    collection.palettes.forEach((palette, index) => {
      const name = setName(palette, index, strings);
      longest = Math.max(longest, palette.swatches.length);
      // Each palette is one row: its colors share the list's inline size.
      row(
        group({ key: palette.key, name, label: name }),
        palette.key,
        paletteRow(palette.key, palette, name, input.paletteStyle === 'gradient'),
        true,
      );
    });
    return { groups, units, slots, keys, rowOf, columns: longest, longest };
  }
  // Favorites: sections of colors, palettes and gradients, each in the order they were added.
  const colors: PaletteSlot[] = [];
  const sets: { kind: 'palette' | 'gradient'; index: number; palette: PaletteSet; name: string }[] =
    [];
  input.favorites.forEach((favorite, index) => {
    if (favorite.kind === 'color') {
      const swatch = favoriteSwatch(collection, favorite.value, favorite.name, `f${index}`);
      if (swatch) colors.push(slot({ key: `f${index}`, swatch, favorite: index }));
      return;
    }
    const swatches = favorite.colors
      .map((value, position) =>
        favoriteSwatch(collection, value, undefined, `f${index}-${position}`),
      )
      .filter((swatch): swatch is PaletteSwatch => !!swatch);
    if (swatches.length < 2) return;
    const weights =
      favorite.weights && favorite.weights.length === swatches.length
        ? normalizeWeights(favorite.weights)
        : undefined;
    const palette: PaletteSet = {
      key: `f${index}`,
      ...(favorite.name ? { name: favorite.name } : {}),
      swatches,
      ...(weights ? { weights } : {}),
    };
    sets.push({
      kind: favorite.kind,
      index,
      palette,
      // An unnamed one is numbered among the favorites of its kind.
      name: setName(palette, sets.filter((entry) => entry.kind === favorite.kind).length, strings),
    });
  });
  const columns = Math.max(1, input.columns);
  if (colors.length) {
    const label = strings.favoriteColors;
    cells(
      group({ key: 'favorites:colors', name: label, label, section: true }),
      'favorites:colors',
      colors,
      columns,
    );
  }
  for (const kind of ['palette', 'gradient'] as const) {
    const members = sets.filter((entry) => entry.kind === kind);
    if (!members.length) continue;
    // The section heading stands alone; each palette below it is a group named like the palettes.
    const label = kind === 'palette' ? strings.favoritePalettes : strings.favoriteGradients;
    group({ key: `favorites:${kind}s`, label, section: true });
    for (const entry of members) {
      longest = Math.max(longest, entry.palette.swatches.length);
      const key = entry.palette.key;
      row(
        group({ key: `favorites:${key}`, name: entry.name, label: entry.name }),
        key,
        paletteRow(entry.palette.key, entry.palette, entry.name, kind === 'gradient', entry.index),
        true,
      );
    }
  }
  return { groups, units, slots, keys, rowOf, columns, longest };
}

/**
 * The swatch of a bookmarked color: the collection's own swatch when it holds the color, so it
 * keeps its name, otherwise a swatch of the color text; nothing when the text is not a color.
 */
function favoriteSwatch(
  collection: ResolvedColorCollection,
  value: string,
  name: string | undefined,
  key: string,
): PaletteSwatch | undefined {
  const parsed = parseColor(value);
  if (!parsed) return undefined;
  const identity = serializeColor(parsed, 'hex');
  const known = collection.swatches.find((swatch) => swatch.identity === identity);
  if (known && (name === undefined || name === known.name)) return known;
  return {
    key,
    value,
    ...((name ?? known?.name) ? { name: name ?? known!.name! } : {}),
    color: parsed,
    index: -1,
    identity,
  };
}

/** Whether two favorites bookmark the same color, palette or gradient. */
export function sameFavorite(a: ColorPaletteFavorite, b: ColorPaletteFavorite): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'color' && b.kind === 'color') return identity(a.value) === identity(b.value);
  if (a.kind === 'color' || b.kind === 'color') return false;
  return (
    a.colors.length === b.colors.length &&
    a.colors.every((value, index) => identity(value) === identity(b.colors[index]!)) &&
    (a.weights ?? []).join() === (b.weights ?? []).join()
  );
}

const identity = (value: string): string => {
  const parsed = parseColor(value);
  return parsed ? serializeColor(parsed, 'hex') : value;
};

/**
 * Favorites read back from storage or given by an application: the well-formed entries only,
 * palettes and gradients cut to twelve colors.
 */
export function sanitizeFavorites(value: unknown): ColorPaletteFavorite[] {
  if (!Array.isArray(value)) return [];
  const result: ColorPaletteFavorite[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const name = typeof record.name === 'string' && record.name ? { name: record.name } : {};
    if (record.kind === 'color' && typeof record.value === 'string')
      result.push({ kind: 'color', value: record.value, ...name });
    else if (
      (record.kind === 'palette' || record.kind === 'gradient') &&
      Array.isArray(record.colors)
    ) {
      const colors = record.colors
        .filter((color): color is string => typeof color === 'string')
        .slice(0, MAX_PALETTE_STOPS);
      if (colors.length < 2) continue;
      const weights =
        Array.isArray(record.weights) &&
        record.weights.length === colors.length &&
        record.weights.every((weight) => typeof weight === 'number' && weight >= 0)
          ? { weights: record.weights as number[] }
          : {};
      result.push({ kind: record.kind, colors, ...name, ...weights });
    }
  }
  return result;
}

/** OKLab samples between neighboring stops, so every renderer shows the same blend. */
const BLEND_SAMPLES = 6;
const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * The background position, in percent, that shows the stretch of a row-wide image starting at
 * `start` (0–1 of the row) in an option `share` of the row wide.
 */
function offset(start: number, share: number): number {
  return share >= 1 ? 0 : round((Math.max(0, start) / (1 - share)) * 100);
}

/**
 * A row-wide gradient through `colors`, each at the middle of its share of the row, blended in
 * OKLab; `rtl` runs the same stops from the inline end.
 */
export function blendPaint(
  colors: readonly ColorValue[],
  shares: readonly number[],
): { ltr: string; rtl: string } {
  const centers: number[] = [];
  let start = 0;
  for (const share of shares) {
    centers.push(start + share / 2);
    start += share;
  }
  const stops = [`${displayColor(colors[0]!)} 0%`];
  for (let span = 0; span < colors.length - 1; span++)
    for (let step = 0; step < BLEND_SAMPLES; step++) {
      const t = step / BLEND_SAMPLES;
      const at = centers[span]! + (centers[span + 1]! - centers[span]!) * t;
      stops.push(
        `${displayColor(mixColors(colors[span]!, colors[span + 1]!, t))} ${round(at * 100)}%`,
      );
    }
  const last = displayColor(colors.at(-1)!);
  stops.push(`${last} ${round(centers.at(-1)! * 100)}%`, `${last} 100%`);
  const list = stops.join(', ');
  return { ltr: `linear-gradient(to right, ${list})`, rtl: `linear-gradient(to left, ${list})` };
}

/**
 * The option key that shows as selected: the last picked option while it still holds the value,
 * otherwise the first plain color option of the value's color. A color inside a palette shows as
 * selected only when it was picked from that palette, not because the value matches it.
 */
export function selectedKey(
  model: PaletteListModel,
  value: string,
  picked: string | undefined,
  identityOf: (value: string) => string | undefined,
): string | undefined {
  const identity = identityOf(value);
  if (identity === undefined) return undefined;
  if (picked !== undefined && model.slots.get(picked)?.swatch.identity === identity) return picked;
  return model.keys.find((key) => {
    const slot = model.slots.get(key)!;
    return !slot.set && slot.swatch.identity === identity;
  });
}
