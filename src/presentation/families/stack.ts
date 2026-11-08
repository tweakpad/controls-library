import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';

const definition: ComponentDefinition = {
  name: 'Stack',
  tagName: 'tp-stack',
  kind: 'presentational-primitive',
  axes: [],
  parts: [
    {
      name: 'stack-root',
      description: 'The flex container arranging children; also exposed as root.',
    },
  ],
};
export const stackPresentation = definePresentation({ definition });
