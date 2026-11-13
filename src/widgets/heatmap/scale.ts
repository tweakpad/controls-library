import type { HeatmapScale } from './types.js';

/**
 * The lower bounds of levels 1 to `levels - 1`. Values at or below zero, and missing values, are
 * level 0. Explicit `thresholds` win; otherwise `linear` splits `(domain[0], domain[1]]` into equal
 * steps and `quantile` splits the positive values into equal counts.
 */
export interface HeatmapScaleInput {
  values: readonly number[];
  levels: number;
  scale: HeatmapScale;
  thresholds?: readonly number[] | undefined;
  domain?: readonly [number, number] | undefined;
}

export interface HeatmapLevelScale {
  /** The level of a value, from 0 to `levels - 1`. */
  level(value: number | null): number;
  /** The lower (exclusive) and upper (inclusive) bounds of each level from 1; level 0 is ≤ 0. */
  readonly ranges: readonly (readonly [number, number])[];
}

export function heatmapLevelScale(input: HeatmapScaleInput): HeatmapLevelScale {
  const levels = Math.max(2, Math.floor(input.levels) || 2);
  const steps = levels - 1;
  const positive = input.values.filter((value) => Number.isFinite(value) && value > 0);
  const max = positive.length ? Math.max(...positive) : 0;

  let bounds: number[];
  if (input.thresholds?.length) {
    bounds = [...input.thresholds].slice(0, steps);
  } else if (input.scale === 'quantile' && positive.length) {
    const sorted = [...positive].sort((a, b) => a - b);
    bounds = Array.from({ length: steps }, (_, index) =>
      index === 0 ? Number.MIN_VALUE : quantile(sorted, index / steps),
    );
  } else {
    const [low, high] = input.domain ?? [0, max];
    const span = high - low;
    bounds = Array.from({ length: steps }, (_, index) =>
      index === 0 ? Math.max(low, 0) + Number.MIN_VALUE : low + (span * index) / steps,
    );
  }
  // Bounds never decrease, so every level keeps a place.
  for (let index = 1; index < bounds.length; index += 1)
    bounds[index] = Math.max(bounds[index]!, bounds[index - 1]!);

  const level = (value: number | null): number => {
    if (value === null || !Number.isFinite(value) || value <= 0) return 0;
    let result = 0;
    for (let index = 0; index < bounds.length; index += 1) {
      const bound = bounds[index]!;
      // Linear and quantile bounds are exclusive (a value equal to a step's top stays in it);
      // explicit thresholds are inclusive lower bounds.
      if (input.thresholds?.length ? value >= bound : value > bound || index === 0)
        result = index + 1;
    }
    return Math.min(result, steps);
  };

  const top = Math.max(max, bounds.at(-1) ?? 0);
  const ranges = bounds.map((bound, index) => {
    const from = index === 0 ? 0 : bound;
    const to = index + 1 < bounds.length ? bounds[index + 1]! : top;
    return [from, to] as const;
  });
  return { level, ranges };
}

function quantile(sorted: readonly number[], fraction: number): number {
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower);
}
