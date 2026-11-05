import { describe, expect, it } from 'vitest';
import { fieldGroupPresentation } from '../../../src/presentation/families/field-group.js';
import { resolveComponentPresentation } from '../../../src/presentation/resolver.js';
import {
  inlineControlIcon,
  inlineControlLabel,
  inlineControlSurface,
} from '../../../src/presentation/recipes/shared/inline-control.js';

const resolve = (variant: string) =>
  resolveComponentPresentation(
    fieldGroupPresentation.definition,
    { variant, orientation: 'horizontal' },
    fieldGroupPresentation.appearance,
  );

describe('Field group inline variant', () => {
  it('resolves every variant key from the dictionary', () => {
    for (const variant of ['default', 'inline'])
      expect(resolve(variant).missingKeys.filter((key) => key.includes('-variant-'))).toEqual([]);
  });

  it('paints the row as the shared inline row, ringing on focus within and while invalid', () => {
    const row = resolve('inline').parts['field-group-row']!;
    expect(
      row.some((rule) => rule.declarations.background === inlineControlSurface.background),
    ).toBe(true);
    expect(row.some((rule) => rule.selector?.startsWith('&:focus-within'))).toBe(true);
    expect(row.some((rule) => rule.selector === '&[data-invalid]')).toBe(true);
    // The group only lays out its row and the expanded rows; it paints nothing itself.
    for (const variant of ['default', 'inline'])
      expect(
        resolve(variant).parts['field-group']!.some(
          (rule) => rule.declarations.background === inlineControlSurface.background,
        ),
      ).toBe(false);
    expect(resolve('default').parts['field-group-row']).toEqual([]);
  });

  it('keeps the expand Button out of the row ring and insets it like a trailing chevron', () => {
    const row = resolve('inline').parts['field-group-row']!;
    expect(row.find((rule) => rule.selector?.startsWith('&:focus-within'))!.selector).toContain(
      'field-group-toggle',
    );
    expect(row.some((rule) => rule.selector === '&[data-expandable]')).toBe(true);
  });

  it('mutes the icon and draws constraint brackets without edge roles, so flat mode keeps them', () => {
    expect(resolve('inline').parts['field-group-icon']![0]!.declarations).toEqual(
      inlineControlIcon,
    );
    const bracket = resolve('inline').parts['field-group-constraint']![0]!.declarations;
    expect(bracket['border-color']).toContain('--tp-muted-foreground');
  });

  it('mutes the label like the other inline labels, only in the inline variant', () => {
    expect(resolve('inline').parts['field-group-label']![0]!.declarations).toEqual(
      inlineControlLabel,
    );
    expect(resolve('default').parts['field-group-label']).toEqual([]);
  });
});
