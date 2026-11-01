import type { PresentationDeclarations } from '../../resolver.js';

const checkerLayer =
  'linear-gradient(45deg, var(--tp-muted) 25%, transparent 25% 75%, var(--tp-muted) 75%)';

/** The corner of a swatch square (`uwg-te-req-pres-3`). */
export const swatchCorner = 'var(--tp-radius-md)';

/**
 * The custom property through which a swatch publishes its color, opaque, for its edge. A swatch
 * without a color (an empty value) leaves it unset and takes an edge from the foreground.
 */
export const swatchColorProperty = '--_tp-swatch-color';
const swatchColor = `var(${swatchColorProperty}, var(--tp-foreground))`;

/**
 * The edge color of a swatch: its own color moved toward black or white, whichever contrasts with
 * it (`contrast-color()`), so a light color takes a darker edge and a dark color a lighter one, and
 * the edge stays visible on any color in either scheme.
 */
export const swatchEdgeColor = `color-mix(in oklab, ${swatchColor} 60%, contrast-color(${swatchColor}))`;
/** The swatch edge as a border. */
export const swatchEdge = `var(--tp-border-width) var(--tp-border-style) ${swatchEdgeColor}`;
/** The swatch edge as an inset ring, for a fill that covers its own border box. */
export const swatchEdgeRing = `inset 0 0 0 var(--tp-border-width) ${swatchEdgeColor}`;

/**
 * The swatch fill (`uwg-te-req-pres-3`, `uwg-cp-req-pres-2`): `paint`, an `<image>` list that
 * holds the color, over a transparency checker of `tile`-sized squares in the muted role on the
 * background role.
 */
export function swatchFill(paint: string, tile: string): PresentationDeclarations {
  return {
    'background-color': 'var(--tp-background)',
    'background-image': `${paint}, ${checkerLayer}, ${checkerLayer}`,
    'background-size': `auto, ${tile} ${tile}, ${tile} ${tile}`,
    'background-position': `0 0, 0 0, calc(${tile} / 2) calc(${tile} / 2)`,
  };
}
