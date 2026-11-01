/**
 * Appearance modes of the token set. The default mode draws edges around components and panels;
 * the flat mode removes them and separates components by fill. A mode redefines only role values,
 * so `flat` and `default` regions nest in one document. The default stylesheet states the same
 * declarations for document regions; library elements carry them on their host.
 */

/** An appearance mode: `default` restores the bordered look inside a `flat` region. */
export type Appearance = 'default' | 'flat';

/**
 * The roles the flat mode redefines, with their flat value. Panels take a fill a step from the
 * page, and controls, checkboxes and radios included, a step from panels; nothing keeps an edge, and
 * status fills keep their tint without one.
 */
export const FLAT_ROLES: readonly (readonly [name: string, value: string])[] = [
  ['--tp-edge', 'transparent'],
  ['--tp-input', 'transparent'],
  ['--tp-card', 'color-mix(in oklab, var(--tp-foreground) 4%, var(--tp-background))'],
  ['--tp-control', 'color-mix(in oklab, var(--tp-foreground) 10%, var(--tp-card))'],
  ['--tp-control-strong', 'color-mix(in oklab, var(--tp-foreground) 15%, var(--tp-card))'],
  ['--tp-control-border', 'transparent'],
  ['--tp-choice', 'var(--tp-primary)'],
  ['--tp-choice-foreground', 'var(--tp-primary)'],
  ['--tp-joined-edge-width', 'var(--tp-border-width-strong)'],
  ['--tp-primary-border', 'transparent'],
  ['--tp-destructive-border', 'transparent'],
  ['--tp-success-border', 'transparent'],
  ['--tp-warning-border', 'transparent'],
];

/** The flat values as CSS declarations, for a rule that starts a flat region. */
export const flatDeclarations = (): string =>
  FLAT_ROLES.map(([name, value]) => `${name}: ${value};`).join('\n');

/**
 * Declarations that restore the default values inside a flat region, from the copies the default
 * stylesheet keeps on the root (`--_tp-<role>-default`).
 */
export const appearanceDefaultDeclarations = (): string =>
  FLAT_ROLES.map(([name]) => `${name}: var(--_${name.slice(2)}-default);`).join('\n');
