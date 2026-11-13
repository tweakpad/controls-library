import { describe, expect, it } from 'vitest';
import {
  calendarMonthLabel,
  calendarWeeks,
  gregorianCalendarAdapter as adapter,
  localeWeekInfo,
  matchesCalendarDate,
  resolveWeekStart,
  startOfWeek,
} from '../../../src/foundation/calendar.js';
import { gridKeyMove, rowEdgeCell, stepGridCell } from '../../../src/foundation/grid-navigation.js';

describe('shared date grid services', () => {
  it('resolves the week start from the locale unless one is set', () => {
    expect(resolveWeekStart(-1, 'en-US')).toBe(0);
    expect(resolveWeekStart(-1, 'de-DE')).toBe(1);
    expect(resolveWeekStart(3, 'de-DE')).toBe(3);
    expect(localeWeekInfo('de-DE').firstDay).toBe(1);
  });

  it('labels months in long, short and narrow forms', () => {
    expect(calendarMonthLabel(adapter, '2026-03-04', 'en-US', 'long')).toBe('March');
    expect(calendarMonthLabel(adapter, '2026-03-04', 'en-US', 'short')).toBe('Mar');
    expect(calendarMonthLabel(adapter, '2026-03-04', 'en-US', 'narrow')).toBe('M');
  });

  it('enumerates the complete weeks of a range', () => {
    expect(startOfWeek('2026-03-04', 1, adapter)).toBe('2026-03-02');
    const weeks = calendarWeeks('2026-03-04', '2026-03-16', 1, adapter);
    expect(weeks).toHaveLength(3);
    expect(weeks[0]![0]).toBe('2026-03-02');
    expect(weeks[2]![6]).toBe('2026-03-22');
  });

  it('matches dates by set or predicate', () => {
    expect(matchesCalendarDate(new Set(['2026-03-04']), '2026-03-04')).toBe(true);
    expect(matchesCalendarDate((date) => date.endsWith('05'), '2026-03-04')).toBe(false);
    expect(matchesCalendarDate(undefined, '2026-03-04')).toBe(false);
  });

  it('reads grid key commands, mirrored in right-to-left', () => {
    const key = (key: string, init: KeyboardEventInit = {}) =>
      ({ key, ctrlKey: false, metaKey: false, shiftKey: false, ...init }) as KeyboardEvent;
    expect(gridKeyMove(key('ArrowRight'), false)).toEqual({ kind: 'step', columns: 1, rows: 0 });
    expect(gridKeyMove(key('ArrowRight'), true)).toEqual({ kind: 'step', columns: -1, rows: 0 });
    expect(gridKeyMove(key('Home', { ctrlKey: true }), false)).toEqual({
      kind: 'grid',
      edge: 'start',
    });
    expect(gridKeyMove(key('PageDown', { shiftKey: true }), false)).toEqual({
      kind: 'page',
      direction: 1,
      large: true,
    });
    expect(gridKeyMove(key('a'), false)).toBeNull();
  });

  it('walks a sparse grid past absent cells', () => {
    const present = new Set(['0,0', '3,0', '1,1']);
    const grid = {
      columns: 4,
      rows: 2,
      present: (c: number, r: number) => present.has(`${c},${r}`),
    };
    expect(stepGridCell(grid, 0, 0, 1, 0)).toEqual({ column: 3, row: 0 });
    expect(stepGridCell(grid, 3, 0, 1, 0)).toBeNull();
    expect(rowEdgeCell(grid, 'end', 1)).toEqual({ column: 1, row: 1 });
  });
});
