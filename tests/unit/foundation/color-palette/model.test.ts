import { describe, expect, it } from 'vitest';
import {
  defaultColorCollection,
  findSwatch,
  MAX_PALETTE_STOPS,
  groupSwatches,
  parseColorCollection,
  reducedColorCollection,
  resolveColorCollection,
  type ColorCollection,
} from '../../../../src/foundation/color-palette/index.js';
import cssNamedColors from '../../../../src/foundation/color-palette/collections/css-named/index.js';
import risoInks from '../../../../src/foundation/color-palette/collections/riso/index.js';
import colorBrewer from '../../../../src/foundation/color-palette/collections/colorbrewer/index.js';
import nipponColors from '../../../../src/foundation/color-palette/collections/nippon/index.js';
import sanzoWada from '../../../../src/foundation/color-palette/collections/sanzo-wada/index.js';
import wesAnderson from '../../../../src/foundation/color-palette/collections/wes-anderson/index.js';
import leCorbusier from '../../../../src/foundation/color-palette/collections/le-corbusier/index.js';
import wernerColors from '../../../../src/foundation/color-palette/collections/werner/index.js';
import lospecPalettes from '../../../../src/foundation/color-palette/collections/lospec/index.js';
import niceColorPalettes from '../../../../src/foundation/color-palette/collections/nice-color-palettes/index.js';

const sample: ColorCollection = {
  id: 'sample',
  groups: [
    { id: 'warm', name: 'Warm' },
    { id: 'cool', name: 'Cool' },
  ],
  colors: [
    { value: '#ff0000', name: 'Red', group: 'warm' },
    { value: '#0000ff', name: 'Blue', group: 'cool' },
    { value: '#ffa500', name: 'Orange', group: 'warm' },
    '#808080',
    { value: 'not a color', name: 'Broken' },
    { value: '#00ff00', group: 'missing' },
  ],
  palettes: [
    { name: 'Fire', colors: ['#ff0000', '#ffa500'] },
    { name: 'Single', colors: ['#ff0000'] },
    { name: 'Pair', colors: ['#ff0000', '#0000ff'], weights: [3, 1] },
    { name: 'Uneven', colors: ['#ff0000', '#0000ff'], weights: [1] },
    {
      name: 'Long',
      colors: Array.from({ length: 14 }, (_, index) => `hsl(${index * 20} 80% 50%)`),
    },
  ],
};

describe('parseColorCollection', () => {
  it('keeps well-formed entries and lists dropped ones', () => {
    const { collection, issues } = parseColorCollection({
      id: 'json',
      name: 'From JSON',
      description: 'Inks of the spring run.',
      attribution: { name: 'Studio', url: 'https://example.com', extra: 1 },
      groups: [{ id: 'a', name: 'A' }, { name: 'no id' }],
      colors: ['#fff', { value: '#000', name: 'Black', group: 'a' }, 42],
      palettes: [
        { colors: ['#fff', '#000'] },
        'bad',
        { colors: ['#fff', '#000'], weights: [2, 'x'] },
      ],
    });
    expect(collection.colors).toEqual(['#fff', { value: '#000', name: 'Black', group: 'a' }]);
    expect(collection.groups).toEqual([{ id: 'a', name: 'A' }]);
    expect(collection.attribution).toEqual({ name: 'Studio', url: 'https://example.com' });
    expect(collection.description).toBe('Inks of the spring run.');
    expect(resolveColorCollection(collection).description).toBe('Inks of the spring run.');
    expect(collection.palettes).toEqual([
      { colors: ['#fff', '#000'] },
      { colors: ['#fff', '#000'] },
    ]);
    expect(issues.map((issue) => issue.code)).toEqual([
      'color-palette-color',
      'color-palette-group',
      'color-palette-palette',
    ]);
  });
  it('keeps several sources, each with its own link and license', () => {
    const { collection } = parseColorCollection({
      id: 'sources',
      colors: ['#fff'],
      attribution: [
        { name: 'Inks', url: 'https://example.com/inks', license: 'CC BY 4.0' },
        { name: 'Sets', url: 'https://example.com/sets', extra: 1 },
        'not a source',
        {},
      ],
    });
    expect(collection.attribution).toEqual([
      { name: 'Inks', url: 'https://example.com/inks', license: 'CC BY 4.0' },
      { name: 'Sets', url: 'https://example.com/sets' },
    ]);
  });

  it('rejects a document without an id or colors', () => {
    expect(() => parseColorCollection({ colors: [] })).toThrow(TypeError);
    expect(() => parseColorCollection({ id: 'x' })).toThrow(TypeError);
    expect(() => parseColorCollection('x')).toThrow(TypeError);
  });
});

