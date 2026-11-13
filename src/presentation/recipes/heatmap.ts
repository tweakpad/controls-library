import type { PresentationDictionary } from '../resolver.js';
import { focusRing } from './shared/focus.js';

// Widgets Specification Heatmap Presentation. The size axis sets the cell, the gap and the label
// text; the shape axis the cell radius. Public `--tp-heatmap-*` hooks set on the host win over
// these defaults, which live in private properties so a part never shadows a host write.

const size = (cell: string, gap: string, text: string) => [
  {
    declarations: {
      '--_cell': `var(--tp-heatmap-cell-size, ${cell})`,
      '--_gap': `var(--tp-heatmap-gap, ${gap})`,
      '--_legend-cell': `var(--tp-heatmap-cell-size, ${cell})`,
      'font-size': text,
    },
  },
];

const radius = (value: string) => [
  { declarations: { '--_radius': `var(--tp-heatmap-radius, ${value})` } },
];

/** The cell paint: its level color (level 0 while loading). */
const levelPaint = { background: 'var(--tp-heatmap-level-color)' };

export const heatmapAppearance: PresentationDictionary = {
  heatmap: [
    {
      declarations: {
        gap: 'var(--tp-space-2)',
        color: 'var(--tp-muted-foreground)',
        // The default size, which the size keys replace.
        '--_cell': 'var(--tp-heatmap-cell-size, 0.75rem)',
        '--_gap': 'var(--tp-heatmap-gap, 3px)',
        '--_legend-cell': 'var(--tp-heatmap-cell-size, 0.75rem)',
        'font-size': 'var(--tp-text-xs)',
        '--_empty': 'var(--tp-muted)',
        '--_color': 'var(--tp-heatmap-color, var(--tp-primary))',
        '--_radius': 'var(--tp-heatmap-radius, calc(var(--_cell) / 5))',
      },
    },
  ],
  'heatmap-size-xs': size('0.5rem', '2px', 'calc(var(--tp-text-xs) * 0.875)'),
  'heatmap-size-sm': size('0.625rem', '2px', 'var(--tp-text-xs)'),
  'heatmap-size-default': size('0.75rem', '3px', 'var(--tp-text-xs)'),
  'heatmap-size-lg': size('1rem', '4px', 'var(--tp-text-sm)'),
  'heatmap-shape-square': radius('0px'),
  'heatmap-shape-rounded': radius('max(2px, 20%)'),
  'heatmap-shape-circle': radius('50%'),
  'heatmap-grid': [],
  'heatmap-column-labels': [],
  'heatmap-column-label': [{ declarations: { 'line-height': '1.2' } }],
  'heatmap-row-labels': [],
  'heatmap-row-label': [
    { declarations: { 'padding-inline-end': 'var(--tp-space-1)', 'line-height': '1' } },
  ],
  'heatmap-cell': [
    { declarations: { ...levelPaint, 'border-radius': 'var(--_radius)' } },
    { selector: '&:focus-visible', declarations: focusRing },
    {
      selector: '&[data-selected]',
      declarations: {
        outline: 'var(--tp-ring-width) var(--tp-border-style) var(--tp-foreground)',
        'outline-offset': 'var(--tp-ring-offset)',
      },
    },
    {
      selector: '&[data-disabled]',
      declarations: { opacity: 'var(--tp-opacity-disabled)' },
    },
  ],
  'heatmap-footer': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'heatmap-legend': [{ declarations: { gap: 'calc(var(--_gap) + 1px)' } }],
  'heatmap-legend-cell': [{ declarations: { ...levelPaint, 'border-radius': 'var(--_radius)' } }],
};
