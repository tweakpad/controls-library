import { describe, expect, it } from 'vitest';
import { oneTimeCodeFieldPresentation } from '../../../src/presentation/families/one-time-code-field.js';
import { resolveComponentPresentation } from '../../../src/presentation/resolver.js';

const resolve = (variant: string) =>
  resolveComponentPresentation(
    oneTimeCodeFieldPresentation.definition,
    { variant },
    oneTimeCodeFieldPresentation.appearance,
  );

/** The declarations every rule of a part writes for `selector`, merged in order. */
const declared = (variant: string, part: string, selector: string) =>
  Object.assign(
    {},
    ...resolve(variant)
      .parts[part]!.filter((rule) => (rule.selector ?? '&').split(/\s*,\s*/).includes(selector))
      .map((rule) => rule.declarations),
  ) as Record<string, string>;

describe('One-time code field variants', () => {
  it('resolves every variant key from the dictionary', () => {
    for (const variant of ['default', 'underline', 'bubbles'])
      expect(resolve(variant).missingKeys.filter((key) => key.includes('-variant-'))).toEqual([]);
  });

  it('keeps the default as one joined strip per group', () => {
    const slot = declared('default', 'one-time-code-field-slot', '&');
    expect(slot['border-inline-start-width']).toBe('0');
    expect(slot['border-radius']).toBe('0');
    expect(resolve('default').parts['one-time-code-field-group']).toEqual(
      resolve('default').parts['one-time-code-field-group']!.filter((rule) => !rule.selector),
    );
  });

  it('gives an underline slot only a line under its character, on every slot of a group', () => {
    for (const selector of ['&', '&:first-child', '&:last-child']) {
      const slot = declared('underline', 'one-time-code-field-slot', selector);
      expect(slot['border-width'], selector).toBe('0');
      expect(slot['border-block-end-width'], selector).toBe('var(--tp-border-width)');
      expect(slot['border-radius'], selector).toBe('0');
    }
    const active = declared('underline', 'one-time-code-field-slot', '&[data-active]');
    expect(active.outline).toBe('none');
    expect(active['box-shadow']).toContain('var(--tp-ring)');
  });

  it('draws every bubbles slot as a separate circle, and spaces slots and groups apart', () => {
    for (const selector of ['&', '&:first-child', '&:last-child']) {
      const slot = declared('bubbles', 'one-time-code-field-slot', selector);
      expect(slot['border-width'], selector).toBe('var(--tp-border-width)');
      expect(slot['border-radius'], selector).toBe('var(--tp-radius-full)');
    }
    for (const variant of ['underline', 'bubbles']) {
      expect(declared(variant, 'one-time-code-field-group', '&').gap).toBe('var(--tp-space-2)');
      expect(declared(variant, 'one-time-code-field', '&').gap).toBe('var(--tp-space-3)');
    }
  });
});
