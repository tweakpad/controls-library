import {
  calendarMonthLabel,
  startOfWeek,
  type CalendarAdapter,
  type CalendarLabelWidth,
} from '../../foundation/calendar.js';
import { dateTimeFormatter } from '../../foundation/date-locale.js';
import { numberFormatter } from '../../foundation/intl.js';
import type {
  HeatmapAxis,
  HeatmapProjection,
  HeatmapProjectionName,
  HeatmapTick,
  HeatmapUnit,
} from './types.js';

/** The calendar context every date projection resolves through. */
export interface ProjectionContext {
  readonly unit: HeatmapUnit;
  readonly adapter: CalendarAdapter;
  readonly weekStart: number;
  readonly minimalDays: number;
  readonly locale: string | undefined;
  /** A date before every key, from which absolute date projections count their order. */
  readonly origin: string;
}

/** A key of the enumerated range, with its date and hour when its unit has them. */
export interface SequenceKey {
  readonly key: string | number;
  readonly position: number;
  readonly date?: string | undefined;
  readonly hour?: number | undefined;
}

/** Where a key lands on an axis: the tick's id and its place in the axis order. */
export interface ProjectedTick {
  readonly id: string | number;
  readonly order: number;
}

/** The most cells a range enumerates; beyond it the heatmap reports a configuration error. */
export const MAX_HEATMAP_CELLS = 20_000;

const DATE_UNITS: readonly HeatmapUnit[] = ['day', 'hour', 'week', 'month', 'year'];

/** Whether a unit's keys are dates (or date and hour). */
export function isDateUnit(unit: HeatmapUnit): boolean {
  return DATE_UNITS.includes(unit);
}

/** A raw key in the unit's normalized form, or null when it is not one. */
export function normalizeKey(
  raw: unknown,
  context: Pick<ProjectionContext, 'unit' | 'adapter' | 'weekStart'>,
): SequenceKey | null {
  const { unit, adapter } = context;
  if (unit === 'index') {
    const value = typeof raw === 'number' ? raw : Number(raw);
    return Number.isInteger(value) ? { key: value, position: -1 } : null;
  }
  if (unit === 'custom' || (typeof raw !== 'string' && typeof raw !== 'number')) return null;
  const text = String(raw);
  if (unit === 'year') {
    const match = /^(\d{4})$/u.exec(text) ?? /^(\d{4})-/u.exec(text);
    const date = match ? adapter.normalize(`${match[1]}-01-01`) : null;
    return date ? { key: date.slice(0, 4), position: -1, date } : null;
  }
  if (unit === 'month') {
    const match = /^(\d{4})-(\d{2})/u.exec(text);
    const date = match ? adapter.normalize(`${match[1]}-${match[2]}-01`) : null;
    return date ? { key: date.slice(0, 7), position: -1, date } : null;
  }
  const date = adapter.normalize(text.slice(0, 10));
  if (!date) return null;
  if (unit === 'week') {
    const start = startOfWeek(date, context.weekStart, adapter);
    return { key: start, position: -1, date: start };
  }
  if (unit === 'hour') {
    const match = /^.{10}T(\d{2})/u.exec(text);
    const hour = match ? Number(match[1]) : 0;
    if (hour > 23) return null;
    return { key: `${date}T${String(hour).padStart(2, '0')}`, position: -1, date, hour };
  }
  return { key: date, position: -1, date };
}

/** The next key of a date or index unit. */
function advance(key: SequenceKey, context: ProjectionContext): SequenceKey | null {
  const { unit, adapter } = context;
  if (unit === 'index') return { key: (key.key as number) + 1, position: -1 };
  const date = key.date!;
  if (unit === 'hour') {
    const hour = (key.hour ?? 0) + 1;
    return hour > 23
      ? normalizeKey(`${adapter.addDays(date, 1)}T00`, context)
      : normalizeKey(`${date}T${String(hour).padStart(2, '0')}`, context);
  }
  const next =
    unit === 'day'
      ? adapter.addDays(date, 1)
      : unit === 'week'
        ? adapter.addDays(date, 7)
        : unit === 'month'
          ? adapter.addMonths(date, 1)
          : adapter.addYears(date, 1);
  return normalizeKey(unit === 'year' ? next.slice(0, 4) : next, context);
}

function compareKeys(left: SequenceKey, right: SequenceKey, context: ProjectionContext): number {
  if (context.unit === 'index') return (left.key as number) - (right.key as number);
  const days = context.adapter.compare(left.date!, right.date!);
  return days || (left.hour ?? 0) - (right.hour ?? 0);
}

/**
 * The keys from `start` to `end` inclusive, in order; null when the range holds more than
 * `MAX_HEATMAP_CELLS` keys.
 */
