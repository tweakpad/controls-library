import {
  HUE_FAMILIES,
  hueFamily,
  parseColor,
  serializeColor,
  sortByColor,
  type HueFamily,
  type SortDirection,
} from '../color/index.js';
import type {
  PaletteGroup,
  PaletteGrouping,
  PaletteSort,
  PaletteSwatch,
  ResolvedColorCollection,
} from './types.js';

/**
 * Groups the swatches of a collection for the grid: by the collection's groups in display order
 * with ungrouped colors last, by hue family, or in one flat group, each group ordered by `sort`.
 * Empty groups are left out.
 */
export function groupSwatches(
  collection: ResolvedColorCollection,
  grouping: PaletteGrouping,
  sort: PaletteSort = 'collection',
  direction: SortDirection = 'ascending',
): PaletteGroup[] {
  const order = (swatches: readonly PaletteSwatch[]): readonly PaletteSwatch[] =>
    sort === 'collection'
      ? direction === 'descending'
        ? [...swatches].reverse()
        : swatches
      : sortByColor(swatches, (swatch) => swatch.color, sort, direction);
  const groups: PaletteGroup[] = [];
  if (grouping === 'hue') {
    const families = new Map<HueFamily, PaletteSwatch[]>();
    for (const swatch of collection.swatches) {
      const family = hueFamily(swatch.color);
      const members = families.get(family);
      if (members) members.push(swatch);
      else families.set(family, [swatch]);
    }
    for (const family of HUE_FAMILIES) {
      const members = families.get(family);
      if (members) groups.push({ key: `hue:${family}`, family, swatches: order(members) });
    }
    return groups;
  }
  if (grouping === 'collection' && collection.groups.length) {
    const byGroup = new Map<string, PaletteSwatch[]>();
    const ungrouped: PaletteSwatch[] = [];
    for (const swatch of collection.swatches) {
      if (swatch.group === undefined) {
        ungrouped.push(swatch);
        continue;
      }
      const members = byGroup.get(swatch.group);
      if (members) members.push(swatch);
      else byGroup.set(swatch.group, [swatch]);
    }
    for (const group of collection.groups) {
      const members = byGroup.get(group.id);
      if (members)
        groups.push({
          key: `group:${group.id}`,
          name: group.name ?? group.id,
          swatches: order(members),
        });
    }
    if (ungrouped.length)
      groups.push({ key: 'group:', ungrouped: true, swatches: order(ungrouped) });
    return groups;
  }
  if (collection.swatches.length) groups.push({ key: 'all', swatches: order(collection.swatches) });
  return groups;
}

/** The first swatch whose color is `value` (by hex identity), if any. */
export function findSwatch(
  collection: ResolvedColorCollection,
  value: string | null | undefined,
): PaletteSwatch | undefined {
  const parsed = value ? parseColor(value) : null;
  if (!parsed) return undefined;
  const identity = serializeColor(parsed, 'hex');
  return collection.swatches.find((swatch) => swatch.identity === identity);
}
