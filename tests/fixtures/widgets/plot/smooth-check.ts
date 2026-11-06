import { createPlotStream, type TpPlot } from '../../../../src/widgets/plot/index.js';

/** Opt-in clock-scroll comparison across atlas compaction and source retention. */
export async function verifySmoothPlot() {
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none';
  document.body.append(host);
  const stream = createPlotStream({ seriesIds: ['signal'], capacity: 256 });
  const plots: TpPlot[] = [];
  let clock = -100;
  try {
    stream.appendBatch([
      {
        series: 'signal',
        points: Array.from({ length: 122 }, (_, i) => {
          const x = -12100 + i * 100;
          return [x, Math.sin(x / 170) * 80] as const;
        }),
      },
    ]);
    for (const strategy of ['incremental', 'full'] as const) {
      const plot = document.createElement('tp-plot');
      Object.assign(plot, {
        label: '',
        mode: 'scroll',
        follow: 'clock',
        clock: () => clock,
        window: 12000,
        yDomain: [-100, 100],
        maxFrameRate: 0,
        offscreen: 'render',
        background: 'solid',
        renderStrategy: strategy,
        stream,
        series: [
          {
            id: 'signal',
            label: 'Signal',
            color: '#ffffff',
            negativeColor: '#ff3333',
            lineDash: [4, 3],
            fill: { baseline: 0, opacity: 0.2 },
          },
        ],
      });
      plot.style.cssText = 'width:240px;height:100px';
      host.append(plot);
      plots.push(plot);
    }
    await Promise.all(plots.map((p) => p.updateComplete));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    for (const plot of plots)
      plot.shadowRoot!.querySelector('canvas')!.getContext('2d', { willReadFrequently: true });
    const checkpoints: { clock: number; mean: number; badFraction: number }[] = [];
    let sample = 100;
    for (let frame = 0; frame <= 240; frame++) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const time = frame * 125;
      while (sample <= time) {
        stream.append('signal', [sample, Math.sin(sample / 170) * 80]);
        sample += 100;
      }
      clock = time - 100;
      plots.forEach((p) => p.renderNow());
      if (frame % 40) continue;
      const images = plots.map((p) => {
        const canvas = p.shadowRoot!.querySelector('canvas')!;
        return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      });
      let total = 0,
        bad = 0;
      for (let i = 0; i < images[0]!.length; i++) {
        const error = Math.abs(images[0]![i]! - images[1]![i]!);
        total += error;
        if (error > 24) bad++;
      }
      checkpoints.push({
        clock,
        mean: total / images[0]!.length,
        badFraction: bad / images[0]!.length,
      });
    }
    return {
      checkpoints,
      incremental: plots[0]!.renderStats,
      full: plots[1]!.renderStats,
      retained: plots[0]!.getSummary().series.signal!.count,
    };
  } finally {
    host.remove();
    stream.dispose();
  }
}
