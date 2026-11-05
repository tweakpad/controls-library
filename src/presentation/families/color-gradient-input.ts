import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { colorGradientInputAppearance } from '../recipes/color-gradient-input.js';

/** The gradient stop editor: one family, axis size. */
const definition: ComponentDefinition = {
  name: 'Color gradient input',
  tagName: 'tp-color-gradient-input',
  kind: 'flattening-compound',
  axes: [{ name: 'size', values: ['sm', 'default'], default: 'default' }],
  parts: [
    {
      name: 'color-gradient-input',
      axes: ['size'],
      description:
        'The root group named by the label, around the track, its handles and the remove Button.',
    },
    {
      name: 'color-gradient-input-track',
      axes: ['size'],
      description: 'The bar painted with the gradient over a transparency checker.',
    },
    {
      name: 'color-gradient-input-stop',
      axes: ['size'],
      description: "A stop's round handle on the track, painted in the stop's color.",
    },
    {
      name: 'color-gradient-input-midpoint',
      axes: ['size'],
      description:
        "A midpoint's diamond handle above the track, where its two stops mix half and half.",
    },
    {
      name: 'color-gradient-input-remove',
      axes: ['size'],
      description: 'The Button that removes the selected stop.',
    },
  ],
};

export const colorGradientInputPresentation = definePresentation({
  definition,
  bindings: {
    'tp-color-gradient-input': {
      '[part~="color-gradient-input"]': 'color-gradient-input',
      '[part~="color-gradient-input-track"]': 'color-gradient-input-track',
      '[part~="color-gradient-input-stop"]': 'color-gradient-input-stop',
      '[part~="color-gradient-input-midpoint"]': 'color-gradient-input-midpoint',
      'tp-button.remove': 'color-gradient-input-remove',
    },
  },
  sources: [colorGradientInputAppearance],
});
