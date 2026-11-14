import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { heatmapAppearance } from '../recipes/heatmap.js';

/** UI Widgets Specification Heatmap: size and shape axes on the root. */
const definition: ComponentDefinition = {
  name: 'Heatmap',
  tagName: 'tp-heatmap',
  kind: 'flattening-compound',
  axes: [
    { name: 'size', values: ['xs', 'sm', 'default', 'lg'], default: 'default' },
    { name: 'shape', values: ['square', 'rounded', 'circle'], default: 'rounded' },
  ],
  parts: [
    {
      name: 'heatmap',
      axes: ['size', 'shape'],
      description: 'The root: the grid, then the legend row.',
    },
    {
      name: 'heatmap-grid',
      description: 'The cells, which form the grid named by `label`.',
    },
    { name: 'heatmap-column-labels', description: 'The strip of column labels above the cells.' },
    {
      name: 'heatmap-column-label',
      description:
        'One column label; a change-point label (a month over week columns) spans to the next one.',
    },
    { name: 'heatmap-row-labels', description: 'The strip of row labels beside the cells.' },
    { name: 'heatmap-row-label', description: 'One row label.' },
    {
      name: 'heatmap-cell',
      description:
        'One cell, painted with `--tp-heatmap-level-color`; `data-level`, `data-empty`, `data-today`, `data-selected`, `data-range-start`, `data-range-middle`, `data-range-end`, `data-disabled`, `data-filtered` (outside the legend filter, painted as empty) and `data-focused` mark its state.',
    },
    {
      name: 'heatmap-footer',
      description: 'The row under the grid: the footer slot, then the legend.',
    },
    {
      name: 'heatmap-legend',
      description:
        'The Less–More legend; with `legend-filter`, its levels are Toggles of a Toggle group.',
    },
    {
      name: 'heatmap-legend-cell',
      description:
        'One level of the legend, painted like a cell of that level; `data-excluded` crosses it out while the legend filter hides its level.',
    },
    { name: 'heatmap-tooltip', description: 'The Tooltip of the hovered or focused cell.' },
  ],
};

export const heatmapPresentation = definePresentation({
  definition,
  bindings: {
    'tp-heatmap': {
      '[part~="heatmap-grid"]': 'heatmap-grid',
      '[part~="heatmap-column-labels"]': 'heatmap-column-labels',
      '[part~="heatmap-column-label"]': 'heatmap-column-label',
      '[part~="heatmap-row-labels"]': 'heatmap-row-labels',
      '[part~="heatmap-row-label"]': 'heatmap-row-label',
      '[part~="heatmap-cell"]': 'heatmap-cell',
      '[part~="heatmap-footer"]': 'heatmap-footer',
      '[part~="heatmap-legend"]': 'heatmap-legend',
      '[part~="heatmap-legend-cell"]': 'heatmap-legend-cell',
    },
  },
  sources: [heatmapAppearance],
});
