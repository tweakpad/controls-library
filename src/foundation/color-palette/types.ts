import type { ColorValue, HueFamily } from '../color/index.js';

/** Who made a collection and where it comes from. */
export interface ColorCollectionAttribution {
  /** Name of the author, vendor or source. */
  readonly name?: string;
  /** Page the collection comes from. */
  readonly url?: string;
  /** License the colors are published under. */
  readonly license?: string;
}

/** A named group of a collection, in display order. */
export interface ColorCollectionGroup {
  readonly id: string;
  readonly name?: string;
}

/** A color of a collection with its optional name and group id. */
export interface ColorCollectionSwatch {
  /** Any CSS color text. */
  readonly value: string;
  readonly name?: string;
  /** The id of a declared group. */
  readonly group?: string;
}

/** A collection color: a CSS color text, or a color with a name and group. */
export type ColorCollectionColor = string | ColorCollectionSwatch;

/** The most colors a palette holds; longer palettes keep their first colors. */
export const MAX_PALETTE_STOPS = 12;

/**
 * A preset palette: colors used together, in order, shown as hard stops or blended as a
 * gradient, with optional shares of the palette.
 */
export interface ColorCollectionPalette {
  readonly name?: string;
  /** Two to {@link MAX_PALETTE_STOPS} color texts. */
  readonly colors: readonly string[];
  /** Relative shares, one per color, normalized to their sum; equal shares when absent. */
  readonly weights?: readonly number[];
}

/**
 * A swatch collection document, as JSON or as a typed module: its colors with optional names
 * and groups, preset palettes, and who made it.
 */
export interface ColorCollection {
  readonly $schema?: string;
  readonly id: string;
  readonly name?: string;
  /** What the collection holds and what it is for, in a sentence or two. */
  readonly description?: string;
  /** Who made it: one source, or several, each with its own link and license. */
  readonly attribution?: ColorCollectionAttribution | readonly ColorCollectionAttribution[];
  readonly groups?: readonly ColorCollectionGroup[];
  readonly colors: readonly ColorCollectionColor[];
  readonly palettes?: readonly ColorCollectionPalette[];
}

/** A parsed collection color. */
export interface PaletteSwatch {
  /** Unique within its collection. */
  readonly key: string;
  /** The color text the collection gives, published as the value when picked. */
  readonly value: string;
  readonly name?: string;
  readonly group?: string;
  readonly color: ColorValue;
  /** Position in the document. */
  readonly index: number;
  /** Hex identity, used to match a value to a swatch. */
  readonly identity: string;
}

/** A palette of the collection: swatches in order, with their shares. */
export interface PaletteSet {
  readonly key: string;
  readonly name?: string;
  readonly swatches: readonly PaletteSwatch[];
  /** Shares of the swatches, summing to 1; equal shares when absent. */
  readonly weights?: readonly number[];
}

/** A problem found while parsing a collection, reported as a diagnostic by the widget. */
export interface PaletteIssue {
  readonly code: string;
  readonly message: string;
}

/** A collection with its colors parsed and its presets resolved. */
export interface ResolvedColorCollection {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly attribution?: ColorCollectionAttribution | readonly ColorCollectionAttribution[];
  readonly groups: readonly ColorCollectionGroup[];
  readonly swatches: readonly PaletteSwatch[];
  readonly palettes: readonly PaletteSet[];
  readonly issues: readonly PaletteIssue[];
  /** The document it was resolved from. */
  readonly source: ColorCollection;
}

/** How the grid groups a collection. */
export type PaletteGrouping = 'collection' | 'hue' | 'none';
/** How the grid orders each group: the document order or a perceptual feature. */
export type PaletteSort = 'collection' | 'lightness' | 'hue' | 'chroma';

/** A group of the grid. */
export interface PaletteGroup {
  readonly key: string;
  /** The collection group's name or id; absent for ungrouped colors and flat lists. */
  readonly name?: string;
  /** The hue family of a hue group. */
  readonly family?: HueFamily;
  /** Whether it holds the ungrouped colors of a grouped collection. */
  readonly ungrouped?: boolean;
  readonly swatches: readonly PaletteSwatch[];
}