describe('resolveColorCollection', () => {
  const resolved = resolveColorCollection(sample);
  it('parses colors, drops unknown groups and short presets', () => {
    expect(resolved.swatches.map((swatch) => swatch.name ?? swatch.value)).toEqual([
      'Red',
      'Blue',
      'Orange',
      '#808080',
      '#00ff00',
    ]);
    expect(resolved.swatches[4]!.group).toBeUndefined();
    expect(resolved.palettes.map((set) => set.name)).toEqual(['Fire', 'Pair', 'Uneven', 'Long']);
    expect(resolved.issues.map((issue) => issue.code)).toEqual([
      'color-palette-color',
      'color-palette-group',
      'color-palette-palette',
      'color-palette-palette',
    ]);
  });
  it('gives palettes the collection swatches and normalized weights, equal when absent', () => {
    const [fire, pair, uneven] = resolved.palettes;
    expect(fire!.swatches.map((swatch) => swatch.name)).toEqual(['Red', 'Orange']);
    expect(fire!.weights).toBeUndefined();
    expect(pair!.weights).toEqual([0.75, 0.25]);
    // Weights that do not match the colors one to one are ignored.
    expect(uneven!.weights).toBeUndefined();
  });
  it('keeps at most twelve colors of a palette and reports the rest', () => {
    const long = resolved.palettes.find((set) => set.name === 'Long')!;
    expect(MAX_PALETTE_STOPS).toBe(12);
    expect(long.swatches).toHaveLength(12);
    expect(resolved.issues.at(-1)!.message).toContain('more than 12 colors');
  });
  it('is cached per document', () => {
    expect(resolveColorCollection(sample)).toBe(resolved);
  });
});

describe('groupSwatches', () => {
  const resolved = resolveColorCollection(sample);
  it('groups by the collection groups with ungrouped colors last', () => {
    const groups = groupSwatches(resolved, 'collection');
    expect(groups.map((group) => group.name ?? (group.ungrouped ? 'other' : ''))).toEqual([
      'Warm',
      'Cool',
      'other',
    ]);
    expect(groups[0]!.swatches.map((swatch) => swatch.name)).toEqual(['Red', 'Orange']);
  });
  it('groups by hue family in hue order', () => {
    expect(groupSwatches(resolved, 'hue').map((group) => group.family)).toEqual([
      'red',
      'orange',
      'green',
      'blue',
      'neutral',
    ]);
  });
  it('sorts inside groups and lists one flat group', () => {
    const [flat] = groupSwatches(resolved, 'none', 'lightness', 'descending');
    expect(flat!.swatches[0]!.value).toBe('#00ff00');
    expect(groupSwatches(resolved, 'none', 'collection', 'descending')[0]!.swatches[0]!.value).toBe(
      '#00ff00',
    );
  });
});

describe('findSwatch', () => {
  const resolved = resolveColorCollection(defaultColorCollection);
  it('finds a swatch by color identity', () => {
    expect(findSwatch(resolved, '#3A89FA')!.name).toBe('Blue 500');
    expect(findSwatch(resolved, 'rebeccapurple')).toBeUndefined();
  });
});

