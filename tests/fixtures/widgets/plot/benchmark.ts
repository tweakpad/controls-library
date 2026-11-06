import { createPlotStream, type TpPlot } from '../../../../src/widgets/plot/index.js';
/** Opt-in short measurement; no timer or benchmark runs on fixture load. */
export async function benchmarkPlot(
  count = 1,
  strategy: 'incremental' | 'full' = 'incremental',
  capacity = 1024,
  windowSize = 120,
  updates = 20,
  interval = 0,
) {
  if (
    !Number.isSafeInteger(count) ||
    count < 1 ||
    count > 32 ||
    capacity > 16384 ||
    updates < 1 ||
    updates > 300
  )
    throw new RangeError('Keep this opt-in check within 32 plots, 16384 samples and 300 updates.');
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none';
  document.body.append(host);
  const plots: TpPlot[] = [],
    streams: ReturnType<typeof createPlotStream>[] = [];
  for (let i = 0; i < count; i++) {
    const plot = document.createElement('tp-plot'),
      stream = createPlotStream({ seriesIds: ['load'], xMode: 'index', capacity });
    plot.style.cssText = 'width:320px;height:100px';
    plot.label = '';
    plot.mode = 'push';
    plot.window = windowSize;
    plot.yDomain = [-100, 100];
    plot.maxFrameRate = 0;
    plot.offscreen = 'render';
    plot.renderStrategy = strategy;
    plot.series = [
      { id: 'load', label: 'Load', fill: { baseline: 0 }, negativeColor: 'var(--tp-destructive)' },
    ];
    plot.stream = stream;
    for (let n = 0; n < capacity; n++) stream.push({ load: Math.sin(n * 0.2) * 80 });
    host.append(plot);
    plots.push(plot);
    streams.push(stream);
  }
  await Promise.all(plots.map((p) => p.updateComplete));
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  plots.forEach((p) => p.renderNow());
  const paints: number[] = [],
    batches: number[] = [],
    intervals: number[] = [];
  let previous = performance.now();
  for (let tick = 0; tick < updates; tick++) {
    await new Promise<void>((r) =>
      interval > 0 ? setTimeout(r, interval) : requestAnimationFrame(() => r()),
    );
    const now = performance.now();
    intervals.push(now - previous);
    previous = now;
    const batch = performance.now();
    for (let i = 0; i < count; i++) {
      streams[i]!.push({ load: Math.sin(tick * 0.3) * 70 });
      const begin = performance.now();
      plots[i]!.renderNow();
      paints.push(performance.now() - begin);
    }
    batches.push(performance.now() - batch);
  }
  const stats = plots[0]!.renderStats,
    rect = plots[0]!.shadowRoot!.querySelector('canvas')!.getBoundingClientRect();
  host.remove();
  streams.forEach((s) => s.dispose());
  const summarize = (values: number[]) => {
    const ordered = [...values].sort((a, b) => a - b);
    return {
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      p95: ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))],
    };
  };
  return {
    count,
    strategy,
    capacity,
    cssSize: [rect.width, rect.height],
    devicePixelRatio: devicePixelRatio,
    userAgent: navigator.userAgent,
    paintMs: summarize(paints),
    batchMs: summarize(batches),
    frameIntervalMs: summarize(intervals),
    stats,
  };
}

/** Measure the public shared-scheduler callback, including element rate limiting. */
export async function benchmarkPlotDashboard() {
  const { createPlotScheduler } = await import('../../../../src/widgets/plot/index.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none';
  document.body.append(host);
  const base = createPlotScheduler({ owner: window, budgetMs: 1, maxPlotsPerFrame: 4 });
  const costs: number[] = [],
    frames: number[] = [],
    plots: TpPlot[] = [],
    streams: ReturnType<typeof createPlotStream>[] = [];
  let collecting = false,
    frameCost = 0;
  const scheduler = {
    owner: window,
    register(job: import('../../../../src/widgets/plot/scheduler.js').PlotRenderJob) {
      return base.register({
        ...job,
        paint(time: number) {
          const start = performance.now();
          job.paint(time);
          if (collecting) {
            const cost = performance.now() - start;
            costs.push(cost);
            frameCost += cost;
          }
        },
      });
    },
  };
  try {
    for (let i = 0; i < 32; i++) {
      const p = document.createElement('tp-plot'),
        s = createPlotStream({ seriesIds: ['a'], xMode: 'index', capacity: 1024 });
      p.style.cssText = 'width:320px;height:100px';
      Object.assign(p, {
        label: '',
        mode: 'push',
        window: 1023,
        yDomain: [-100, 100],
        offscreen: 'render',
        series: [{ id: 'a', label: 'Load', fill: { baseline: 0 } }],
        stream: s,
        scheduler,
        maxFrameRate: 10,
      });
      for (let j = 0; j < 1024; j++) s.push({ a: Math.sin(j * 0.2) * 70 });
      host.append(p);
      plots.push(p);
      streams.push(s);
    }
    await Promise.all(plots.map((p) => p.updateComplete));
    await new Promise((r) => setTimeout(r, 180));
    collecting = true;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      frames.push(frameCost);
      frameCost = 0;
      for (const s of streams) s.push({ a: Math.sin(i * 0.2) * 70 });
    }
    const summary = (a: number[]) => {
      const sorted = [...a].sort((a, b) => a - b);
      return {
        mean: a.reduce((a, b) => a + b, 0) / a.length,
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    };
    const counts = plots.map((p) => p.renderStats.incrementalPaints);
    return {
      count: 32,
      frameWorkMs: summary(frames),
      paintMs: summary(costs),
      paints: costs.length,
      perPlotRange: [Math.min(...counts), Math.max(...counts)],
      retained: plots.every((p) => p.getSummary().series.a!.count === 1024),
      scheduler: { budgetMs: 1, maxPlotsPerFrame: 4 },
    };
  } finally {
    host.remove();
    base.dispose();
    streams.forEach((s) => s.dispose());
  }
}
