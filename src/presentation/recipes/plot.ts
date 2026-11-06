import type { PresentationDictionary } from '../resolver.js';
import { dataVisualizationAppearance } from './data-visualization.js';
import { divider } from './shared/edges.js';
/** Shared chart metadata treatment and replaceable Plot surface paint. */
export const plotAppearance: PresentationDictionary = {
  plot: dataVisualizationAppearance['data-visualization']!,
  'plot-size-sm': [
    { declarations: { gap: 'var(--tp-space-2)', 'font-size': 'var(--tp-text-xs)' } },
  ],
  'plot-size-lg': [
    { declarations: { gap: 'var(--tp-space-5)', 'font-size': 'var(--tp-text-base)' } },
  ],
  'plot-legend': dataVisualizationAppearance['data-visualization-legend']!,
  'plot-series': [],
  'plot-label': [{ declarations: { 'font-weight': 'var(--tp-font-medium)' } }],
  'plot-description': [{ declarations: { color: 'var(--tp-muted-foreground)' } }],
  'plot-empty': [{ declarations: { color: 'var(--tp-muted-foreground)' } }],
  'plot-inspection': dataVisualizationAppearance['data-visualization-inspection-surface']!,
  'plot-surface': [
    {
      declarations: {
        '--tp-plot-surface': 'var(--tp-muted)',
        '--tp-plot-grid': divider.color,
        '--tp-plot-guide': 'var(--tp-muted-foreground)',
        'border-radius': 'var(--tp-radius-md)',
      },
    },
  ],
};
