import { describe, it, expect } from 'vitest';
import { createPlotStream } from '../../../../src/widgets/plot/stream.js';
import { arrayView } from '../../../../src/widgets/plot/geometry.js';
import { plotPoints } from '../../../../src/widgets/plot/decimation.js';
import { PlotDashPhase } from '../../../../src/widgets/plot/dash-phase.js';
describe('Plot bounded data', () => {
  it('accepts arbitrary stable IDs without reading object prototype entries', () => {
    expect(arrayView({}, 'toString').length).toBe(0);
    const s = createPlotStream({ seriesIds: ['__proto__'], xMode: 'index' });
    s.push(Object.fromEntries([['__proto__', 5]]));
    expect(s.snapshot()['__proto__']).toEqual([[0, 5]]);
    s.dispose();
    expect(() => s.appendBatch([])).toThrow();
  });
  it('retains chronological samples with stable identity across wraparound', () => {
    const s = createPlotStream({ seriesIds: ['a'], capacity: 3 });
    for (let i = 0; i < 5; i++) s.append('a', [i, i === 3 ? null : i]);
    expect(s.snapshot()).toEqual({
      a: [
        [2, 2],
        [3, null],
        [4, 4],
      ],
    });
    expect(s.view('a').key?.(0)).toBe(2);
  });
  it('rejects a whole batch atomically, including repeated series and oversized input', () => {
    const s = createPlotStream({ seriesIds: ['a'], maxBatchSize: 2 });
    s.append('a', [1, 1]);
    const revision = s.revision;
    expect(() =>
      s.appendBatch([
        { series: 'a', points: [[2, 2]] },
        { series: 'a', points: [[0, 0]] },
      ]),
    ).toThrow();
    expect(() =>
      s.appendBatch([
        {
          series: 'a',
          points: [
            [2, 2],
            [3, 3],
            [4, 4],
          ],
        },
      ]),
    ).toThrow();
    expect(s.revision).toBe(revision);
    expect(s.snapshot()).toEqual({ a: [[1, 1]] });
  });
  it('pushes synchronized frames, gaps missing series, revises only the latest sample', () => {
    const s = createPlotStream({ seriesIds: ['a', 'b'], xMode: 'index' });
    let calls = 0;
    s.subscribe(() => calls++);
    s.push({ a: 4 });
    s.push({ a: 8, b: 2 });
    const revision = s.revision;
    s.replaceLatest('a', null);
    expect(s.snapshot()).toEqual({
      a: [
        [0, 4],
        [1, null],
      ],
      b: [
        [0, null],
        [1, 2],
      ],
    });
    expect(s.changesSince(revision)).toEqual({ revision: 3, reset: false, firstX: 1 });
    expect(calls).toBe(3);
  });
  it('resets unknown revisions and rejects writes after disposal', () => {
    const s = createPlotStream({ seriesIds: ['a'], xMode: 'index', capacity: 2 });
    for (let i = 0; i < 140; i++) s.push({ a: i });
    expect(s.changesSince(0).reset).toBe(true);
    s.clear();
    expect(s.snapshot()).toEqual({ a: [] });
    s.dispose();
    expect(() => s.push({})).toThrow();
  });
  it('keeps ordered extrema and gaps inside the same device column', () => {
    const points = [
      [0, 0],
      [0.1, 80],
      [0.2, -70],
      [0.3, 5],
      [0.4, null],
      [0.5, 20],
      [1, 0],
    ] as const;
    const result = plotPoints(arrayView({ a: points }, 'a'), [0, 1], 1);
    expect(result).toContainEqual([0.1, 80]);
    expect(result).toContainEqual([0.2, -70]);
    expect(result).toContainEqual([0.4, null]);
    expect(result[0]).toEqual([0, 0]);
  });
  it('preserves authored nonmonotonic order', () => {
    const points = [
      [0, 0],
      [2, 1],
      [1, 4],
    ] as const;
    expect(plotPoints(arrayView({ a: points }, 'a'), [0, 2], 1)).toEqual(points);
  });
  it('bounds dense geometry by pixel columns while retaining a spike and one continuous gap', () => {
    const points = Array.from(
      { length: 10000 },
      (_, i) => [i / 100, i >= 7000 && i < 7100 ? null : i === 5500 ? 1000 : Math.sin(i)] as const,
    );
    const result = plotPoints(arrayView({ a: points }, 'a'), [0, 100], 100);
    expect(result.length).toBeLessThanOrEqual(405);
    expect(result).toContainEqual([55, 1000]);
    expect(result.filter((p) => p[1] === null)).toHaveLength(1);
  });
  it('retracts the latest dash distance without replaying retained history', () => {
    const s = createPlotStream({ seriesIds: ['a'], xMode: 'index', capacity: 3 });
    s.push({ a: 0 });
    s.push({ a: 3 });
    const phase = new PlotDashPhase(),
      view = s.view('a');
    phase.prepare(view, { id: 'a', label: 'A' }, 1, 1, -Infinity, true);
    s.replaceLatest('a', 0);
    phase.prepare(view, { id: 'a', label: 'A' }, 1, 1, 1, false);
    let result = phase.points(view, 0, 1);
    expect(result.offset(result.points[1]!)).toBe(1);
    s.push({ a: 0 });
    s.push({ a: 0 });
    phase.prepare(view, { id: 'a', label: 'A' }, 1, 1, 2, false);
    result = phase.points(view, 1, 3);
    expect(result.offset(result.points.at(-1)!)).toBe(3);
  });
  it('reduces dashed geometry and preserves phase at retained identities with reused tuples', () => {
    const a = [0, 0] as const,
      b = [0, 10] as const,
      view = arrayView({ a: [a, b, a, b, a] }, 'a'),
      phase = new PlotDashPhase();
    phase.prepare(view, { id: 'a', label: 'A' }, 1, 1, -Infinity, true);
    const result = phase.points(view, 0, 1, [0, 1], 1, true);
    expect(result.points).toHaveLength(3);
    expect(result.offset(result.points[0]!)).toBe(0);
    expect(result.offset(result.points.at(-1)!)).toBe(40);
  });
});
