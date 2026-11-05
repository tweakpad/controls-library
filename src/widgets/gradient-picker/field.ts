import { convertColor } from '../../foundation/color/convert.js';
import { parseColor } from '../../foundation/color/parse.js';
import { serializeColor } from '../../foundation/color/serialize.js';
import { color, type ColorValue } from '../../foundation/color/types.js';
import type { GradientInterpolation } from './linear.js';

/**
 * One color anchor of a field gradient: a color placed anywhere on the field. Every point of the
 * field blends all anchors, each weighted by how close it is.
 */
export interface FieldGradientAnchor {
  /** Horizontal place on the field, from 0 (start) to 1 (end). */
  readonly x: number;
  /** Vertical place on the field, from 0 (top) to 1 (bottom). */
  readonly y: number;
  /** The anchor's color, in any CSS Color 4 notation. */
  readonly color: string;
}

/**
 * How an anchor's weight falls off with distance: `inverse-distance` divides by the distance
 * raised to `power`; `gaussian` is a bell whose width narrows as `power` grows.
 */
export type FieldGradientFalloff = 'inverse-distance' | 'gaussian';

/**
 * How field coordinates map to distances: `equirectangular` reads x as longitude and y as latitude
 * of a sphere, so the field wraps at its left and right edges, as an environment map does;
 * `plane` measures straight across a flat field.
 */
export type FieldGradientProjection = 'equirectangular' | 'plane';

export interface FieldGradientOptions {
  readonly falloff?: FieldGradientFalloff;
  /** The falloff's power, from 0.4 to 6. */
  readonly power?: number;
  /** How far the domain warp bends the field, from 0 (none) to 0.6. */
  readonly warpAmplitude?: number;
  /** How many waves the domain warp lays across the field, from 0.3 to 4. */
  readonly warpFrequency?: number;
  readonly projection?: FieldGradientProjection;
  /** The color space the anchors blend in. */
  readonly interpolation?: GradientInterpolation;
}

export const FIELD_GRADIENT_DEFAULTS: Required<FieldGradientOptions> = {
  falloff: 'inverse-distance',
  power: 2.2,
  warpAmplitude: 0.12,
  warpFrequency: 1.2,
  projection: 'equirectangular',
  interpolation: 'oklab',
};

export const FIELD_POWER_MIN = 0.4;
export const FIELD_POWER_MAX = 6;
export const FIELD_WARP_AMPLITUDE_MAX = 0.6;
export const FIELD_WARP_FREQUENCY_MIN = 0.3;
export const FIELD_WARP_FREQUENCY_MAX = 4;

type Vector = [number, number, number];
/** An RGBA color in sRGB, each channel 0–1. */
export type FieldGradientRgba = [number, number, number, number];

const TWO_PI = Math.PI * 2;
const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const finite = (value: number | undefined, fallback: number): number =>
  value !== undefined && Number.isFinite(value) ? value : fallback;
const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/** The anchors with coordinates in range; their order is kept. */
export function normalizeFieldAnchors(
  anchors: readonly FieldGradientAnchor[] | null | undefined,
): readonly FieldGradientAnchor[] {
  if (!Array.isArray(anchors)) return [];
  return anchors
    .filter((anchor): anchor is FieldGradientAnchor => !!anchor && typeof anchor === 'object')
    .map((anchor) => ({
      x: round(clamp(finite(anchor.x, 0.5))),
      y: round(clamp(finite(anchor.y, 0.5))),
      color: String(anchor.color ?? ''),
    }));
}

function resolve(options: FieldGradientOptions = {}): Required<FieldGradientOptions> {
  return {
    falloff: options.falloff === 'gaussian' ? 'gaussian' : 'inverse-distance',
    power: clamp(
      finite(options.power, FIELD_GRADIENT_DEFAULTS.power),
      FIELD_POWER_MIN,
      FIELD_POWER_MAX,
    ),
    warpAmplitude: clamp(
      finite(options.warpAmplitude, FIELD_GRADIENT_DEFAULTS.warpAmplitude),
      0,
      FIELD_WARP_AMPLITUDE_MAX,
    ),
    warpFrequency: clamp(
      finite(options.warpFrequency, FIELD_GRADIENT_DEFAULTS.warpFrequency),
      FIELD_WARP_FREQUENCY_MIN,
      FIELD_WARP_FREQUENCY_MAX,
    ),
    projection: options.projection === 'plane' ? 'plane' : 'equirectangular',
    interpolation: options.interpolation === 'srgb' ? 'srgb' : 'oklab',
  };
}

