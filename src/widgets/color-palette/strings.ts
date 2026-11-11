import type { HueFamily } from '../../foundation/color-palette/index.js';
import type { ColorPaletteStrings } from './types.js';

export const DEFAULT_STRINGS: ColorPaletteStrings = {
  label: 'Colors',
  empty: 'No colors.',
  modes: 'View',
  modeColors: 'Colors',
  modePalettes: 'Palettes',
  collection: 'Collection',
  options: 'View options',
  display: 'Display',
  layoutGrid: 'Grid',
  layoutList: 'List',
  paletteStops: 'Hard stops',
  paletteGradient: 'Gradient',
  groupBy: 'Group by',
  groupsAuto: 'Auto',
  groupsCollection: 'Collection',
  groupsNone: 'None',
  size: 'Size',
  sizeSmall: 'Small',
  sizeMedium: 'Medium',
  sizeLarge: 'Large',
  hsl: 'H: {h} S: {s} L: {l}',
  other: 'Other',
  familyRed: 'Reds',
  familyOrange: 'Oranges',
  familyYellow: 'Yellows',
  familyGreen: 'Greens',
  familyTeal: 'Teals',
  familyBlue: 'Blues',
  familyPurple: 'Purples',
  familyPink: 'Pinks',
  familyNeutral: 'Neutrals',
  palette: 'Palette {number}',
  share: '{share}%',
  license: 'License: {license}',
  valueMissing: 'Please choose a color.',
};

export function resolveStrings(overrides: Partial<ColorPaletteStrings> = {}): ColorPaletteStrings {
  return { ...DEFAULT_STRINGS, ...overrides };
}

export const FAMILY_KEYS: Readonly<Record<HueFamily, keyof ColorPaletteStrings>> = {
  red: 'familyRed',
  orange: 'familyOrange',
  yellow: 'familyYellow',
  green: 'familyGreen',
  teal: 'familyTeal',
  blue: 'familyBlue',
  purple: 'familyPurple',
  pink: 'familyPink',
  neutral: 'familyNeutral',
};
