import { convertColor, mixColors } from '../../foundation/color/convert.js';
import { parseColor } from '../../foundation/color/parse.js';
import { displayColor, serializeColor } from '../../foundation/color/serialize.js';
import { color, type ColorValue } from '../../foundation/color/types.js';

/**
 * One color stop of a gradient. The record says nothing about how a renderer draws it: CSS, a
 * canvas or a shader can read the same stops.
 */
export interface ColorGradientStop {
  /** Where the stop sits along the gradient, from 0 to 1. */
  readonly position: number;
  /** The stop's color, in any CSS Color 4 notation. */
  readonly color: string;
  /**
   * Where, within the span to the next stop (0–1), the two colors mix half and half. Defaults to
   * 0.5, an even blend; the last stop's midpoint is unused.
   */
  readonly midpoint?: number;
}

/** The color space two neighboring stops mix in. */
export type ColorGradientInterpolation = 'oklab' | 'srgb';

/** The closest a midpoint comes to either stop of its span. */
export const MIDPOINT_MIN = 0.05;
export const MIDPOINT_MAX = 0.95;
const TRANSPARENT = color('srgb', [0, 0, 0], 0);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
// Four decimals: a hundredth of a percent, finer than any track a pointer drags.
const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/** A stop with a finite position in range and, when one is given, a midpoint in range. */
function normalizeStop(stop: ColorGradientStop): ColorGradientStop {
  const position = Number.isFinite(stop.position) ? round(clamp(stop.position, 0, 1)) : 0;
  const midpoint =
    stop.midpoint === undefined || !Number.isFinite(stop.midpoint)
      ? undefined
      : round(clamp(stop.midpoint, MIDPOINT_MIN, MIDPOINT_MAX));
  return {
    position,
    color: String(stop.color ?? ''),
    ...(midpoint === undefined || midpoint === 0.5 ? {} : { midpoint }),
  };
}

/**
 * The stops in gradient order with positions and midpoints in range; stops at the same position
 * keep their given order. An even midpoint (0.5) is left out.
 */
export function normalizeColorGradientStops(
  stops: readonly ColorGradientStop[] | null | undefined,
): readonly ColorGradientStop[] {
  if (!Array.isArray(stops)) return [];
  return stops
    .filter((stop): stop is ColorGradientStop => !!stop && typeof stop === 'object')
    .map((stop, index) => ({ stop: normalizeStop(stop), index }))
    .sort((a, b) => a.stop.position - b.stop.position || a.index - b.index)
    .map((entry) => entry.stop);
}

