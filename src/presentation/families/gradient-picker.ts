import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { gradientPickerAppearance } from '../recipes/gradient-picker.js';

/** The gradient picker: one family, axes size and variant. */
const definition: ComponentDefinition = {
  name: 'Gradient picker',
  tagName: 'tp-gradient-picker',
  kind: 'flattening-compound',
  axes: [
    { name: 'size', values: ['sm', 'default'], default: 'default' },
    // linear: stops along a track; field: color anchors placed on a field.
    { name: 'variant', values: ['linear', 'field'], default: 'linear' },
  ],
  parts: [
    {
      name: 'gradient-picker',
      axes: ['size', 'variant'],
      description:
        'The root group named by the label, around the track or the field, its handles and the remove Button.',
    },
    {
      name: 'gradient-picker-track',
      axes: ['size'],
      description: 'The bar painted with a linear gradient over a transparency checker.',
    },
    {
      name: 'gradient-picker-field',
      axes: ['size'],
      description: 'The canvas painted with a field gradient over a transparency checker.',
    },
    {
      name: 'gradient-picker-stop',
      axes: ['size'],
      description:
        "A stop's round handle on the track, or an anchor's on the field, painted in its own color.",
    },
    {
      name: 'gradient-picker-midpoint',
      axes: ['size'],
      description:
        "A midpoint's diamond handle above the track, where its two stops mix half and half.",
    },
    {
      name: 'gradient-picker-remove',
      axes: ['size', 'variant'],
      description:
        'The Button that removes the selected stop: after the track, or floating in a corner of the field.',
    },
  ],
};

export const gradientPickerPresentation = definePresentation({
  definition,
  bindings: {
    'tp-gradient-picker': {
      '[part~="gradient-picker"]': 'gradient-picker',
      '[part~="gradient-picker-track"]': 'gradient-picker-track',
      '[part~="gradient-picker-field"]': 'gradient-picker-field',
      '[part~="gradient-picker-stop"]': 'gradient-picker-stop',
      '[part~="gradient-picker-midpoint"]': 'gradient-picker-midpoint',
      'tp-button.remove': 'gradient-picker-remove',
    },
  },
  sources: [gradientPickerAppearance],
});
