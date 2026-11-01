import { create } from 'storybook/theming';
import { colorSchemeStore, type ColorSchemePreference } from '../src/foundation/color-scheme.js';

/** Storybook's Docs themes; code in the docs (prose, tables, source) uses the library's mono role. */
export const docsThemes = {
  light: create({ base: 'light', fontCode: 'var(--tp-font-mono)' }),
  dark: create({ base: 'dark', fontCode: 'var(--tp-font-mono)' }),
};

/** The Theme toolbar's preference: `system` (the default) follows the device. */
export function themePreference(
  globals: Record<string, unknown> | undefined,
): ColorSchemePreference {
  const value = globals?.theme;
  return value === 'light' || value === 'dark' ? value : 'system';
}

/**
 * Applies the Density toolbar to the preview document through the library's `density` attribute:
 * `compact` selects the compact spacing seed, and every derived extent follows.
 */
export function applyDensity(globals: Record<string, unknown> | undefined): void {
  const root = document.documentElement;
  if (globals?.density === 'compact') root.setAttribute('density', 'compact');
  else root.removeAttribute('density');
}

/**
 * Applies the Appearance toolbar to the preview document through the library's `appearance`
 * attribute: `flat` removes edges and separates components by fill, `default` is the bordered look.
 */
export function applyAppearance(globals: Record<string, unknown> | undefined): void {
  const root = document.documentElement;
  if (globals?.appearance === 'flat') root.setAttribute('appearance', 'flat');
  else root.removeAttribute('appearance');
}

/**
 * Applies a preference to the preview document through the library's color scheme store, so every
 * library element and every `light-dark()` token follows it.
 */
export function applyTheme(preference: ColorSchemePreference): void {
  colorSchemeStore(document.documentElement, { storageKey: null }).set(preference);
}
