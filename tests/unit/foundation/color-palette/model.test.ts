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
    for (const collection of [defaultColorCollection, reducedColorCollection, cssNamedColors])
      expect(resolveColorCollection(collection).issues).toEqual([]);
    expect(reducedColorCollection.colors).toHaveLength(24);
    expect(cssNamedColors.colors).toHaveLength(148);
  });
  it('normalizes palette weights to one', () => {
    for (const set of resolveColorCollection(defaultColorCollection).palettes)
      if (set.weights)
        expect(set.weights.reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1, 10);
  });
});