/** The direction from the sphere's center toward an equirectangular point. */
function sphereDirection(x: number, y: number): Vector {
  const longitude = (clamp(x) - 0.5) * TWO_PI;
  const latitude = (0.5 - clamp(y)) * Math.PI;
  const cosine = Math.cos(latitude);
  return [cosine * Math.cos(longitude), Math.sin(latitude), cosine * Math.sin(longitude)];
}

function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  return length <= 0 ? [0, 1, 0] : [vector[0] / length, vector[1] / length, vector[2] / length];
}

/** Bends a point by a smooth periodic offset, so the anchors' regions take wavy borders. */
function warp(point: Vector, amplitude: number, frequency: number, sphere: boolean): Vector {
  if (amplitude <= 0) return point;
  const f = Math.max(0.0001, frequency);
  const offset: Vector = [
    Math.sin((point[1] * f + 0.23) * TWO_PI) * Math.cos((point[2] * f + 0.41) * TWO_PI),
    Math.cos((point[2] * f + 0.17) * TWO_PI) * Math.sin((point[0] * f + 0.37) * TWO_PI),
    Math.sin((point[0] * f - 0.31) * TWO_PI) * Math.cos((point[1] * f + 0.29) * TWO_PI),
  ];
  if (sphere)
    return normalize([
      point[0] + offset[0] * amplitude,
      point[1] + offset[1] * amplitude,
      point[2] + offset[2] * amplitude,
    ]);
  // A flat field is about π radians tall on the sphere: the same amplitude bends it as much.
  const scale = amplitude / Math.PI;
  return [point[0] + offset[0] * scale, point[1] + offset[1] * scale, 0];
}

/** One minus the cosine of the angle between two points: 0 together, 2 opposite. */
function distance(a: Vector, b: Vector, sphere: boolean): number {
  if (sphere) return 1 - clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  // On a plane the field's height spans π radians, so distances match the sphere's near an anchor.
  return 1 - Math.cos(Math.min(Math.PI, Math.hypot(a[0] - b[0], a[1] - b[1]) * Math.PI));
}

interface PreparedAnchor {
  readonly point: Vector;
  /** The color's coordinates in the blending space, then its alpha. */
  readonly channels: readonly [number, number, number, number];
}

const TRANSPARENT = color('srgb', [0, 0, 0], 0);

/**
 * A sampler of the field at `(x, y)` (each 0–1) returning sRGB channels and alpha (each 0–1):
 * the anchors are prepared once, so a renderer can sample every pixel of a texture.
 */
export function createFieldGradientSampler(
  anchors: readonly FieldGradientAnchor[],
  options: FieldGradientOptions = {},
): (x: number, y: number) => FieldGradientRgba {
  const settings = resolve(options);
  const sphere = settings.projection === 'equirectangular';
  const space = settings.interpolation === 'oklab' ? 'oklab' : 'srgb';
  const prepared: PreparedAnchor[] = normalizeFieldAnchors(anchors).map((anchor) => {
    const parsed = parseColor(anchor.color) ?? TRANSPARENT;
    const converted = convertColor(parsed, space);
    return {
      point: sphere ? sphereDirection(anchor.x, anchor.y) : [anchor.x, anchor.y, 0],
      channels: [converted.coords[0], converted.coords[1], converted.coords[2], parsed.alpha],
    };
  });
  const sigma = 0.46 / settings.power;
  const weightOf = (gap: number): number =>
    settings.falloff === 'inverse-distance'
      ? 1 / (gap + 0.0005) ** settings.power
      : Math.exp(-(gap * gap) / (2 * sigma * sigma));
  return (x, y) => {
    if (!prepared.length) return [0, 0, 0, 0];
    const point = warp(
      sphere ? sphereDirection(x, y) : [clamp(x), clamp(y), 0],
      settings.warpAmplitude,
      settings.warpFrequency,
      sphere,
    );
    let total = 0;
    const sum = [0, 0, 0, 0];
    for (const anchor of prepared) {
      const weight = weightOf(distance(point, anchor.point, sphere));
      sum[0]! += anchor.channels[0] * weight;
      sum[1]! += anchor.channels[1] * weight;
      sum[2]! += anchor.channels[2] * weight;
      sum[3]! += anchor.channels[3] * weight;
      total += weight;
    }
    if (total <= 0) return [0, 0, 0, 0];
    const mixed = [sum[0]! / total, sum[1]! / total, sum[2]! / total] as const;
    const alpha = clamp(sum[3]! / total);
    if (space === 'srgb') return [clamp(mixed[0]), clamp(mixed[1]), clamp(mixed[2]), alpha];
    const rgb = convertColor(color('oklab', mixed), 'srgb').coords;
    return [clamp(rgb[0]), clamp(rgb[1]), clamp(rgb[2]), alpha];
  };
}

