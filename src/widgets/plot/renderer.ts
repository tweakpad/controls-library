import type { PlotPoint, PlotSeries, PlotDomain, PlotPaint } from './types.js';

/** Draw a clipped set of ordered paths; signed paint is clipped at the exact baseline. */
export function paintPlotSeries(
  context: CanvasRenderingContext2D,
  points: readonly PlotPoint[],
  series: PlotSeries,
  x: PlotDomain,
  y: PlotDomain,
  width: number,
  height: number,
  paint: PlotPaint,
  ratio: number,
  dashOffset: (point: PlotPoint) => number = () => 0,
  segmentDashes = false,
  pixelOffset = 0,
): void {
  const px = (n: number) => ((n - x[0]) / (x[1] - x[0])) * width + pixelOffset;
  const py = (n: number) => height - ((n - y[0]) / (y[1] - y[0])) * height;
  const baseline = series.fill ? series.fill.baseline : 0;
  const positive = paint.colors[series.id] ?? paint.foreground,
    negative = paint.negativeColors[series.id] ?? positive;
  const runs: PlotPoint[][] = [];
  let run: PlotPoint[] = [];
  for (const p of points) {
    if (p[1] === null) {
      if (run.length) runs.push(run);
      run = [];
    } else run.push(p);
  }
  if (run.length) runs.push(run);
  const path = (r: readonly PlotPoint[]) => {
    context.beginPath();
    const first = r[0]!;
    context.moveTo(px(first[0]), py(first[1]!));
    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1]!,
        b = r[i]!;
      if (series.interpolation === 'step-before') context.lineTo(px(a[0]), py(b[1]!));
      if (series.interpolation === 'step-after') context.lineTo(px(b[0]), py(a[1]!));
      context.lineTo(px(b[0]), py(b[1]!));
    }
  };
  const signed = (below: boolean, draw: () => void, clip: boolean) => {
    context.save();
    if (clip) {
      const zero = Math.max(0, Math.min(height, py(baseline)));
      context.beginPath();
      context.rect(0, below ? zero : 0, context.canvas.width, below ? height - zero : zero);
      context.clip();
    }
    draw();
    context.restore();
  };
  for (const r of runs) {
    let low = Infinity,
      high = -Infinity;
    for (const point of r) {
      low = Math.min(low, point[1]!);
      high = Math.max(high, point[1]!);
    }
    const signs = low >= baseline ? [false] : high <= baseline ? [true] : [false, true];
    if (series.fill) {
      const fill = series.fill;
      for (const below of signs)
        signed(
          below,
          () => {
            path(r);
            context.lineTo(px(r.at(-1)![0]), py(fill.baseline));
            context.lineTo(px(r[0]![0]), py(fill.baseline));
            context.closePath();
            context.globalAlpha = below
              ? (series.negativeFill?.opacity ?? fill.opacity ?? 0.2)
              : (fill.opacity ?? 0.2);
            context.fillStyle = below ? (paint.negativeFills[series.id] ?? negative) : positive;
            context.fill();
          },
          signs.length > 1,
        );
    }
    if (series.line !== false && (series.lineWidth ?? 1.5) > 0) {
      context.lineWidth = (series.lineWidth ?? 1.5) * ratio;
      context.lineJoin = 'round';
      context.lineCap = 'butt';
      context.lineDashOffset = dashOffset(r[0]!);
      const pattern = (series.lineDash ?? []).map((v) => v * ratio);
      if (pattern.length % 2) pattern.push(...pattern);
      const period = pattern.reduce((a, b) => a + b, 0);
      const on = (offset: number) => {
        if (!period) return true;
        let phase = ((offset % period) + period) % period;
        for (let i = 0; i < pattern.length; i++) {
          if (phase < pattern[i]!) return i % 2 === 0;
          phase -= pattern[i]!;
        }
        return true;
      };
      context.setLineDash(pattern);
      for (const below of signs)
        signed(
          below,
          () => {
            context.strokeStyle = below ? negative : positive;
            if (!segmentDashes) {
              path(r);
              context.stroke();
              return;
            }
            // Retained vertices keep their raw path-length phase, even when a column
            // drops intermediate points. Local segment anchors make dirty/full paints agree.
            for (let i = 1; i < r.length; i++) {
              const a = r[i - 1]!,
                b = r[i]!,
                offset = dashOffset(a);
              context.lineDashOffset = offset;
              path([a, b]);
              context.stroke();
              const dx = px(b[0]) - px(a[0]),
                dy = py(b[1]!) - py(a[1]!);
              const length =
                series.interpolation && series.interpolation !== 'linear'
                  ? Math.abs(dx) + Math.abs(dy)
                  : Math.hypot(dx, dy);
              if (i < r.length - 1 && on(offset + length - 1e-7) && on(dashOffset(b) + 1e-7)) {
                context.beginPath();
                context.arc(px(b[0]), py(b[1]!), context.lineWidth / 2, 0, Math.PI * 2);
                context.fillStyle = context.strokeStyle;
                context.fill();
              }
            }
          },
          signs.length > 1,
        );
      context.setLineDash([]);
    }
  }
}
