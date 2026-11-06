import type { PlotData, PlotPoint, PlotRevision, PlotSamples } from './types.js';

export interface PlotStreamOptions {
  seriesIds: readonly string[];
  capacity?: number;
  maxBatchSize?: number;
  xMode?: 'explicit' | 'index';
}
export interface PlotWrite {
  series: string;
  points: readonly PlotPoint[];
}
class Ring implements PlotSamples {
  readonly x: Float64Array;
  readonly keys: Float64Array;
  #sequence = 0;
  readonly y: Float64Array;
  length = 0;
  start = 0;
  readonly monotonic = true;
  constructor(readonly capacity: number) {
    this.x = new Float64Array(capacity);
    this.keys = new Float64Array(capacity);
    this.y = new Float64Array(capacity);
  }
  at(index: number): PlotPoint {
    if (index < 0 || index >= this.length) throw new RangeError('Plot sample index out of range.');
    const cell = (this.start + index) % this.capacity;
    return [this.x[cell]!, Number.isNaN(this.y[cell]) ? null : this.y[cell]!];
  }
  key(index: number): number {
    return this.keys[(this.start + index) % this.capacity]!;
  }
  append(point: PlotPoint): void {
    const cell = (this.start + this.length) % this.capacity;
    this.keys[cell] = this.#sequence++;
    this.x[cell] = point[0];
    this.y[cell] = point[1] ?? NaN;
    if (this.length < this.capacity) this.length++;
    else this.start = (this.start + 1) % this.capacity;
  }
  replace(y: number | null): void {
    this.y[(this.start + this.length - 1) % this.capacity] = y ?? NaN;
  }
}
export function validPoint(point: PlotPoint): boolean {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    Number.isFinite(point[0]) &&
    (point[1] === null || Number.isFinite(point[1]))
  );
}
/** Bounded telemetry histories; writes never clone previous samples or invoke a renderer. */
export class PlotStream {
  readonly capacity: number;
  readonly maxBatchSize: number;
  readonly xMode: 'explicit' | 'index';
  readonly seriesIds: readonly string[];
  readonly #rings = new Map<string, Ring>();
  readonly #listeners = new Set<() => void>();
  readonly #changes: PlotRevision[] = [];
  #revision = 0;
  #index = 0;
  #disposed = false;
  constructor(options: PlotStreamOptions) {
    this.capacity = options.capacity ?? 1024;
    this.maxBatchSize = options.maxBatchSize ?? 4096;
    this.xMode = options.xMode ?? 'explicit';
    if (
      !Number.isSafeInteger(this.capacity) ||
      this.capacity < 1 ||
      !Number.isSafeInteger(this.maxBatchSize) ||
      this.maxBatchSize < 1 ||
      !['explicit', 'index'].includes(this.xMode)
    )
      throw new RangeError('Plot stream needs positive capacity/batch size and a valid xMode.');
    if (
      !options.seriesIds.length ||
      options.seriesIds.some((id) => !id) ||
      new Set(options.seriesIds).size !== options.seriesIds.length
    )
      throw new TypeError('Plot stream needs unique nonempty seriesIds.');
    this.seriesIds = Object.freeze([...options.seriesIds]);
    for (const id of this.seriesIds) this.#rings.set(id, new Ring(this.capacity));
  }
  get revision(): number {
    return this.#revision;
  }
  get disposed(): boolean {
    return this.#disposed;
  }
  #ring(id: string): Ring {
    if (this.#disposed) throw new Error('Plot stream is disposed.');
    const ring = this.#rings.get(id);
    if (!ring) throw new Error(`Unknown Plot series: ${id}`);
    return ring;
  }
  /** Internal zero-copy view of one series. */
  view(id: string): PlotSamples {
    return this.#ring(id);
  }
  /** Internal bounded delta history for independent render subscribers. */
  changesSince(revision: number): PlotRevision {
    if (revision === this.#revision) return { revision, reset: false, firstX: Infinity };
    const first = this.#changes[0];
    if (!first || revision < first.revision - 1)
      return { revision: this.#revision, reset: true, firstX: -Infinity };
    let reset = false,
      firstX = Infinity;
    for (const change of this.#changes)
      if (change.revision > revision) {
        reset ||= change.reset;
        firstX = Math.min(firstX, change.firstX);
      }
    return { revision: this.#revision, reset, firstX };
  }
  #publish(firstX: number, reset = false): void {
    this.#changes.push({ revision: ++this.#revision, firstX, reset });
    if (this.#changes.length > 128) this.#changes.shift();
    for (const listener of [...this.#listeners]) {
      try {
        listener();
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
    }
  }
  append(series: string, point: PlotPoint): void {
    this.appendBatch([{ series, points: [point] }]);
  }
  appendBatch(writes: readonly PlotWrite[]): void {
    if (this.#disposed) throw new Error('Plot stream is disposed.');
    if (this.xMode !== 'explicit') throw new Error('Use push on an index Plot stream.');
    if (
      writes.length > this.maxBatchSize ||
      writes.reduce((n, w) => n + w.points.length, 0) > this.maxBatchSize
    )
      throw new RangeError('Plot batch exceeds maxBatchSize.');
    let count = 0,
      firstX = Infinity;
    const lasts = new Map<string, number>();
    for (const write of writes) {
      const ring = this.#ring(write.series);
      let last = lasts.get(write.series) ?? (ring.length ? ring.at(ring.length - 1)[0] : -Infinity);
      for (const point of write.points) {
        if (!validPoint(point) || point[0] < last)
          throw new TypeError('Plot stream points must be finite and have nondecreasing x.');
        last = point[0];
        firstX = Math.min(firstX, last);
        count++;
      }
      lasts.set(write.series, last);
    }
    if (count > this.maxBatchSize) throw new RangeError('Plot batch exceeds maxBatchSize.');
    for (const write of writes)
      for (const point of write.points) this.#ring(write.series).append(point);
    if (count) this.#publish(firstX);
  }
  push(values: Readonly<Record<string, number | null>>): void {
    if (this.#disposed) throw new Error('Plot stream is disposed.');
    if (this.xMode !== 'index') throw new Error('Push requires an index Plot stream.');
    if (this.seriesIds.length > this.maxBatchSize)
      throw new RangeError('Plot frame exceeds maxBatchSize.');
    for (const [id, y] of Object.entries(values)) {
      this.#ring(id);
      if (y !== null && !Number.isFinite(y)) throw new TypeError('Plot y must be finite or null.');
    }
    const index = this.#index++;
    for (const id of this.seriesIds) this.#ring(id).append([index, values[id] ?? null]);
    this.#publish(index);
  }
  replaceLatest(series: string, y: number | null): void {
    const ring = this.#ring(series);
    if (!ring.length) throw new Error('Cannot replace an empty Plot series.');
    if (y !== null && !Number.isFinite(y)) throw new TypeError('Plot y must be finite or null.');
    ring.replace(y);
    this.#publish(ring.at(ring.length - 1)[0]);
  }
  clear(series?: string): void {
    const rings = series ? [this.#ring(series)] : this.seriesIds.map((id) => this.#ring(id));
    for (const ring of rings) {
      ring.length = 0;
      ring.start = 0;
    }
    this.#publish(-Infinity, true);
  }
  snapshot(series?: string): PlotData {
    return Object.fromEntries(
      (series ? [series] : this.seriesIds).map((id) => {
        const r = this.#ring(id);
        return [id, Array.from({ length: r.length }, (_, i) => r.at(i))];
      }),
    );
  }
  subscribe(listener: () => void): () => void {
    if (this.#disposed) throw new Error('Plot stream is disposed.');
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
  dispose(): void {
    if (this.#disposed) return;
    this.clear();
    this.#disposed = true;
    this.#listeners.clear();
    this.#rings.clear();
    this.#changes.length = 0;
  }
}
export const createPlotStream = (options: PlotStreamOptions): PlotStream => new PlotStream(options);