/** Whether two stop lists describe the same gradient. */
export function sameColorGradientStops(
  a: readonly ColorGradientStop[],
  b: readonly ColorGradientStop[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every(
    (stop, index) =>
      stop.position === b[index]!.position &&
      stop.color === b[index]!.color &&
      (stop.midpoint ?? 0.5) === (b[index]!.midpoint ?? 0.5),
  );
}

/** The share of the next stop's color at `t` (0–1) within a span whose half point is `midpoint`. */
export function midpointWeight(t: number, midpoint = 0.5): number {
  const at = clamp(t, 0, 1);
  const hint = clamp(midpoint, MIDPOINT_MIN, MIDPOINT_MAX);
  if (hint === 0.5) return at;
  if (at <= 0) return 0;
  if (at >= 1) return 1;
  return at ** (Math.log(0.5) / Math.log(hint));
}

function parsed(stop: ColorGradientStop): ColorValue {
  return parseColor(stop.color) ?? TRANSPARENT;
}

function mix(a: ColorValue, b: ColorValue, t: number, space: ColorGradientInterpolation) {
  if (space === 'oklab') return mixColors(a, b, t);
  const from = convertColor(a, 'srgb');
  const to = convertColor(b, 'srgb');
  const coords = from.coords.map((value, index) => value + ((to.coords[index] ?? 0) - value) * t);
  return color(
    'srgb',
    coords as unknown as readonly [number, number, number],
    from.alpha + (to.alpha - from.alpha) * t,
  );
}

/**
 * The color of the gradient at `t` (0–1): the nearest stop's color outside the stops, otherwise
 * the two neighboring stops mixed in `interpolation` and eased by the first one's midpoint. A
 * stop whose color does not parse reads as transparent. With no stops, transparent.
 */
export function sampleColorGradient(
  stops: readonly ColorGradientStop[],
  t: number,
  interpolation: ColorGradientInterpolation = 'oklab',
): ColorValue {
  const list = normalizeColorGradientStops(stops);
  if (!list.length) return TRANSPARENT;
  const at = clamp(Number.isFinite(t) ? t : 0, 0, 1);
  const first = list[0]!;
  const last = list[list.length - 1]!;
  if (at <= first.position) return parsed(first);
  if (at >= last.position) return parsed(last);
  let index = 0;
  while (index < list.length - 2 && list[index + 1]!.position <= at) index++;
  const from = list[index]!;
  const to = list[index + 1]!;
  const span = to.position - from.position;
  if (span <= 0) return parsed(to);
  const weight = midpointWeight((at - from.position) / span, from.midpoint);
  return mix(parsed(from), parsed(to), weight, interpolation);
}

/**
 * An `<image>` that paints the gradient left to right for the element's own track, sampled from
 * the model so midpoints and the interpolation space show as any renderer of the stops would.
 */
export function colorGradientTrackPaint(
  stops: readonly ColorGradientStop[],
  interpolation: ColorGradientInterpolation = 'oklab',
  samples = 64,
): string {
  const list = normalizeColorGradientStops(stops);
  if (!list.length) return 'none';
  const entries: string[] = [];
  const count = Math.max(2, Math.round(samples));
  for (let index = 0; index <= count; index++) {
    const t = index / count;
    entries.push(
      `${displayColor(sampleColorGradient(list, t, interpolation))} ${(t * 100).toFixed(2)}%`,
    );
  }
  return `linear-gradient(var(--_tp-color-gradient-input-axis, to right), ${entries.join(', ')})`;
}

/** Stops after a stop is added at `position` in the gradient's own color there, as hex. */
export function insertColorGradientStop(
  stops: readonly ColorGradientStop[],
  position: number,
  interpolation: ColorGradientInterpolation = 'oklab',
): { stops: readonly ColorGradientStop[]; index: number } {
  const list = normalizeColorGradientStops(stops);
  const at = round(clamp(position, 0, 1));
  const added: ColorGradientStop = {
    position: at,
    color: serializeColor(sampleColorGradient(list, at, interpolation), 'hex'),
  };
  let index = list.findIndex((stop) => stop.position > at);
  if (index < 0) index = list.length;
  const next = [...list.slice(0, index), added, ...list.slice(index)];
  return { stops: next, index };
}

/**
 * Stops after the stop at `index` of `stops` moves to `position`. It passes its neighbors when
 * moved beyond them, keeping its color and midpoint; `index` is where it lands.
 */
export function moveColorGradientStop(
  stops: readonly ColorGradientStop[],
  index: number,
  position: number,
): { stops: readonly ColorGradientStop[]; index: number } {
  const list = normalizeColorGradientStops(stops);
  const moving = list[index];
  if (!moving) return { stops: list, index };
  const at = round(clamp(position, 0, 1));
  const moved: ColorGradientStop = { ...moving, position: at };
  const rest = list.filter((_, candidate) => candidate !== index);
  // Among equal positions it stays on the side it came from: it passes a neighbor only by
  // going beyond it.
  let landing = rest.findIndex((stop) =>
    at < moving.position ? stop.position > at : stop.position >= at,
  );
  if (landing < 0) landing = rest.length;
  return { stops: [...rest.slice(0, landing), moved, ...rest.slice(landing)], index: landing };
}

/** Stops after the midpoint after the stop at `index` moves to `midpoint`. */
export function moveColorGradientMidpoint(
  stops: readonly ColorGradientStop[],
  index: number,
  midpoint: number,
): readonly ColorGradientStop[] {
  const list = normalizeColorGradientStops(stops);
  if (index < 0 || index >= list.length - 1) return list;
  return list.map((stop, candidate) =>
    candidate === index ? normalizeStop({ ...stop, midpoint }) : stop,
  );
}

/** Stops without the stop at `index`; `null` when that would leave fewer than `minimum`. */
export function removeColorGradientStop(
  stops: readonly ColorGradientStop[],
  index: number,
  minimum = 2,
): readonly ColorGradientStop[] | null {
  const list = normalizeColorGradientStops(stops);
  if (index < 0 || index >= list.length || list.length - 1 < Math.max(0, minimum)) return null;
  return list.filter((_, candidate) => candidate !== index);
}
