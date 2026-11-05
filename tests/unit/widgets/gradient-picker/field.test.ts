import { describe, expect, it } from 'vitest';
import { convertColor } from '../../../../src/foundation/color/convert.js';
import { parseColor } from '../../../../src/foundation/color/parse.js';
import type { ColorValue } from '../../../../src/foundation/color/types.js';
import {
  createFieldGradientSampler,
  insertFieldAnchor,
  moveFieldAnchor,
  normalizeFieldAnchors,
  removeFieldAnchor,
  renderFieldGradient,
  sampleFieldGradient,
  type FieldGradientAnchor,
} from '../../../../src/widgets/gradient-picker/field.js';

const rgb = (value: ColorValue): number[] =>
  convertColor(value, 'srgb').coords.map((channel) => Math.round(channel * 255));

const pair: readonly FieldGradientAnchor[] = [
  { x: 0.25, y: 0.5, color: '#ff0000' },
  { x: 0.75, y: 0.5, color: '#0000ff' },
];
const still = { warpAmplitude: 0, interpolation: 'srgb' } as const;

describe('field gradient model', () => {
  it('clamps coordinates, centers missing ones and keeps the order', () => {
    expect(
      normalizeFieldAnchors([
        { x: 2, y: -1, color: 'red' },
        { x: Number.NaN, y: 0.3, color: 'blue' },
      ]),
    ).toEqual([
      { x: 1, y: 0, color: 'red' },
      { x: 0.5, y: 0.3, color: 'blue' },
    ]);
    expect(normalizeFieldAnchors(undefined)).toEqual([]);
  });

  it('is an anchor’s own color at the anchor', () => {
    for (const projection of ['equirectangular', 'plane'] as const) {
      expect(rgb(sampleFieldGradient(pair, 0.25, 0.5, { ...still, projection }))).toEqual([
        255, 0, 0,
      ]);
      expect(rgb(sampleFieldGradient(pair, 0.75, 0.5, { ...still, projection }))).toEqual([
        0, 0, 255,
      ]);
    }
  });

  it('mixes two anchors evenly halfway between them', () => {
    const [r, , b] = rgb(sampleFieldGradient(pair, 0.5, 0.5, { ...still, projection: 'plane' }));
    expect(r).toBe(b);
  });

  it('wraps around the sphere, where a point is as near an anchor across the edge', () => {
    const anchors = [
      { x: 0.1, y: 0.5, color: '#ff0000' },
      { x: 0.6, y: 0.5, color: '#0000ff' },
    ];
    // 0.85 is 0.25 from both anchors around the sphere, but nearer the blue one on a plane.
    const sphere = rgb(sampleFieldGradient(anchors, 0.85, 0.5, still));
    const plane = rgb(sampleFieldGradient(anchors, 0.85, 0.5, { ...still, projection: 'plane' }));
    expect(Math.abs(sphere[0]! - sphere[2]!)).toBeLessThanOrEqual(1);
    expect(plane[2]).toBeGreaterThan(plane[0]!);
  });

  it('keeps colors closer to their anchors as the power rises', () => {
    const near = (power: number) =>
      rgb(sampleFieldGradient(pair, 0.35, 0.5, { ...still, projection: 'plane', power }))[0]!;
    expect(near(4)).toBeGreaterThan(near(1));
    const bell = (power: number) =>
      rgb(
        sampleFieldGradient(pair, 0.35, 0.5, {
          ...still,
          projection: 'plane',
          falloff: 'gaussian',
          power,
        }),
      )[0]!;
    expect(bell(4)).toBeGreaterThanOrEqual(bell(1));
  });

  it('bends the field with the domain warp', () => {
    const at = (warpAmplitude: number) =>
      rgb(sampleFieldGradient(pair, 0.5, 0.3, { interpolation: 'srgb', warpAmplitude }));
    expect(at(0.6)).not.toEqual(at(0));
  });

  it('blends alpha and reads an unparsable color as transparent', () => {
    const sample = createFieldGradientSampler(
      [
        { x: 0.25, y: 0.5, color: 'rgb(255 0 0 / 0)' },
        { x: 0.75, y: 0.5, color: 'not a color' },
      ],
      still,
    );
    expect(sample(0.5, 0.5)[3]).toBe(0);
  });

  it('renders rows from the top into a reusable RGBA buffer', () => {
    const pixels = renderFieldGradient(
      [
        { x: 0.5, y: 0, color: '#ffffff' },
        { x: 0.5, y: 1, color: '#000000' },
      ],
      2,
      4,
      { ...still, projection: 'plane' },
    );
    expect(pixels).toHaveLength(2 * 4 * 4);
    expect(pixels[0]).toBeGreaterThan(pixels[3 * 2 * 4]!);
    expect(pixels[3]).toBe(255);
    const reused = new Uint8ClampedArray(64);
    expect(renderFieldGradient(pair, 2, 2, still, reused)).toBe(reused);
  });

  it('adds an anchor last, in the field color there, as hex', () => {
    const added = insertFieldAnchor(pair, 0.25, 0.5, still);
    expect(added.index).toBe(2);
    expect(added.anchors[2]).toEqual({ x: 0.25, y: 0.5, color: '#ff0000' });
    expect(insertFieldAnchor([], 0.5, 0.5).anchors[0]!.color).toBe('#ffffff');
  });

  it('moves an anchor within the field and removes down to the minimum', () => {
    expect(moveFieldAnchor(pair, 1, 1.5, 0.2)[1]).toEqual({ x: 1, y: 0.2, color: '#0000ff' });
    expect(removeFieldAnchor(pair, 0)).toEqual([pair[1]]);
    expect(removeFieldAnchor([pair[0]!], 0)).toBeNull();
    expect(removeFieldAnchor([pair[0]!], 0, 0)).toEqual([]);
  });

  it('parses any CSS color notation for an anchor', () => {
    const sample = sampleFieldGradient(
      [{ x: 0.5, y: 0.5, color: 'oklch(0.7 0.15 150)' }],
      0.1,
      0.9,
      still,
    );
    expect(rgb(sample)).toEqual(rgb(parseColor('oklch(0.7 0.15 150)')!));
  });
});
