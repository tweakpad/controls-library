import { describe, expect, it } from 'vitest';
import { gregorianCalendarAdapter as adapter } from '../../../../src/foundation/calendar.js';
import {
  buildHeatmapModel,
  type HeatmapModelInput,
} from '../../../../src/widgets/heatmap/model.js';
import { heatmapLevelScale } from '../../../../src/widgets/heatmap/scale.js';
import type { HeatmapAxis } from '../../../../src/widgets/heatmap/types.js';

const base: HeatmapModelInput = {
  unit: 'day',
  start: undefined,
  end: undefined,
  today: '2026-11-13',
  columns: undefined,
  rows: undefined,
  data: [],
  aggregate: 'sum',
  adapter,
  weekStart: 0,
  minimalDays: 1,
  locale: 'en-US',
  levels: 5,
  scale: 'linear',
  thresholds: undefined,
  domain: undefined,
};

const model = (input: Partial<HeatmapModelInput>) => buildHeatmapModel({ ...base, ...input });

describe('heatmap projections', () => {
  it('defaults to the year ending today as week columns by weekday rows', () => {
    const result = model({});
    expect(result.error).toBeUndefined();
    expect(result.columns).toHaveLength(53);
    expect(result.rows).toHaveLength(7);
    expect(result.rows.map((row) => row.label('short'))).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
    // The current week is partial: Friday the 13th is the last cell.
    expect(result.cells.at(-1)!.id).toBe('2026-11-13');
    expect(result.at(52, 6)).toBeUndefined();
    expect(result.at(52, 5)!.id).toBe('2026-11-13');
  });

  it('honors the week start and transposes to a vertical arrangement', () => {
    const result = model({
      start: '2026-03-04',
      end: '2026-03-20',
      weekStart: 1,
      columns: 'weekday',
      rows: 'week',
    });
    expect(result.columns.map((column) => column.label('narrow'))).toEqual([
      'M',
      'T',
      'W',
      'T',
      'F',
      'S',
      'S',
    ]);
    expect(result.rows).toHaveLength(3);
    // Wednesday March 4 starts the first row; Monday and Tuesday have no cell.
    expect(result.at(0, 0)).toBeUndefined();
    expect(result.at(2, 0)!.id).toBe('2026-03-04');
  });

  it('leaves no cell where a date does not exist (month columns by day of month)', () => {
    const result = model({
      start: '2026-01-01',
      end: '2026-12-31',
      columns: 'month',
      rows: 'day-of-month',
    });
    expect(result.columns).toHaveLength(12);
    expect(result.rows).toHaveLength(31);
    expect(result.columns.map((column) => column.label('narrow')).join('')).toBe('JFMAMJJASOND');
    expect(result.at(1, 28)).toBeUndefined(); // February 29
    expect(result.at(1, 27)!.id).toBe('2026-02-28');
    expect(result.at(3, 30)).toBeUndefined(); // April 31
    expect(result.cells).toHaveLength(365);
  });

  it('aggregates hours onto a weekday by hour-of-day punch card', () => {
    const result = model({
      unit: 'hour',
      start: '2026-03-02T00',
      end: '2026-03-15T23',
      columns: 'hour-of-day',
      rows: 'weekday',
      data: [
        { key: '2026-03-02T09:15', value: 2 },
        { key: '2026-03-09T09', value: 3 },
      ],
    });
    expect(result.columns).toHaveLength(24);
    expect(result.rows).toHaveLength(7);
    expect(result.aggregating).toBe(true);
    const monday9 = result.at(9, 1)!;
    expect(monday9.id).toBe('9:1');
    expect(monday9.value).toBe(5);
    expect(monday9.keys).toHaveLength(2);
  });

  it('wraps a sequence into a square with a wrap count', () => {
    const result = model({ unit: 'index', start: '0', end: '255', columns: 16 });
    expect(result.columns).toHaveLength(16);
    expect(result.rows).toHaveLength(16);
    expect(result.at(15, 15)!.id).toBe('255');
    const vertical = model({ unit: 'index', start: '0', end: '9', rows: 4 });
    expect(vertical.rows).toHaveLength(4);
    expect(vertical.columns).toHaveLength(3);
    expect(vertical.at(2, 1)!.id).toBe('9');
  });

  it('places custom keys on custom axes', () => {
    const services: HeatmapAxis<{ service: string; day: number }> = {
      ticks: [
        { id: 'api', label: 'API' },
        { id: 'web', label: 'Web' },
      ],
      of: (key) => key.service,
    };
    const days: HeatmapAxis<{ service: string; day: number }> = {
      ticks: [1, 2, 3].map((id) => ({ id, label: `Day ${id}` })),
      of: (key) => key.day,
    };
    const result = model({
      unit: 'custom',
      rows: services,
      columns: days,
      data: [{ key: { service: 'web', day: 2 }, value: 4 }],
    });
    expect(result.cells).toHaveLength(6);
    expect(result.at(1, 1)!.value).toBe(4);
    expect(result.rows[1]!.label('short')).toBe('Web');
  });

  it('reports projections the unit cannot place', () => {
    expect(model({ unit: 'index', columns: 'weekday' }).error).toMatch(/weekday/);
  });

  it('marks month change points of week columns', () => {
    const result = model({ start: '2026-01-04', end: '2026-03-07' });
    const groups = result.columns.map((column) => column.group?.label);
    expect(groups[0]).toBe('Jan');
    expect(groups.indexOf('Feb')).toBe(4);
  });
});

describe('heatmap levels', () => {
  it('splits a linear domain into equal steps above zero', () => {
    const scale = heatmapLevelScale({ values: [0, 1, 4, 8], levels: 5, scale: 'linear' });
    expect([null, 0, 1, 2, 3, 4, 8].map(scale.level)).toEqual([0, 0, 1, 1, 2, 2, 4]);
  });

  it('uses explicit thresholds as inclusive lower bounds', () => {
    const scale = heatmapLevelScale({
      values: [],
      levels: 4,
      scale: 'linear',
      thresholds: [1, 5, 10],
    });
    expect([0.5, 1, 5, 9, 10, 99].map(scale.level)).toEqual([0, 1, 2, 2, 3, 3]);
  });

  it('splits positive values into equal counts with quantiles', () => {
    const scale = heatmapLevelScale({
      values: [1, 2, 3, 4, 100],
      levels: 3,
      scale: 'quantile',
    });
    expect(scale.level(1)).toBe(1);
    expect(scale.level(100)).toBe(2);
  });

  it('uses an explicit datum level', () => {
    const result = model({ data: [{ key: '2026-11-13', value: 1, level: 3 }] });
    expect(result.byId.get('2026-11-13')!.level).toBe(3);
  });
});
