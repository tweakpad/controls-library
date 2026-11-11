/** How the active collection is presented: its colors, or its palettes. */
export type ColorPaletteMode = 'colors' | 'palettes';
/** How a palette shows its colors: hard stops side by side, or blended as one gradient. */
export type ColorPalettePaletteStyle = 'stops' | 'gradient';
export type ColorPaletteSize = 'sm' | 'default' | 'lg';
/** How the colors mode shows its colors: cells in rows, or one row per color with its name. */
export type ColorPaletteLayout = 'grid' | 'list';

/** A listed color: the picked or highlighted swatch with where it is listed. */
export interface ColorPaletteSwatchInfo {
  /** The color text the collection gives; the value when picked. */
  readonly value: string;
  readonly name?: string;
  /** The collection group id. */
  readonly group?: string;
  /** The palette it is listed in, in the palettes mode. */
  readonly set?: { readonly name: string };
  /** Its share of its palette, 0–1. */
  readonly share?: number;
}

/** Metadata of a value proposal. */
export interface ColorPaletteChangeMetadata {
  readonly [key: string]: unknown;
  readonly swatch?: ColorPaletteSwatchInfo;
  /** Id of the active collection. */
  readonly collection?: string;
}

/** Texts of the widget, replaceable through `strings` for localization. */
export interface ColorPaletteStrings {
  label: string;
  empty: string;
  modes: string;
  modeColors: string;
  modePalettes: string;
  collection: string;
  options: string;
  display: string;
  layoutGrid: string;
  layoutList: string;
  paletteStops: string;
  paletteGradient: string;
  groupBy: string;
  groupsAuto: string;
  groupsCollection: string;
  groupsNone: string;
  size: string;
  sizeSmall: string;
  sizeMedium: string;
  sizeLarge: string;
  /** The text of an unnamed color in the list layout. */
  hsl: string;
  other: string;
  familyRed: string;
  familyOrange: string;
  familyYellow: string;
  familyGreen: string;
  familyTeal: string;
  familyBlue: string;
  familyPurple: string;
  familyPink: string;
  familyNeutral: string;
  palette: string;
  share: string;
  license: string;
  valueMissing: string;
}
