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
        'The joined row or column that holds the editors; in the inline variant, the row around the label and the values.',
      axes: ['orientation', 'variant'],
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
    },
  },
  sources: [fieldGroupAppearance],
});