/** The color of the field at `(x, y)`, each 0–1. */
export function sampleFieldGradient(
  anchors: readonly FieldGradientAnchor[],
  x: number,
  y: number,
  options: FieldGradientOptions = {},
): ColorValue {
  const [r, g, b, alpha] = createFieldGradientSampler(anchors, options)(x, y);
  return color('srgb', [r, g, b], alpha);
}

/**
 * Renders the field into 8-bit RGBA pixels, row by row from the top (the layout of `ImageData`
 * and of a texture upload), sampling each pixel's center. Pass `target` to reuse a buffer.
 */
export function renderFieldGradient(
  anchors: readonly FieldGradientAnchor[],
  width: number,
  height: number,
  options: FieldGradientOptions = {},
  target?: Uint8ClampedArray,
): Uint8ClampedArray {
  const columns = Math.max(0, Math.floor(width));
  const rows = Math.max(0, Math.floor(height));
  const pixels =
    target && target.length >= columns * rows * 4
      ? target
      : new Uint8ClampedArray(columns * rows * 4);
  const sample = createFieldGradientSampler(anchors, options);
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++) {
      const [r, g, b, alpha] = sample((column + 0.5) / columns, (row + 0.5) / rows);
      const index = (row * columns + column) * 4;
      pixels[index] = Math.round(r * 255);
      pixels[index + 1] = Math.round(g * 255);
      pixels[index + 2] = Math.round(b * 255);
      pixels[index + 3] = Math.round(alpha * 255);
    }
  return pixels;
}

/** Anchors after one is added at `(x, y)` in the field's own color there, as hex; it comes last. */
export function insertFieldAnchor(
  anchors: readonly FieldGradientAnchor[],
  x: number,
  y: number,
  options: FieldGradientOptions = {},
): { anchors: readonly FieldGradientAnchor[]; index: number } {
  const list = normalizeFieldAnchors(anchors);
  const at = { x: round(clamp(x)), y: round(clamp(y)) };
  const sampled = list.length
    ? serializeColor(sampleFieldGradient(list, at.x, at.y, options), 'hex')
    : '#ffffff';
  return { anchors: [...list, { ...at, color: sampled }], index: list.length };
}

/** Anchors after the anchor at `index` moves to `(x, y)`. */
export function moveFieldAnchor(
  anchors: readonly FieldGradientAnchor[],
  index: number,
  x: number,
  y: number,
): readonly FieldGradientAnchor[] {
  const list = normalizeFieldAnchors(anchors);
  if (!list[index]) return list;
  return list.map((anchor, at) =>
    at === index ? { ...anchor, x: round(clamp(x)), y: round(clamp(y)) } : anchor,
  );
}

/** Anchors without the anchor at `index`; `null` when that would leave fewer than `minimum`. */
export function removeFieldAnchor(
  anchors: readonly FieldGradientAnchor[],
  index: number,
  minimum = 1,
): readonly FieldGradientAnchor[] | null {
  const list = normalizeFieldAnchors(anchors);
  if (index < 0 || index >= list.length || list.length - 1 < Math.max(0, minimum)) return null;
  return list.filter((_, at) => at !== index);
}
