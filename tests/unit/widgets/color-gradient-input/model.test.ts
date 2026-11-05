import { describe, expect, it } from 'vitest';
import { convertColor } from '../../../../src/foundation/color/convert.js';
import { parseColor } from '../../../../src/foundation/color/parse.js';
import type { ColorValue } from '../../../../src/foundation/color/types.js';
import {
  colorGradientTrackPaint,
  insertColorGradientStop,
  midpointWeight,
  moveColorGradientMidpoint,
  moveColorGradientStop,
  normalizeColorGradientStops,
  removeColorGradientStop,
  sameColorGradientStops,
  sampleColorGradient,
  type ColorGradientStop,
} from '../../../../src/widgets/color-gradient-input/model.js';

const stops: readonly ColorGradientStop[] = [
  { position: 0, color: '#000000' },
  { position: 0.5, color: '#ffffff' },
  { position: 1, color: '#ff0000' },
];

const rgb = (value: ColorValue): number[] =>
  convertColor(value, 'srgb').coords.map((channel) => Math.round(channel * 255));

describe('color gradient model', () => {
  it('sorts stops, clamps positions and midpoints, and drops an even midpoint', () => {
    expect(
      normalizeColorGradientStops([
        { position: 1.4, color: 'red' },
        { position: -1, color: 'blue', midpoint: 0.5 },
        { position: 0.3, color: 'lime', midpoint: 2 },
      ]),
    ).toEqual([
      { position: 0, color: 'blue' },
      { position: 0.3, color: 'lime', midpoint: 0.95 },
      { position: 1, color: 'red' },
    ]);
    expect(normalizeColorGradientStops(null)).toEqual([]);
  });

  it('keeps the given order of stops at one position', () => {
    const list = normalizeColorGradientStops([
      { position: 0.5, color: 'a' },
      { position: 0.5, color: 'b' },
    ]);
    expect(list.map((stop) => stop.color)).toEqual(['a', 'b']);
  });

  it('compares stops by position, color and midpoint', () => {
    expect(sameColorGradientStops(stops, normalizeColorGradientStops(stops))).toBe(true);
    expect(sameColorGradientStops(stops, moveColorGradientMidpoint(stops, 0, 0.3))).toBe(false);
  });

  it('eases a span through its midpoint, half and half at the midpoint', () => {
    expect(midpointWeight(0.5)).toBe(0.5);
    expect(midpointWeight(0.2, 0.2)).toBeCloseTo(0.5, 10);
    expect(midpointWeight(0.8, 0.8)).toBeCloseTo(0.5, 10);
    expect(midpointWeight(0, 0.3)).toBe(0);
    expect(midpointWeight(1, 0.3)).toBe(1);
  });

  it('samples stop colors at stops and beyond the ends', () => {
    expect(rgb(sampleColorGradient(stops, 0))).toEqual([0, 0, 0]);
    expect(rgb(sampleColorGradient(stops, 0.5))).toEqual([255, 255, 255]);
    expect(rgb(sampleColorGradient(stops, 1))).toEqual([255, 0, 0]);
    const inset = [
      { position: 0.2, color: '#000000' },
      { position: 0.8, color: '#ffffff' },
    ];
    expect(rgb(sampleColorGradient(inset, 0))).toEqual([0, 0, 0]);
    expect(rgb(sampleColorGradient(inset, 1))).toEqual([255, 255, 255]);
    expect(sampleColorGradient([], 0.5).alpha).toBe(0);
  });

  it('mixes in sRGB or OKLab, and a moved midpoint reaches the even mix there', () => {
    const pair = [
      { position: 0, color: '#000000' },
      { position: 1, color: '#ffffff' },
    ];
    expect(rgb(sampleColorGradient(pair, 0.5, 'srgb'))).toEqual([128, 128, 128]);
    // OKLab mixes by perceived lightness: its half point (L 0.5) is darker than sRGB's.
    expect(rgb(sampleColorGradient(pair, 0.5, 'oklab'))).toEqual([99, 99, 99]);
    const eased = moveColorGradientMidpoint(pair, 0, 0.25);
    expect(rgb(sampleColorGradient(eased, 0.25, 'srgb'))).toEqual([128, 128, 128]);
  });

  it('reads a color that does not parse as transparent', () => {
    expect(sampleColorGradient([{ position: 0, color: 'not a color' }], 0).alpha).toBe(0);
  });

  it('adds a stop in the gradient color there', () => {
    const added = insertColorGradientStop(stops, 0.25, 'srgb');
    expect(added.index).toBe(1);
    expect(added.stops).toHaveLength(4);
    expect(rgb(parseColor(added.stops[1]!.color)!)).toEqual(
      rgb(sampleColorGradient(stops, 0.25, 'srgb')),
    );
    expect(added.stops[1]!.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(insertColorGradientStop(stops, 1).index).toBe(3);
  });

  it('moves a stop past its neighbors, keeping its color and midpoint', () => {
    const list = moveColorGradientMidpoint(stops, 0, 0.3);
    const moved = moveColorGradientStop(list, 0, 0.75);
    expect(moved.index).toBe(1);
    expect(moved.stops[1]).toEqual({ position: 0.75, color: '#000000', midpoint: 0.3 });
    expect(moved.stops.map((stop) => stop.position)).toEqual([0.5, 0.75, 1]);
  });

  it('keeps a stop on its side of a neighbor at the same position', () => {
    expect(moveColorGradientStop(stops, 1, 1).index).toBe(1);
    expect(moveColorGradientStop(stops, 1, 0).index).toBe(1);
    expect(moveColorGradientStop(stops, 0, 0.5).index).toBe(0);
  });

  it('clamps midpoints between 5 % and 95 % and ignores the last stop', () => {
    expect(moveColorGradientMidpoint(stops, 0, 0)[0]!.midpoint).toBe(0.05);
    expect(moveColorGradientMidpoint(stops, 1, 1)[1]!.midpoint).toBe(0.95);
    expect(moveColorGradientMidpoint(stops, 2, 0.2)).toEqual(normalizeColorGradientStops(stops));
  });

  it('removes a stop unless that leaves fewer than the minimum', () => {
    expect(removeColorGradientStop(stops, 1)!.map((stop) => stop.color)).toEqual([
      '#000000',
      '#ff0000',
    ]);
    expect(removeColorGradientStop(stops.slice(0, 2), 0)).toBeNull();
    expect(removeColorGradientStop(stops.slice(0, 2), 0, 1)).toHaveLength(1);
    expect(removeColorGradientStop(stops, 5)).toBeNull();
  });

  it('paints the track along the writing direction from the sampled model', () => {
    const paint = colorGradientTrackPaint(stops, 'oklab', 4);
    expect(
      paint.startsWith('linear-gradient(var(--_tp-color-gradient-input-axis, to right),'),
    ).toBe(true);
    expect(paint.match(/%/g)).toHaveLength(5);
    expect(colorGradientTrackPaint([])).toBe('none');
  });
});
