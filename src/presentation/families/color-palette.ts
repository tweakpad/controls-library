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
      description: 'The root: the toolbar, the list and the status bar.',
    },
    {
      name: 'color-palette-toolbar',
      axes: ['size'],
      description:
        'The row of the mode Tabs and the view options, whose menu holds the color collections.',
    },
    {
      name: 'color-palette-modes',
      axes: ['size'],
      description: 'The Tabs that switch between the colors, the palettes and the favorites.',
    },
    {
      name: 'color-palette-options',
      axes: ['size'],
      description:
        'The Button that opens the view options: collections, display, grouping and size.',
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
      description: 'One row of colors, or one palette.',
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
      name: 'color-palette-favorite-mark',
      axes: ['size'],
      description:
        'The solid heart that shows briefly in a color or palette row that just became a favorite.',
    },
    {
      name: 'color-palette-status',
      axes: ['size'],
      description:
        'The bar under the list: a copy button, the chosen color in the configured format or the chosen palette, and the source info.',
    },
    {
      name: 'color-palette-favorite-toggle',
      axes: ['size'],
      description:
        'The heart Toggle at the end of the status bar that bookmarks the chosen color or palette.',
    },
    {
      name: 'color-palette-source',
      axes: ['size'],
      description:
        "The info icon at the start of the status bar, whose Tooltip or Preview Card credits the collection's source.",
    },
    {
      name: 'color-palette-attribution',
      axes: ['size'],
      description:
        "The active collection's source and license in the source info's Tooltip, or its source link, description and license in a Preview Card.",
    },
    {
      name: 'color-palette-loading',
      axes: ['size'],
      description:
        "The Spinner and the collection's name in the list's place while the active collection loads.",
    },
    {
      name: 'color-palette-retry',
      axes: ['size'],
      description: 'The Button in the load error that loads the active collection again.',
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
      'tp-button.options': 'color-palette-options',
      '[part~="color-palette-status"]': 'color-palette-status',
      '[part~="color-palette-source"]': 'color-palette-source',
      '[part~="color-palette-favorite-toggle"]': 'color-palette-favorite-toggle',
      '[part~="color-palette-attribution"]': 'color-palette-attribution',
      '[part~="color-palette-loading"]': 'color-palette-loading',
      '[part~="color-palette-retry"]': 'color-palette-retry',
      '[part~="color-palette-list"]': 'color-palette-list',
      '[part~="color-palette-group"]': 'color-palette-group',
      '[part~="color-palette-group-label"]': 'color-palette-group-label',
      '[part~="color-palette-row"]': 'color-palette-row',
      '[part~="color-palette-item"]': 'color-palette-item',
      '.swatch': 'color-palette-swatch',
      '.row-text': 'color-palette-row-text',
    },
  },
  structure: colorPaletteStructure,
  sources: [colorPaletteAppearance],
});
