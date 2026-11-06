import type { PlotStream, PlotWrite } from './stream.js';
export interface PlotSamplerOptions {
  interval?: number;
  owner?: Window;
  read: (now: number) => readonly PlotWrite[] | null;
  clock?: () => number;
  scheduler?: { schedule(callback: () => void, delay: number): () => void };
  sampleWhileHidden?: boolean;
  onError?: (error: unknown) => void;
}
export interface PlotSampler {
  start(): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}
/** Opt-in polling with no catch-up burst; producers that already have a loop should push instead. */
export function createPlotSampler(stream: PlotStream, options: PlotSamplerOptions): PlotSampler {
  const owner = options.owner ?? (typeof window !== 'undefined' ? window : undefined);
  if (!owner) throw new Error('Plot sampler needs an owner Window.');
  const interval = options.interval ?? 100;
  if (!Number.isFinite(interval) || interval <= 0)
    throw new RangeError('Plot sample interval must be positive.');
  let running = false,
    disposed = false,
    cancel: (() => void) | undefined,
    lastError = -Infinity;
  const schedule = () => {
    cancel?.();
    cancel = undefined;
    if (!running || disposed || (!options.sampleWhileHidden && owner.document.hidden)) return;
    const callback = () => {
      cancel = undefined;
      if (!running || disposed) return;
      try {
        const writes = options.read((options.clock ?? (() => owner.performance.now()))());
        if (writes) stream.appendBatch(writes);
      } catch (error) {
        const now = owner.performance.now();
        if (now - lastError >= 1000) {
          lastError = now;
          options.onError?.(error);
        }
      }
      schedule();
    };
    if (options.scheduler) cancel = options.scheduler.schedule(callback, interval);
    else {
      const timer = owner.setTimeout(callback, interval);
      cancel = () => owner.clearTimeout(timer);
    }
  };
  owner.document.addEventListener('visibilitychange', schedule);
  return {
    start: () => {
      if (!disposed && !running) {
        running = true;
        schedule();
      }
    },
    resume: () => {
      if (!disposed && !running) {
        running = true;
        schedule();
      }
    },
    pause: () => {
      running = false;
      cancel?.();
      cancel = undefined;
    },
    dispose: () => {
      disposed = true;
      running = false;
      cancel?.();
      cancel = undefined;
      owner.document.removeEventListener('visibilitychange', schedule);
    },
  };
}
