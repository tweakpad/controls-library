import { gregorianCalendarAdapter as adapter } from '../../foundation/calendar.js';
import type { HeatmapDatum } from '../../widgets/heatmap/types.js';

/** A small seeded generator, so a sample is the same on every render of the same day. */
function seeded(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    return ((state ^= state >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Daily focus sessions over the year ending `today`: quiet weekends, busier weekdays, a few
 * streaks and some days off.
 */
export function focusSessions(today: string, days = 371): HeatmapDatum<string>[] {
  const random = seeded(`focus:${today}`);
  const data: HeatmapDatum<string>[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const key = adapter.addDays(today, -offset);
    const weekday = adapter.dayOfWeek(key);
    const weekend = weekday === 0 || weekday === 6;
    const roll = random();
    if (roll < (weekend ? 0.7 : 0.25)) continue;
    const value = Math.max(1, Math.round(random() ** 2 * (weekend ? 4 : 9)));
    data.push({ key, value });
  }
  return data;
}

/** Release days with a hint each, for the tooltip examples. */
export function releaseHints(today: string): HeatmapDatum<string>[] {
  const names = ['Atlas', 'Birch', 'Cedar', 'Dune', 'Ember', 'Fjord'];
  return names.map((name, index) => ({
    key: adapter.addDays(today, -index * 23 - 4),
    value: 6 + (index % 3) * 2,
    hint: `Release ${name} shipped`,
  }));
}

/** Hourly check-ins for the two weeks ending `today`, busiest mid-morning on weekdays. */
export function hourlyCheckIns(today: string): HeatmapDatum<string>[] {
  const random = seeded(`hours:${today}`);
  const data: HeatmapDatum<string>[] = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = adapter.addDays(today, -offset);
    const weekend = [0, 6].includes(adapter.dayOfWeek(date));
    for (let hour = 7; hour < 21; hour += 1) {
      const peak = Math.exp(-((hour - 10.5) ** 2) / 8) + 0.6 * Math.exp(-((hour - 15) ** 2) / 6);
      const value = Math.round(peak * (weekend ? 2 : 6) * random());
      if (value > 0) data.push({ key: `${date}T${String(hour).padStart(2, '0')}`, value });
    }
  }
  return data;
}

/** Values for a plain sequence of `count` cells. */
export function sequenceValues(count: number, seed = 'sequence'): HeatmapDatum<number>[] {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, key) => ({
    key,
    value: Math.round(random() ** 1.6 * 10),
  }));
}
