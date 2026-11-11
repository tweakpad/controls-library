import type { PresentationDictionary } from '../resolver.js';
import { selectAppearance } from './select.js';
import { floatEdge } from './shared/edges.js';
import { swatchFill } from './shared/swatch.js';

// Widgets Specification Color palette Presentation: the list and labels take the Select recipes;
// the swatch fills are value paint supplied by the widget through `--_tp-color-palette-paint` and
// `--_tp-color-palette-contrast`. The box is sized in medium cells, so only the density of the
// region changes it; the size axis sets the cell and the cells reflow inside the box.

// Cell extents of the sizes: 24, 32 and 42 px at the default density and 16, 24 and 32 px at the
// compact one. Each is linear in the spacing seed (4 px default, 3 px compact), so it follows the
// density of the region exactly.
const CELL = {
  sm: 'calc(var(--tp-spacing) * 8 - 0.5rem)',
  default: 'calc(var(--tp-spacing) * 8)',
  lg: 'calc(var(--tp-spacing) * 10 + 0.125rem)',
} as const;

// A palette narrower than its columns (a constrained host) shrinks its cells to fit: `cqi` resolves
// against the root, an inline-size container.
const extents = (unit: string): Record<string, string> => ({
  '--_tp-color-palette-unit': unit,
  '--_tp-color-palette-cell':
    'min(var(--_tp-color-palette-unit), (100cqi - var(--_tp-color-palette-chrome)) / var(--_tp-color-palette-columns, 9))',
  // A label is one cell tall, so every row of the virtual window has the same extent.
  '--_tp-color-palette-label': 'var(--_tp-color-palette-cell)',
});

const tile = 'var(--tp-space-2)';
const fill = swatchFill('var(--_tp-color-palette-paint, none)', tile);
// The transparency checker of the swatch fill, repeated under a blended palette.
const checker =
  'linear-gradient(45deg, var(--tp-muted) 25%, transparent 25% 75%, var(--tp-muted) 75%)';

export const colorPaletteAppearance: PresentationDictionary = {
  'color-palette': [
    {
      declarations: {
        ...extents(CELL.default),
        '--_tp-color-palette-frame': CELL.default,
        // The list's insets: the same as the toolbar's, on both sides of the centered cells.
        '--_tp-color-palette-chrome': 'calc(var(--tp-space-2) * 2)',
        '--_tp-color-palette-space': 'var(--tp-space-2)',
        color: 'var(--tp-popover-foreground)',
        'font-size': 'var(--tp-text-sm)',
      },
    },
  ],
  'color-palette-size-sm': [
    {
      declarations: extents(CELL.sm),
    },
  ],
  'color-palette-size-lg': [
    {
      declarations: extents(CELL.lg),
    },
  ],
  'color-palette-toolbar': [
    {
      declarations: {
        gap: 'var(--tp-space-1)',
        padding: 'var(--_tp-color-palette-space) var(--_tp-color-palette-space) 0',
      },
    },
  ],
  // The toolbar controls are library components; their recipes style them.
  'color-palette-modes': [],
  'color-palette-collection': [],
  'color-palette-options': [],
  // The listbox marks no focus of its own: only the chosen color is marked.
  'color-palette-list': [{ declarations: { outline: '0' } }],
  'color-palette-group': selectAppearance['select-group']!,
  'color-palette-group-label': [
    ...selectAppearance['select-label']!,
    {
      declarations: {
        padding: '0',
        'font-weight': 'var(--tp-font-medium)',
      },
    },
  ],
  // The cells meet each other and the surface without an edge.
  'color-palette-row': [],
  'color-palette-item': [
    {
      declarations: {
        ...fill,
        color: 'var(--_tp-color-palette-contrast, var(--tp-popover-foreground))',
        border: '0',
        'border-radius': '0',
        outline: '0',
        'font-size': 'var(--tp-text-xs)',
        'line-height': 'var(--tp-leading-tight)',
      },
    },
    // The chosen cell: a white line along its edge and a black one inside it, readable on any
    // fill. Pointer and keyboard highlights draw nothing. A list row hands the mark to its square.
    {
      selector: '&[data-selected]',
      declarations: {
        '--_tp-color-palette-mark':
          'inset 0 0 0 var(--tp-border-width) white, inset 0 0 0 calc(var(--tp-border-width) * 2) black',
        'box-shadow': 'var(--_tp-color-palette-mark)',
      },
    },
    // A palette shown as a gradient: every option paints its own stretch of the palette's
    // row-wide blend over the transparency checker, so the row reads as one gradient.
    {
      selector: "&[data-paint='blend']",
      declarations: {
        'background-image': `var(--_tp-color-palette-blend), ${checker}, ${checker}`,
        'background-size': `var(--_tp-color-palette-blend-size), ${tile} ${tile}, ${tile} ${tile}`,
        'background-position': `var(--_tp-color-palette-blend-x) 0, 0 0, calc(${tile} / 2) calc(${tile} / 2)`,
      },
    },
    {
      selector: "&[data-paint='blend']:dir(rtl)",
      declarations: {
        'background-image': `var(--_tp-color-palette-blend-rtl), ${checker}, ${checker}`,
        'background-position': `var(--_tp-color-palette-blend-x-rtl) 0, 0 0, calc(${tile} / 2) calc(${tile} / 2)`,
      },
    },
    // A list row stays on the surface: its color carries the fill and the mark.
    {
      selector: "&[data-layout='list']",
      declarations: {
        background: 'none',
        'box-shadow': 'none',
        color: 'var(--tp-popover-foreground)',
      },
    },
    {
      selector: '&[data-disabled]',
      declarations: { opacity: 'var(--tp-opacity-disabled)', cursor: 'not-allowed' },
    },
  ],
  // The color of a list row: three cells of the color, marked as a cell is when chosen.
  'color-palette-swatch': [
    {
      declarations: {
        ...swatchFill('var(--_tp-color-palette-swatch-paint, none)', 'var(--tp-space-2)'),
        'box-shadow': 'var(--_tp-color-palette-mark, none)',
      },
    },
  ],
  'color-palette-row-text': [
    { declarations: { color: 'var(--tp-popover-foreground)', 'font-size': 'var(--tp-text-sm)' } },
  ],
  'color-palette-empty': selectAppearance['select-empty-state']!,
  'color-palette-attribution': [
    {
      declarations: {
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        padding: 'var(--tp-space-1-5) var(--_tp-color-palette-space)',
        'border-block-start': `var(--tp-border-width) solid ${floatEdge.color}`,
      },
    },
    { selector: '& a', declarations: { color: 'inherit', 'text-underline-offset': '2px' } },
  ],
};

/** Geometry that a replaced dictionary keeps. */
export const colorPaletteStructure: PresentationDictionary = {
  'color-palette': [],
};
