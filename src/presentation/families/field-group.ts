import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { fieldGroupAppearance } from '../recipes/field-group.js';

const definition: ComponentDefinition = {
  name: 'Field group',
  tagName: 'tp-field-group',
  kind: 'preset-composition',
  axes: [
    {
      name: 'orientation',
      values: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    {
      // inline: one compact row with the label at the start and the values at the end.
      name: 'variant',
      values: ['default', 'inline'],
      default: 'default',
    },
  ],
  parts: [
    {
      name: 'field-group',
      description:
        'The joined row or column that holds the editors; in the inline variant, the layout of its row and, expanded, the rows of its values.',
      axes: ['orientation', 'variant'],
    },
    {
      name: 'field-group-row',
      description: 'The row of an inline Field group around its label and, collapsed, its values.',
      axes: ['variant'],
    },
    {
      name: 'field-group-icon',
      description:
        "The box before an inline Field group's row, outside its boundary, that holds the icon slot.",
      axes: ['variant'],
    },
    {
      name: 'field-group-toggle',
      description: "The Button at the end of an expandable inline Field group's row.",
    },
    {
      name: 'field-group-rows',
      description: 'The rows of an expanded inline Field group, one per value, below its row.',
    },
    {
      name: 'field-group-constraint',
      description: 'The bracket beside the rows a constraint relates, around its toggle.',
    },
    {
      name: 'field-group-constraint-toggle',
      description: 'The Toggle that engages and releases a constraint.',
    },
    {
      name: 'field-group-value',
      description: "The native editor of each segment in an inline Field group's row.",
      axes: ['variant'],
    },
    {
      name: 'field-group-label',
      description: "The label at the start of an inline Field group's row.",
      axes: ['variant'],
    },
    {
      name: 'field-group-control',
      description: 'The outer edge of each editor, where neighboring borders meet in a seam.',
      axes: ['orientation'],
    },
    {
      name: 'field-group-separator',
      description: 'A Separator between two editors.',
      axes: ['orientation'],
    },
  ],
};

export const fieldGroupPresentation = definePresentation({
  definition,
  bindings: {
    'tp-field-group': {
      "[part~='field-group']": 'field-group',
      "[part~='field-group-label']": 'field-group-label',
      "[part~='field-group-row']": 'field-group-row',
      "[part~='field-group-icon']": 'field-group-icon',
      "[part~='field-group-toggle']": 'field-group-toggle',
      "[part~='field-group-rows']": 'field-group-rows',
      "[part~='field-group-constraint']": 'field-group-constraint',
      "[part~='field-group-constraint-toggle']": 'field-group-constraint-toggle',
    },
  },
  sources: [fieldGroupAppearance],
});
