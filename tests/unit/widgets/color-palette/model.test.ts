import { describe, expect, it } from 'vitest';
import {
  defaultColorCollection,
  resolveColorCollection,
} from '../../../../src/foundation/color-palette/index.js';
import {
  blendPaint,
  buildListModel,
  hslText,
  listText,
} from '../../../../src/widgets/color-palette/model.js';
import { resolveStrings } from '../../../../src/widgets/color-palette/strings.js';
import type { ColorPaletteLayout } from '../../../../src/widgets/color-palette/types.js';

const strings = resolveStrings();
const collection = resolveColorCollection({
  id: 'plain',
  colors: ['#ff0000', '#808080', { value: '#3a89fa', name: 'Sky' }],
});
const [red, gray, sky] = collection.swatches;

const model = (layout: ColorPaletteLayout) =>
  buildListModel({
    collection,
    mode: 'colors',
    layout,
    paletteStyle: 'stops',
    grouping: 'none',
    sort: 'collection',
    direction: 'ascending',
    strings,
    columns: 9,
  });

describe('color palette list layout', () => {
  it('names an unnamed color by its HSL in whole degrees and percents', () => {
    expect(hslText(red!, strings)).toBe('H: 0 S: 100 L: 50');
    expect(hslText(sky!, strings)).toBe('H: 215 S: 95 L: 60');
    // A gray has no hue: it reads as 0.
    expect(hslText(gray!, strings)).toBe('H: 0 S: 0 L: 50');
  });

  it('shows the name when there is one, otherwise the HSL text', () => {
    expect(listText(sky!, strings)).toBe('Sky');
    expect(listText(red!, strings)).toBe('H: 0 S: 100 L: 50');
  });

  it('puts one color per row and paints only the color of a list row', () => {
    const list = model('list');
    const grid = model('grid');
    expect(list.columns).toBe(1);
    expect(grid.columns).toBe(9);
    const rows = list.units.filter((unit) => unit.kind === 'row');
    expect(rows).toHaveLength(3);
    expect(rows.every((unit) => unit.kind === 'row' && unit.slots.length === 1)).toBe(true);
    const first = list.slots.get(list.keys[0]!)!;
    expect(first.paint).toHaveProperty('--_tp-color-palette-swatch-paint');
    expect(first.paint).not.toHaveProperty('--_tp-color-palette-paint');
    expect(grid.slots.get(grid.keys[0]!)!.paint).toHaveProperty('--_tp-color-palette-paint');
  });

  it('builds uniform rows with labels and finds the row of every option', () => {
    const grid = buildListModel({
      collection: resolveColorCollection(defaultColorCollection),
      mode: 'colors',
      layout: 'grid',
      paletteStyle: 'stops',
      grouping: 'collection',
      sort: 'collection',
      direction: 'ascending',
      strings,
      columns: 4,
    });
    // Every named group starts with its label row; option rows hold at most `columns` options.
    for (const [index, group] of grid.groups.entries()) {
      const units = grid.units.filter((unit) => unit.group === index);
      expect(units[0]!.kind).toBe(group.label === undefined ? 'row' : 'label');
      for (const unit of units)
        if (unit.kind === 'row') expect(unit.slots.length).toBeLessThanOrEqual(4);
    }
    expect(new Set(grid.units.map((unit) => unit.key)).size).toBe(grid.units.length);
    for (const key of grid.keys) {
      const unit = grid.units[grid.rowOf.get(key)!]!;
      expect(unit.kind === 'row' && unit.slots.some((slot) => slot.key === key)).toBe(true);
    }
  });

  it('keeps cells in the palettes mode, one row per collection palette with its name', () => {
    const sets = buildListModel({
      collection: resolveColorCollection(defaultColorCollection),
      mode: 'palettes',
      paletteStyle: 'stops',
      layout: 'list',
      grouping: 'none',
      sort: 'collection',
      direction: 'ascending',
      strings,
      columns: 9,
    });
    expect(sets.columns).toBeGreaterThan(1);
    expect(sets.slots.get(sets.keys[0]!)!.paint).toHaveProperty('--_tp-color-palette-paint');
    // Only the collection's palettes: no generated ones.
    expect(sets.groups.map((group) => group.name)).toEqual([
      'Ember',
      'Lagoon',
      'Dusk',
      'Harbor',
      'Orchard',
      'Clay',
    ]);
    for (const [index, group] of sets.groups.entries()) {
      expect(group.name).toBe(group.label);
      expect(sets.units.filter((unit) => unit.group === index && unit.kind === 'row')).toHaveLength(
        1,
      );
    }
  });

  it('shows each palette as hard stops or as stretches of one row-wide blend', () => {
    const input = {
      collection: resolveColorCollection(defaultColorCollection),
      mode: 'palettes' as const,
      layout: 'grid' as const,
      grouping: 'collection' as const,
      sort: 'collection' as const,
      direction: 'ascending' as const,
      strings,
      columns: 9,
    };
    const stops = buildListModel({ ...input, paletteStyle: 'stops' });
    const blend = buildListModel({ ...input, paletteStyle: 'gradient' });
    expect([...stops.slots.values()].some((slot) => slot.blend)).toBe(false);
    expect([...blend.slots.values()].every((slot) => slot.blend)).toBe(true);
    // A weighted preset (Harbor 60/30/10): shares size the options and place the stops.
    const harbor = blend.units.find(
      (unit) => unit.kind === 'row' && unit.slots[0]!.setName === 'Harbor',
    );
    expect(harbor?.kind).toBe('row');
    const slots = harbor!.kind === 'row' ? harbor!.slots : [];
    expect(slots.map((slot) => slot.share)).toEqual([0.6, 0.3, 0.1]);
    expect(slots.map((slot) => slot.paint['--_tp-color-palette-blend-size'])).toEqual([
      '166.667% 100%',
      '333.333% 100%',
      '1000% 100%',
    ]);
    // Each option shows its own stretch: 0 to 60 %, 60 to 90 %, 90 to 100 % of the row.
    expect(slots.map((slot) => slot.paint['--_tp-color-palette-blend-x'])).toEqual([
      '0%',
      '85.714%',
      '100%',
    ]);
    expect(slots.map((slot) => slot.paint['--_tp-color-palette-blend-x-rtl'])).toEqual([
      '100%',
      '14.286%',
      '0%',
    ]);
  });

  it('blends a palette through its colors at the middle of their shares', () => {
    const [red, blue] = collection.swatches.map((swatch) => swatch.color);
    const { ltr, rtl } = blendPaint([red!, blue!], [0.75, 0.25]);
    expect(ltr.startsWith('linear-gradient(to right, ')).toBe(true);
    expect(rtl.startsWith('linear-gradient(to left, ')).toBe(true);
    // Flat up to the first center, blended between centers, flat after the last.
    expect(ltr).toContain(' 0%,');
    expect(ltr).toContain(' 37.5%');
    expect(ltr).toContain(' 87.5%');
    expect(ltr.endsWith(' 100%)')).toBe(true);
  });
});
