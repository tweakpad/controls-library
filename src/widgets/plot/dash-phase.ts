import type { PlotDomain, PlotPoint, PlotSamples, PlotSeries } from './types.js';
import { lowerBound } from './geometry.js';
import { plotPoints } from './decimation.js';
/** Bounded path-length checkpoints keep dashed dirty strips in phase with cached history. */
export class PlotDashPhase {
  readonly #offsets = new Map<number, number>();
  #source: PlotSamples | undefined;
  prepare(
    view: PlotSamples,
    series: PlotSeries,
    sx: number,
    sy: number,
    changed: number,
    reset: boolean,
  ): void {
    if (reset || view !== this.#source) {
      this.#offsets.clear();
      changed = -Infinity;
      this.#source = view;
    }
    if (!view.length) {
      this.#offsets.clear();
      return;
    }
    const key = (i: number) => view.key?.(i) ?? i;
    const first = key(0);
    for (const k of this.#offsets.keys()) {
      if (k >= first) break;
      this.#offsets.delete(k);
    }
    const begin = Number.isFinite(changed)
      ? Math.max(0, lowerBound(view, changed) - 1)
      : changed === Infinity
        ? view.length
        : 0;
    for (let i = begin; i < view.length; i++) {
      const p = view.at(i),
        previous = i ? view.at(i - 1) : undefined;
      let distance = this.#offsets.get(key(i)) ?? 0;
      if (previous) {
        distance = this.#offsets.get(key(i - 1)) ?? 0;
        if (previous[1] === null || p[1] === null) distance = 0;
        else {
          const dx = (p[0] - previous[0]) * sx,
            dy = (p[1] - previous[1]) * sy;
          distance +=
            series.interpolation && series.interpolation !== 'linear'
              ? Math.abs(dx) + Math.abs(dy)
              : Math.hypot(dx, dy);
        }
      }
      this.#offsets.set(key(i), distance);
    }
  }
  points(
    view: PlotSamples,
    from: number,
    to: number,
    domain: PlotDomain = [from, to],
    width = 1,
    reduce = false,
    pixelOffset = 0,
  ): { points: PlotPoint[]; offset: (point: PlotPoint) => number } {
    const indices: number[] = [],
      selected = plotPoints(
        view,
        domain,
        width,
        reduce,
        from,
        to,
        (i) => indices.push(i),
        pixelOffset,
      );
    const offsets = new Map<PlotPoint, number>();
    const points = selected.map((point, index): PlotPoint => {
      const p: PlotPoint = [point[0], point[1]],
        i = indices[index]!;
      offsets.set(p, this.#offsets.get(view.key?.(i) ?? i) ?? 0);
      return p;
    });
    return { points, offset: (p) => offsets.get(p) ?? 0 };
  }
}
