import { fillTemplate } from '../../foundation/template.js';
import { contrastColor } from '../../foundation/color/contrast.js';
import { convertColor, mixColors } from '../../foundation/color/convert.js';
import { displayColor, flatGradient } from '../../foundation/color/serialize.js';
import type { ColorValue } from '../../foundation/color/types.js';
import {
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
  const addGroup = (group: PaletteListGroup, members: readonly PaletteSlot[], columns: number) => {
    const index = groups.push(group) - 1;
    if (group.label !== undefined)
      units.push({ kind: 'label', key: `${group.key}:label`, group: index });
    for (let start = 0; start < members.length; start += columns) {
      const row = members.slice(start, start + columns);
      for (const member of row) rowOf.set(member.key, units.length);
      units.push({ kind: 'row', key: `${group.key}:${start}`, group: index, slots: row });
    }
  };
  const groupsOf = groupSwatches(collection, input.grouping, input.sort, input.direction);
  if (input.mode === 'colors') {
    const columns = list ? 1 : Math.max(1, input.columns);
    groupsOf.forEach((group, index) => {
      const name = groupName(group, strings);
      addGroup(
        { key: `g${index}`, ...(name ? { name, label: name } : {}) },
        group.swatches.map((swatch) => slot({ key: `g:${swatch.key}`, swatch })),
        columns,
      );
    });
    return { groups, units, slots, keys, rowOf, columns, longest: 0 };
  }
  let longest = 1;
  collection.palettes.forEach((set, index) => {
    const name = setName(set, index, strings);
    longest = Math.max(longest, set.swatches.length);
    const count = set.swatches.length;
    const shares = set.weights ?? set.swatches.map(() => 1 / count);
    const blend =
      input.paletteStyle === 'gradient'
        ? blendPaint(
            set.swatches.map((swatch) => swatch.color),
            shares,
          )
        : undefined;
    let start = 0;
    const members = set.swatches.map((swatch, position) => {
      const share = shares[position]!;
      const option = slot(
        {
          key: `${set.key}:${position}`,
          swatch,
          set,
          setName: name,
          ...(set.weights ? { share } : {}),
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
    // Each set is one row: its colors share the list's inline size.
    addGroup({ key: set.key, name, label: name }, members, Math.max(1, members.length));
  });
  return { groups, units, slots, keys, rowOf, columns: longest, longest };
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
 * otherwise the first option of the value's color.
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
  return model.keys.find((key) => model.slots.get(key)!.swatch.identity === identity);
}
