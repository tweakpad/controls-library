import { describe, expect, it } from 'vitest';
import {
  defaultColorCollection,
  resolveColorCollection,
} from '../../../../src/foundation/color-palette/index.js';
import {
  blendPaint,
  buildListModel,
  selectedKey,
  sameFavorite,
  sanitizeFavorites,
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
    favorites: [],
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
      favorites: [],
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
      favorites: [],
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
      favorites: [],
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

  it('lists favorites in sections of colors, palettes and gradients', () => {
    const favorites = [
      { kind: 'color', value: '#3a89fa' },
      { kind: 'gradient', name: 'Sunrise', colors: ['#ff0000', '#ffa500', '#ffff00'] },
      { kind: 'color', value: '#123456', name: 'Ink' },
      { kind: 'palette', colors: ['#ff0000', '#0000ff'], weights: [3, 1] },
      { kind: 'color', value: 'not a color' },
    ] as const;
    const model = buildListModel({
      collection: resolveColorCollection(defaultColorCollection),
      mode: 'favorites',
      layout: 'grid',
      paletteStyle: 'stops',
      grouping: 'collection',
      sort: 'collection',
      direction: 'ascending',
      strings,
      columns: 9,
      favorites,
    });
    // Section headings for palettes and gradients, then one group named after each of them.
    expect(model.groups.map((group) => [group.label, group.name, !!group.section])).toEqual([
      ['Colors', 'Colors', true],
      ['Palettes', undefined, true],
      ['Palette 1', 'Palette 1', false],
      ['Gradients', undefined, true],
      ['Sunrise', 'Sunrise', false],
    ]);
    const slots = [...model.slots.values()];
    // A collection color keeps its collection name; an unknown one keeps the given name.
    expect(slots.filter((slot) => !slot.set).map((slot) => slot.swatch.name)).toEqual([
      'Blue 500',
      'Ink',
    ]);
    // Every option points back to the favorite it belongs to, for removal.
    expect(slots.map((slot) => slot.favorite)).toEqual([0, 2, 3, 3, 1, 1, 1]);
    // Weights become shares of their sum, as a collection's palette weights do.
    const palette = model.units.find((unit) => unit.kind === 'row' && unit.palette);
    expect(palette?.kind === 'row' && palette.slots.map((slot) => slot.share)).toEqual([
      0.75, 0.25,
    ]);
    expect(slots.filter((slot) => slot.blend)).toHaveLength(3);
  });

  it('shows no sections without favorites', () => {
    const model = buildListModel({
      collection,
      mode: 'favorites',
      layout: 'grid',
      paletteStyle: 'stops',
      grouping: 'none',
      sort: 'collection',
      direction: 'ascending',
      strings,
      columns: 9,
      favorites: [],
    });
    expect(model.units).toHaveLength(0);
  });

  it('reads back only well-formed favorites and compares them by color', () => {
    expect(
      sanitizeFavorites([
        { kind: 'color', value: '#fff', name: '' },
        { kind: 'palette', colors: ['#fff'] },
        { kind: 'gradient', colors: Array.from({ length: 14 }, () => '#000'), weights: [1] },
        { kind: 'other' },
        'x',
      ]),
    ).toEqual([
      { kind: 'color', value: '#fff' },
      { kind: 'gradient', colors: Array.from({ length: 12 }, () => '#000') },
    ]);
    expect(sanitizeFavorites('nope')).toEqual([]);
    expect(sameFavorite({ kind: 'color', value: '#FFF' }, { kind: 'color', value: 'white' })).toBe(
      true,
    );
    expect(
      sameFavorite(
        { kind: 'palette', colors: ['#fff', '#000'] },
        { kind: 'gradient', colors: ['#fff', '#000'] },
      ),
    ).toBe(false);
  });

  it('marks a palette color only when it was picked from that palette', () => {
    const input = {
      collection: resolveColorCollection(defaultColorCollection),
      layout: 'grid' as const,
      paletteStyle: 'stops' as const,
      grouping: 'collection' as const,
      sort: 'collection' as const,
      direction: 'ascending' as const,
      strings,
      columns: 9,
      favorites: [{ kind: 'color', value: '#00a392' }] as const,
    };
    const identity = (value: string) =>
      resolveColorCollection(defaultColorCollection).swatches.find(
        (swatch) => swatch.value === value,
      )?.identity;
    const palettes = buildListModel({ ...input, mode: 'palettes' });
    // Teal 500 is in Lagoon and Harbor, but the value alone selects no palette color.
    expect(selectedKey(palettes, '#00a392', undefined, identity)).toBeUndefined();
    const lagoonTeal = palettes.keys.find(
      (key) =>
        palettes.slots.get(key)!.setName === 'Lagoon' &&
        palettes.slots.get(key)!.swatch.value === '#00a392',
    )!;
    expect(selectedKey(palettes, '#00a392', lagoonTeal, identity)).toBe(lagoonTeal);
    // Plain colors still follow the value: the grid and the favorite colors.
    const colors = buildListModel({ ...input, mode: 'colors' });
    expect(
      colors.slots.get(selectedKey(colors, '#00a392', lagoonTeal, identity)!)!.swatch.name,
    ).toBe('Teal 500');
    const favorites = buildListModel({ ...input, mode: 'favorites' });
    expect(selectedKey(favorites, '#00a392', undefined, identity)).toBe('f0');
  });
});