export function enumerateRange(
  start: SequenceKey,
  end: SequenceKey,
  context: ProjectionContext,
): SequenceKey[] | null {
  const keys: SequenceKey[] = [];
  let current: SequenceKey | null = start;
  while (current && compareKeys(current, end, context) <= 0) {
    if (keys.length >= MAX_HEATMAP_CELLS) return null;
    keys.push({ ...current, position: keys.length });
    current = advance(current, context);
  }
  return keys;
}

/** The default range of a unit: the period ending `today` that its default arrangement shows. */
export function defaultRange(
  today: string,
  context: ProjectionContext,
): { start: string; end: string } {
  const { adapter, weekStart } = context;
  switch (context.unit) {
    case 'hour':
      return { start: `${adapter.addDays(today, -6)}T00`, end: `${today}T23` };
    case 'week': {
      const end = startOfWeek(today, weekStart, adapter);
      return { start: adapter.addDays(end, -51 * 7), end };
    }
    case 'month':
      return { start: adapter.addMonths(today, -11).slice(0, 7), end: today.slice(0, 7) };
    case 'year':
      return { start: adapter.addYears(today, -9).slice(0, 4), end: today.slice(0, 4) };
    default:
      // The previous 52 weeks and the current, partial, week.
      return {
        start: adapter.addDays(startOfWeek(today, weekStart, adapter), -52 * 7),
        end: today,
      };
  }
}

/** The default projections of a unit's arrangement. */
export function defaultProjections(unit: HeatmapUnit): [HeatmapProjection, HeatmapProjection?] {
  switch (unit) {
    case 'hour':
      return ['day', 'hour-of-day'];
    case 'month':
      return ['month-of-year', 'year'];
    case 'week':
      return ['week'];
    case 'year':
      return ['year'];
    case 'index':
      return ['index'];
    default:
      return ['week', 'weekday'];
  }
}

/** Projections whose ticks form a fixed cycle, all shown even when the range misses some. */
const FULL_CYCLES: Partial<Record<HeatmapProjectionName, number>> = {
  weekday: 7,
  'month-of-year': 12,
  'hour-of-day': 24,
};

/** The units each built-in projection needs. */
const PROJECTION_UNITS: Record<HeatmapProjectionName, readonly HeatmapUnit[]> = {
  year: DATE_UNITS,
  month: ['day', 'hour', 'week', 'month'],
  'month-of-year': ['day', 'hour', 'week', 'month'],
  week: ['day', 'hour', 'week'],
  'week-of-year': ['day', 'hour', 'week'],
  day: ['day', 'hour'],
  'day-of-month': ['day', 'hour'],
  weekday: ['day', 'hour'],
  hour: ['hour'],
  'hour-of-day': ['hour'],
  index: ['day', 'hour', 'week', 'month', 'year', 'index'],
};

/** A configuration error for a projection the unit cannot place, or null. */
export function projectionError(projection: HeatmapProjection, unit: HeatmapUnit): string | null {
  if (typeof projection === 'number')
    return Number.isInteger(projection) && projection > 0 && unit !== 'custom'
      ? null
      : `A wrap count needs a positive integer and a unit with a range, not ${String(projection)} with ${unit}.`;
  if (typeof projection === 'object') return null;
  const units = PROJECTION_UNITS[projection];
  if (!units) return `Unknown projection "${String(projection)}".`;
  return units.includes(unit) ? null : `The ${projection} projection cannot place ${unit} keys.`;
}

/** The fixed cycle length of a projection, when every tick of it shows. */
export function fullCycle(projection: HeatmapProjection): number | undefined {
  return typeof projection === 'string' ? FULL_CYCLES[projection] : undefined;
}