describe('collections', () => {
  it('resolve without issues', () => {
    for (const collection of [
      defaultColorCollection,
      reducedColorCollection,
      cssNamedColors,
      risoInks,
      colorBrewer,
      nipponColors,
      sanzoWada,
      wesAnderson,
      leCorbusier,
      wernerColors,
      lospecPalettes,
      niceColorPalettes,
    ])
      expect(resolveColorCollection(collection).issues).toEqual([]);
    expect(reducedColorCollection.colors).toHaveLength(24);
    expect(cssNamedColors.colors).toHaveLength(148);
  });
  it('numbers the nice-color-palettes palettes by their place in the package', () => {
    const nice = resolveColorCollection(niceColorPalettes);
    expect([nice.swatches.length, nice.palettes.length]).toEqual([200, 40]);
    expect(nice.palettes.map((palette) => palette.name).slice(0, 2)).toEqual([
      'Palette 1',
      'Palette 2',
    ]);
    expect(nice.palettes.every((palette) => palette.swatches.length === 5)).toBe(true);
  });
  it('lists the Lospec palettes named with their authors and the colors they use', () => {
    const lospec = resolveColorCollection(lospecPalettes);
    expect([lospec.swatches.length, lospec.palettes.length]).toEqual([236, 40]);
    expect(lospec.palettes[0]?.name).toBe('SLSO8 by Luis Miguel Maldonado');
    expect(
      lospec.palettes.every((palette) => palette.swatches.every((swatch) => swatch.index >= 0)),
    ).toBe(true);
  });
  it('names the Werner colors after the book, first letter capitalized, with no palettes', () => {
    const werner = resolveColorCollection(wernerColors);
    expect([werner.swatches.length, werner.palettes.length]).toEqual([110, 0]);
    expect(werner.swatches.find((swatch) => swatch.identity === '#f1e9ce')?.name).toBe(
      'Snow white',
    );
    for (const swatch of werner.swatches) expect(swatch.name).toMatch(/^[A-Z][^A-Z]*$/);
  });
  it('lists the Le Corbusier colors with the keyboard selections, named by keyboard', () => {
    const corbusier = resolveColorCollection(leCorbusier);
    expect([corbusier.swatches.length, corbusier.palettes.length]).toEqual([63, 886]);
    expect(corbusier.palettes[0]?.name).toBe('Espace I A, 1');
    expect(new Set(corbusier.palettes.map((palette) => palette.name)).size).toBe(886);
  });
  it('lists the wesanderson discrete palettes with the colors they use', () => {
    const wes = resolveColorCollection(wesAnderson);
    expect([wes.swatches.length, wes.palettes.length]).toEqual([107, 22]);
    expect(wes.palettes.map((palette) => palette.name)).not.toContain('Zissou1Continuous');
  });
  it('lists the Sanzo Wada colors by name with every numbered combination', () => {
    const wada = resolveColorCollection(sanzoWada);
    expect([wada.swatches.length, wada.palettes.length]).toEqual([159, 348]);
    expect(wada.swatches.every((swatch) => !!swatch.name)).toBe(true);
    expect(Math.min(...wada.palettes.map((palette) => palette.swatches.length))).toBe(2);
  });
  it('names the Nippon colors after their slugs, first letter capitalized', () => {
    const nippon = resolveColorCollection(nipponColors);
    expect(nippon.swatches).toHaveLength(250);
    expect(nippon.swatches.find((swatch) => swatch.identity === '#dc9fb4')?.name).toBe('Nadeshiko');
    for (const swatch of nippon.swatches) expect(swatch.name).toMatch(/^[A-Z][a-z0-9]*$/);
  });
  it('lists the ColorBrewer colors once each, with every scheme size as a palette', () => {
    const brewer = resolveColorCollection(colorBrewer);
    expect([brewer.swatches.length, brewer.palettes.length]).toEqual([378, 264]);
    const identities = new Set(brewer.swatches.map((swatch) => swatch.identity));
    expect(identities.size).toBe(brewer.swatches.length);
    for (const palette of brewer.palettes)
      for (const swatch of palette.swatches) expect(identities.has(swatch.identity)).toBe(true);
  });
  it('lists the riso inks with their club palettes, every palette color an ink', () => {
    const inks = resolveColorCollection(risoInks);
    expect([inks.swatches.length, inks.palettes.length]).toEqual([79, 92]);
    const identities = new Set(inks.swatches.map((swatch) => swatch.identity));
    // Inks that share a value are one color.
    expect(identities.size).toBe(inks.swatches.length);
    for (const palette of inks.palettes) {
      expect(palette.swatches.length).toBeGreaterThanOrEqual(3);
      for (const swatch of palette.swatches) expect(identities.has(swatch.identity)).toBe(true);
    }
    // Every ink belongs to a declared group.
    const groups = new Set(risoInks.groups!.map((group) => group.id));
    for (const ink of inks.swatches) expect(groups.has(ink.group!)).toBe(true);
  });
  it('normalizes palette weights to one', () => {
    for (const set of resolveColorCollection(defaultColorCollection).palettes)
      if (set.weights)
        expect(set.weights.reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1, 10);
  });
});
