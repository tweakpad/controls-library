/**
 * Density modes of the token set. A `density` region selects the spacing and type scale seeds of
 * its mode, and every role derived from them re-resolves for the region and its descendants, so
 * compact and default regions nest in one document. The default stylesheet states the same
 * declarations for document regions; library elements carry them on their host.
 */

/** A density mode: `default` restores the theme's own seed inside a `compact` region. */
export type Density = 'default' | 'compact';

/** The roles derived from the spacing and type scale seeds, with the declaration each re-resolves from. */
export const DENSITY_DERIVED_ROLES: readonly (readonly [name: string, value: string])[] = [
  ['--tp-space-0-5', 'calc(var(--tp-spacing) * 0.5)'],
  ['--tp-space-1', 'calc(var(--tp-spacing) * 1)'],
  ['--tp-space-1-5', 'calc(var(--tp-spacing) * 1.5)'],
  ['--tp-space-2', 'calc(var(--tp-spacing) * 2)'],
  ['--tp-space-2-5', 'calc(var(--tp-spacing) * 2.5)'],
  ['--tp-space-3', 'calc(var(--tp-spacing) * 3)'],
  ['--tp-space-4', 'calc(var(--tp-spacing) * 4)'],
  ['--tp-space-5', 'calc(var(--tp-spacing) * 5)'],
  ['--tp-space-6', 'calc(var(--tp-spacing) * 6)'],
  ['--tp-space-8', 'calc(var(--tp-spacing) * 8)'],
  ['--tp-space-10', 'calc(var(--tp-spacing) * 10)'],
  ['--tp-space-12', 'calc(var(--tp-spacing) * 12)'],
  ['--tp-space-16', 'calc(var(--tp-spacing) * 16)'],
  ['--tp-control-height-xs', 'calc(var(--tp-spacing) * 6)'],
  ['--tp-control-height-sm', 'calc(var(--tp-spacing) * 7)'],
  ['--tp-control-height-md', 'calc(var(--tp-spacing) * 8)'],
  ['--tp-control-height-lg', 'calc(var(--tp-spacing) * 9)'],
  ['--tp-icon-size-xs', 'calc(var(--tp-spacing) * 3)'],
  ['--tp-icon-size-sm', 'calc(var(--tp-spacing) * 3.5)'],
  ['--tp-icon-size-md', 'calc(var(--tp-spacing) * 4)'],
  ['--tp-icon-size-lg', 'calc(var(--tp-spacing) * 5)'],
  ['--tp-ring-offset', 'calc(var(--tp-spacing) / 2)'],
  ['--tp-shadow-sm', '0 calc(var(--tp-spacing) / 4) var(--tp-space-1) rgb(0 0 0 / 16%)'],
  ['--tp-shadow-md', '0 var(--tp-space-1) var(--tp-space-5) rgb(0 0 0 / 18%)'],
  ['--tp-shadow-lg', '0 var(--tp-space-3) var(--tp-space-12) rgb(0 0 0 / 20%)'],
  ['--tp-text-xs', 'calc(0.75rem * var(--tp-type-scale))'],
  ['--tp-text-sm', 'calc(0.875rem * var(--tp-type-scale))'],
  ['--tp-text-base', 'calc(1rem * var(--tp-type-scale))'],
  ['--tp-text-lg', 'calc(1.125rem * var(--tp-type-scale))'],
  ['--tp-text-xl', 'calc(1.25rem * var(--tp-type-scale))'],
  ['--tp-text-2xl', 'calc(1.5rem * var(--tp-type-scale))'],
];

/** The derived roles as CSS declarations, for a rule that starts a density region. */
export const densityDerivedDeclarations = (): string =>
  DENSITY_DERIVED_ROLES.map(([name, value]) => `${name}: ${value};`).join('\n');
