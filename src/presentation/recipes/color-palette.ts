import { floatEdge } from './shared/edges.js';
import type { PresentationDictionary } from '../resolver.js';
import { selectAppearance } from './select.js';
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
/**
 * A color chip in its cell: half the gap as a transparent border, the fill clipped inside it, and
 * the outer radius grown by that border so the fill keeps the chip radius.
 */
const chip = {
  border: 'var(--_tp-color-palette-chip-border) solid transparent',
  'border-radius':
    'calc(var(--_tp-color-palette-chip-radius) + var(--_tp-color-palette-chip-border))',
  'background-clip': 'padding-box',
};
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
        // Color chips: rounded and apart by a gap, or gapless squares in a flat region
        // (`--_tp-color-palette-flat`, set by the widget from the appearance). Each chip keeps its
        // cell: half the gap is a transparent border around its fill.
        '--_tp-color-palette-chip-gap':
          'calc(var(--tp-space-1) * (1 - var(--_tp-color-palette-flat, 0)))',
        '--_tp-color-palette-chip-radius':
          'calc(var(--tp-radius-sm) * (1 - var(--_tp-color-palette-flat, 0)))',
        '--_tp-color-palette-chip-border': 'calc(var(--_tp-color-palette-chip-gap) / 2)',
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
        padding: 'var(--_tp-color-palette-space)',
      },
    },
  ],
  // The toolbar controls are library components; their recipes style them.
  'color-palette-modes': [],
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
    // A favorites section heads the named palettes below it, so it reads stronger than they do.
    { selector: '&[data-section]', declarations: { color: 'var(--tp-popover-foreground)' } },
  ],
  // The cells meet each other and the surface without an edge. A selected palette row carries the
  // selection mark around the whole palette, drawn over its colors.
  'color-palette-row': [
    {
      selector: '&[data-selected]',
      declarations: {
        '--_tp-color-palette-mark':
          'inset 0 0 0 var(--tp-border-width) white, inset 0 0 0 calc(var(--tp-border-width) * 2) black',
      },
    },
  ],
  'color-palette-item': [
    {
      declarations: {
        ...fill,
        ...chip,
        color: 'var(--_tp-color-palette-contrast, var(--tp-popover-foreground))',
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
    // A color of a palette leaves the selection mark to its row.
    { selector: '&[data-selected][data-member]', declarations: { 'box-shadow': 'none' } },
    // A palette shown as a gradient: every option paints its own stretch of the palette's
    // row-wide blend over the transparency checker, so the row reads as one gradient; the row is
    // the one chip, so its stretches meet without a gap.
    {
      selector: "&[data-paint='blend']",
      declarations: {
        border: '0',
        'border-radius': '0',
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
        ...chip,
        'box-shadow': 'var(--_tp-color-palette-mark, none)',
      },
    },
  ],
  'color-palette-row-text': [
    { declarations: { color: 'var(--tp-popover-foreground)', 'font-size': 'var(--tp-text-sm)' } },
  ],
  // The status bar under the list: the chosen color's text in the configured format, its name
  // muted, and the source info at the end.
  'color-palette-status': [
    {
      declarations: {
        gap: 'var(--tp-space-1-5)',
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        padding: 'var(--tp-space-1) var(--_tp-color-palette-space)',
        'border-block-start': `var(--tp-border-width) solid ${floatEdge.color}`,
      },
    },
    {
      selector: '& .status-value',
      declarations: {
        color: 'var(--tp-popover-foreground)',
        'font-family': 'var(--tp-font-mono)',
      },
    },
  ],
  // The heart toggle: a dimmed outline until the choice is a favorite, then the solid heart.
  'color-palette-favorite-toggle': [
    { selector: '& .dim', declarations: { color: 'var(--tp-muted-foreground)' } },
  ],
  'color-palette-source': [{ declarations: { color: 'var(--tp-muted-foreground)' } }],
  // The source info's text: in a Tooltip the source, then its license; in the Preview Card of a
  // described collection the source (a link when it has one), the description and the license.
  'color-palette-attribution': [
    { declarations: { display: 'grid' } },
    {
      selector: '& a, & .source-name',
      declarations: {
        color: 'inherit',
        'font-weight': 'var(--tp-font-medium)',
        'text-underline-offset': '2px',
      },
    },
    { selector: '& .source-description', declarations: { color: 'var(--tp-muted-foreground)' } },
    {
      selector: '& .source-license',
      declarations: { color: 'var(--tp-muted-foreground)', 'font-size': 'var(--tp-text-xs)' },
    },
  ],
  'color-palette-loading': [],
  'color-palette-retry': [],
};

/** Geometry that a replaced dictionary keeps. */
export const colorPaletteStructure: PresentationDictionary = {
  'color-palette': [],
};
