import type { HeatmapMessages } from './types.js';

/** The English text of every message. */
export const DEFAULT_HEATMAP_MESSAGES: Required<HeatmapMessages> = Object.freeze({
  cell: (_state, value, where) => `${value} on ${where}`,
  where: (state) => [state.rowLabel, state.columnLabel].filter(Boolean).join(', '),
  noValue: 'No data',
  less: 'Less',
  more: 'More',
  levelRange: (level: number, from: string, to: string) =>
    level === 0 ? 'No value' : from === to ? to : `${from} to ${to}`,
  filter: 'Filter by level',
  moreHints: (count: number) => `+${count} more`,
});

export function resolveHeatmapMessages(
  messages: Partial<HeatmapMessages> | undefined,
): Required<HeatmapMessages> {
  return { ...DEFAULT_HEATMAP_MESSAGES, ...messages };
}
