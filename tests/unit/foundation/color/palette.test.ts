import { describe, expect, it } from 'vitest';
import { hueFamily, sortByColor } from '../../../../src/foundation/color/palette.js';
import { parseColor } from '../../../../src/foundation/color/parse.js';
import type { ColorValue } from '../../../../src/foundation/color/types.js';

const c = (text: string): ColorValue => parseColor(text)!;

describe('hueFamily', () => {
  it('bins chromatic colors by OKLCH hue and grays as neutral', () => {
    const families = [
      'red',
      'darkorange',
      'yellow',
      'lime',
      'darkturquoise',
      'blue',
      'purple',
      'hotpink',
    ].map((name) => hueFamily(c(name)));
    expect(families).toEqual([
      'red',
      'orange',
      'yellow',
      'green',
      'teal',
      'blue',
      'purple',
      'pink',
    ]);
    expect(hueFamily(c('gray'))).toBe('neutral');
    expect(hueFamily(c('white'))).toBe('neutral');
  });
});

describe('sortByColor', () => {
  const colors = ['#ffffff', '#000000', '#808080', '#808080'];
  it('orders by lightness in either direction, keeping ties in order', () => {
    const items = colors.map((text, index) => ({ text, index }));
    const up = sortByColor(items, (item) => c(item.text), 'lightness');
    expect(up.map((item) => item.index)).toEqual([1, 2, 3, 0]);
    const down = sortByColor(items, (item) => c(item.text), 'lightness', 'descending');
    expect(down.map((item) => item.index)).toEqual([0, 2, 3, 1]);
  });
  it('puts neutrals last under hue', () => {
    const sorted = sortByColor(['gray', 'blue', 'red'], c, 'hue');
    expect(sorted).toEqual(['red', 'blue', 'gray']);
    expect(sortByColor(['gray', 'blue', 'red'], c, 'hue', 'descending')).toEqual([
      'blue',
      'red',
      'gray',
    ]);
  });
  it('orders by chroma', () => {
    expect(sortByColor(['red', 'gray', '#c08080'], c, 'chroma')).toEqual([
      'gray',
      '#c08080',
      'red',
    ]);
  });
});
