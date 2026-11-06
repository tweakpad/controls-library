import type { PlotDomain, PlotPoint, PlotSamples } from './types.js';
import { lowerBound } from './geometry.js';
/** Reduce monotonic paths with constant scratch space per column, preserving endpoints/extrema/gaps. */
export function plotPoints(
  view: PlotSamples,
  domain: PlotDomain,
  width: number,
  reduce = true,
  from = domain[0],
  to = domain[1],
  selectedIndex?: (index: number) => void,
  pixelOffset = 0,
): PlotPoint[] {
  const start = view.monotonic ? Math.max(0, lowerBound(view, from) - 1) : 0;
  const end = view.monotonic ? Math.min(view.length, lowerBound(view, to) + 1) : view.length;
  const result: PlotPoint[] = [];
  let first: PlotPoint | undefined,
    min: PlotPoint | undefined,
    max: PlotPoint | undefined,
    last: PlotPoint | undefined;
  let firstIndex = 0,
    minIndex = 0,
    maxIndex = 0,
    lastIndex = 0,
    column = -Infinity;
  const flush = () => {
    if (!first) return;
    if (firstIndex === lastIndex) {
      result.push(first);
      selectedIndex?.(firstIndex);
      first = min = max = last = undefined;
      return;
    }
    const selected: [number, PlotPoint][] = [
      [firstIndex, first],
      [minIndex, min!],
      [maxIndex, max!],
      [lastIndex, last!],
    ];
    let previous = -1;
    for (const [index, point] of selected.sort((a, b) => a[0] - b[0]))
      if (index !== previous) {
        result.push(point);
        selectedIndex?.(index);
        previous = index;
      }
    first = min = max = last = undefined;
  };
  for (let i = start; i < end; i++) {
    const point = view.at(i);
    if (!reduce || !view.monotonic) {
      result.push(point);
      selectedIndex?.(i);
      continue;
    }
    if (point[1] === null) {
      flush();
      if (result.at(-1)?.[1] !== null) {
        result.push(point);
        selectedIndex?.(i);
      }
      column = -Infinity;
      continue;
    }
    const pixel = ((point[0] - domain[0]) / (domain[1] - domain[0])) * width + pixelOffset;
    const integer = Math.round(pixel);
    const next = Math.abs(pixel - integer) < 1e-7 ? integer : Math.floor(pixel);
    if (next !== column) {
      flush();
      column = next;
    }
    if (!first) {
      first = min = max = point;
      firstIndex = minIndex = maxIndex = i;
    } else {
      if (point[1] < min![1]!) {
        min = point;
        minIndex = i;
      }
      if (point[1] > max![1]!) {
        max = point;
        maxIndex = i;
      }
    }
    last = point;
    lastIndex = i;
  }
  flush();
  return result;
}