/** Where a key lands on a projection; `wrap` is the other axis's wrap count for a line axis. */
export function project(
  projection: HeatmapProjection | undefined,
  item: SequenceKey,
  context: ProjectionContext,
  wrap: number | undefined,
  rawKey: unknown,
  axisTicks?: ReadonlyMap<string | number, number>,
): ProjectedTick | undefined {
  if (projection === undefined) {
    // The line of a wrapped sequence, or the one line of an arrangement with a single axis.
    const line = wrap === undefined ? 0 : Math.floor(item.position / wrap);
    return { id: line, order: line };
  }
  if (typeof projection === 'number') {
    const column = item.position % projection;
    return { id: column, order: column };
  }
  if (typeof projection === 'object') {
    const id = (projection as HeatmapAxis<unknown>).of(rawKey, item.position);
    if (id === undefined) return undefined;
    const order = axisTicks?.get(id);
    return order === undefined ? undefined : { id, order };
  }
  const { adapter, origin } = context;
  const date = item.date;
  if (projection === 'index') return { id: item.position, order: item.position };
  if (!date) return undefined;
  const parts = adapter.parts(date);
  switch (projection) {
    case 'year':
      return { id: String(parts.year), order: parts.year };
    case 'month':
      return {
        id: adapter.startOfMonth(date).slice(0, 7),
        order: parts.year * 12 + parts.month,
      };
    case 'week': {
      const start = startOfWeek(date, context.weekStart, adapter);
      return { id: start, order: Math.floor(adapter.differenceInDays(start, origin) / 7) };
    }
    case 'day':
      return { id: date, order: adapter.differenceInDays(date, origin) };
    case 'hour':
      return {
        id: String(item.key),
        order: adapter.differenceInDays(date, origin) * 24 + (item.hour ?? 0),
      };
    case 'month-of-year':
      return { id: parts.month, order: parts.month };
    case 'week-of-year': {
      const week =
        adapter.weekNumber?.(date, context.weekStart, context.minimalDays) ??
        Math.floor(
          adapter.differenceInDays(date, `${String(parts.year).padStart(4, '0')}-01-01`) / 7,
        ) + 1;
      return { id: week, order: week };
    }
    case 'day-of-month':
      return { id: parts.day, order: parts.day };
    case 'weekday': {
      const day = adapter.dayOfWeek(date);
      return { id: day, order: (day - context.weekStart + 7) % 7 };
    }
    case 'hour-of-day':
      return { id: item.hour ?? 0, order: item.hour ?? 0 };
  }
}

/** The ticks of a custom axis for a range, in order. */
export function customTicks(
  axis: HeatmapAxis<unknown>,
  range: { unit: HeatmapUnit; start: string | undefined; end: string | undefined },
): readonly HeatmapTick[] {
  return typeof axis.ticks === 'function' ? axis.ticks(range) : axis.ticks;
}

function utcInstant(date: string, adapter: CalendarAdapter, hour = 0): Date {
  const parts = adapter.parts(date);
  const instant = new Date(0);
  instant.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  instant.setUTCHours(hour);
  return instant;
}

/**
 * The text of a tick of a built-in projection in a label form; `date` and `hour` are those of
 * the first key that lands on it. Line and wrap axes have no labels.
 */
export function builtInTickLabel(
  projection: HeatmapProjection | undefined,
  tick: ProjectedTick,
  width: CalendarLabelWidth,
  context: ProjectionContext,
  date: string | undefined,
  hour: number | undefined,
): string {
  const { adapter, locale } = context;
  const number = (value: number) => numberFormatter(locale).format(value);
  if (typeof projection !== 'string') return '';
  if (projection === 'index') return number((tick.id as number) + 1);
  if (projection === 'hour-of-day')
    // The narrow form is the 24-hour number alone, which fits a cell.
    return dateTimeFormatter(
      locale,
      width === 'narrow'
        ? { hour: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }
        : { hour: 'numeric', timeZone: 'UTC' },
    ).format(new Date(Date.UTC(2021, 0, 1, tick.id as number)));
  if (!date) return '';
  switch (projection) {
    case 'year':
      return String(tick.id);
    case 'month':
      return width === 'long'
        ? adapter.format(date, locale, 'month')
        : calendarMonthLabel(adapter, date, locale, width);
    case 'month-of-year':
      return calendarMonthLabel(adapter, date, locale, width);
    case 'week':
    case 'day':
      return width === 'long'
        ? adapter.format(date, locale, 'accessible')
        : dateTimeFormatter(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
            utcInstant(date, adapter),
          );
    case 'hour':
      return dateTimeFormatter(locale, {
        ...(width === 'long' ? { dateStyle: 'full', timeStyle: 'short' } : { hour: 'numeric' }),
        timeZone: 'UTC',
      }).format(utcInstant(date, adapter, hour));
    case 'week-of-year':
    case 'day-of-month':
      return number(tick.id as number);
    case 'weekday':
      return width === 'long'
        ? dateTimeFormatter(locale, { weekday: 'long', timeZone: 'UTC' }).format(
            utcInstant(date, adapter),
          )
        : adapter.weekdayLabel(tick.id as number, locale, width === 'narrow' ? 'narrow' : 'short');
  }
}

/**
 * The coarser group of a tick of a fine absolute projection, whose changes `auto` labels mark:
 * the month of a week or day, the day of an hour; undefined for other projections.
 */
export function changePointGroup(
  projection: HeatmapProjection | undefined,
  date: string | undefined,
  context: ProjectionContext,
): { id: string; label: string } | undefined {
  if (!date || (projection !== 'week' && projection !== 'day' && projection !== 'hour'))
    return undefined;
  const { adapter, locale } = context;
  if (projection === 'hour')
    return {
      id: date,
      label: dateTimeFormatter(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
        utcInstant(date, adapter),
      ),
    };
  const month = adapter.startOfMonth(date);
  return { id: month, label: calendarMonthLabel(adapter, month, locale, 'short') };
}
