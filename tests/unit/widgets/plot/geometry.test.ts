import { describe, it, expect } from 'vitest';
import { plotTicks } from '../../../../src/widgets/plot/decorations.js';
import { plotPoints } from '../../../../src/widgets/plot/decimation.js';
import { arrayView } from '../../../../src/widgets/plot/geometry.js';
describe('Plot time ticks', () => {
  it('keeps column extrema stable across integer raster shifts at large epoch origins', () => {
    for (const origin of [0, 1e12]) {
      const points = Array.from(
          { length: 1000 },
          (_, i) => [origin + i, Math.sin(i * 0.4)] as const,
        ),
        view = arrayView({ a: points }, 'a');
      const first = plotPoints(view, [origin, origin + 1024], 240).filter(
        (p) => p[0] >= origin + 100 && p[0] <= origin + 900,
      );
      const shifted = plotPoints(
        view,
        [origin + 40, origin + 1064],
        240,
        true,
        origin + 40,
        origin + 1064,
        undefined,
        0.375,
      ).filter((p) => p[0] >= origin + 100 && p[0] <= origin + 900);
      expect(shifted).toEqual(first);
    }
  });
  it('uses clock intervals rather than decimal milliseconds', () => {
    const start = Date.UTC(2026, 10, 6, 20),
      ticks = plotTicks([start, start + 7200000], { type: 'time' });
    expect(ticks).toEqual(Array.from({ length: 5 }, (_, i) => start + i * 1800000));
  });
  it('places long-range ticks on calendar month boundaries', () => {
    const ticks = plotTicks([Date.UTC(2026, 0, 10), Date.UTC(2026, 6, 10)], { type: 'time' });
    expect(ticks.length).toBeGreaterThan(1);
    for (const tick of ticks) {
      const date = new Date(tick);
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCHours()).toBe(0);
    }
  });
});
