import type { ComponentDefinition } from '../definition.js';
import { definePresentation } from '../family.js';
import { colorPaletteAppearance, colorPaletteStructure } from '../recipes/color-palette.js';

/** UI Widgets Specification Color palette: one family, axis size. */
const definition: ComponentDefinition = {
  name: 'Color palette',
  tagName: 'tp-color-palette',
  kind: 'flattening-compound',
  axes: [{ name: 'size', values: ['sm', 'default', 'lg'], default: 'default' }],
  parts: [
    {
      name: 'color-palette',
      axes: ['size'],
      description: 'The root: the toolbar, the list and the attribution.',
    },
    {
      name: 'color-palette-toolbar',
      axes: ['size'],
      description: 'The row of the mode Tabs, the view options and the collection Select.',
    },
    {
      name: 'color-palette-modes',
      axes: ['size'],
      description: 'The Tabs that switch between the colors and the palettes.',
    },
    {
      name: 'color-palette-collection',
      axes: ['size'],
      description: 'The Select of the collections, shown when more than one is given.',
    },
    {
      name: 'color-palette-options',
      axes: ['size'],
      description: 'The Button that opens the Display and Size menu.',
    },
    {
      name: 'color-palette-list',
      axes: ['size'],
      description: 'The listbox of colors, inside the Scroll area that scrolls it; it takes focus.',
    },
    {
      name: 'color-palette-group',
      axes: ['size'],
      description: 'One color group or palette.',
    },
    {
      name: 'color-palette-group-label',
      axes: ['size'],
      description: "A group's label: a color group's name, or a palette's name.",
    },
    {
      name: 'color-palette-row',
      axes: ['size'],
      description: 'One row of gapless colors.',
    },
    {
      name: 'color-palette-item',
      axes: ['size'],
      description: 'One color cell, filled with its color.',
    },
    {
      name: 'color-palette-swatch',
      axes: ['size'],
      description: 'The color at the start of a list row, one cell tall and three cells wide.',
    },
    {
      name: 'color-palette-row-text',
      axes: ['size'],
      description: "A list row's color name, or its HSL text when the color has no name.",
    },
    {
      name: 'color-palette-empty',
      axes: ['size'],
      description: 'The message shown when the collection has no colors.',
    },
    {
      name: 'color-palette-attribution',
      axes: ['size'],
      description: "The active collection's source and license.",
    },
  ],
};

export const colorPalettePresentation = definePresentation({
  definition,
  bindings: {
    'tp-color-palette': {
      '[part~="color-palette"]': 'color-palette',
      '[part~="color-palette-toolbar"]': 'color-palette-toolbar',
      'tp-tabs.modes': 'color-palette-modes',
      'tp-select.collection': 'color-palette-collection',
      'tp-button.options': 'color-palette-options',
      '[part~="color-palette-attribution"]': 'color-palette-attribution',
      '[part~="color-palette-list"]': 'color-palette-list',
      '[part~="color-palette-group"]': 'color-palette-group',
      '[part~="color-palette-group-label"]': 'color-palette-group-label',
      '[part~="color-palette-row"]': 'color-palette-row',
      '[part~="color-palette-item"]': 'color-palette-item',
      '[part~="color-palette-empty"]': 'color-palette-empty',
      '.swatch': 'color-palette-swatch',
      '.row-text': 'color-palette-row-text',
    },
  },
  structure: colorPaletteStructure,
  sources: [colorPaletteAppearance],
});
