import { describe, expect, it } from 'vitest';
import { fieldGroupPresentation } from '../../../src/presentation/families/field-group.js';
import { resolveComponentPresentation } from '../../../src/presentation/resolver.js';
import {
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
    const row = resolve('inline').parts['field-group']!;
    expect(
      row.some((rule) => rule.declarations.background === inlineControlSurface.background),
    ).toBe(true);
    expect(row.some((rule) => rule.selector === '&:focus-within')).toBe(true);
    expect(row.some((rule) => rule.selector === '&[data-invalid]')).toBe(true);
    expect(
      resolve('default').parts['field-group']!.some(
        (rule) => rule.declarations.background === inlineControlSurface.background,
      ),
    ).toBe(false);
  });

  it('mutes the label like the other inline labels, only in the inline variant', () => {
    expect(resolve('inline').parts['field-group-label']![0]!.declarations).toEqual(
      inlineControlLabel,
    );
    expect(resolve('default').parts['field-group-label']).toEqual([]);
  });
});
