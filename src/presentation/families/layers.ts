import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { layersAppearance } from '../recipes/layers.js';

/** UI Widgets Specification Layers: one family, no axes. */
const definition: ComponentDefinition = {
  name: 'Layers',
  tagName: 'tp-layers',
  kind: 'flattening-compound',
  axes: [],
  parts: [
    { name: 'layers', description: 'The root: the header, the list of layers and the footer.' },
    { name: 'layers-header', description: 'The bar above the list that holds the header slot.' },
    {
      name: 'layers-tree',
      description:
        'The Tree view of the layers; its rows, indicators and reorder handles are its own parts.',
    },
    { name: 'layers-footer', description: 'The bar below the list that holds the footer slot.' },
    {
      name: 'layers-empty',
      description: "The empty slot's container, shown while there are no layers.",
    },
    {
      name: 'layers-icon',
      description:
        "A layer's icon, or what `renderLayer` draws, before its label; `data-dimmed` while dimmed.",
    },
    { name: 'layers-label', description: "A layer's label; `data-dimmed` while dimmed." },
    { name: 'layers-rename', description: 'The inline Input that renames a layer.' },
    { name: 'layers-states', description: "The state controls at the end of a layer's row." },
    {
      name: 'layers-state',
      description:
        "One state's control, a Button showing the current value's icon; `data-layer-state` names the state, `data-value` the value and `data-display` whether it shows only on the row's hover or focus.",
    },
  ],
};

export const layersPresentation = definePresentation({
  definition,
  bindings: {
    'tp-layers': {
      '[part~="layers"]': 'layers',
      '[part~="layers-header"]': 'layers-header',
      '[part~="layers-tree"]': 'layers-tree',
      '[part~="layers-footer"]': 'layers-footer',
      '[part~="layers-empty"]': 'layers-empty',
    },
  },
  sources: [layersAppearance],
});
