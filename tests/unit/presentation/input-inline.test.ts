import { describe, expect, it } from 'vitest';
import { inputPresentation } from '../../../src/presentation/families/input.js';
import { inputGroupAppearance } from '../../../src/presentation/recipes/input-group.js';
import { resolveComponentPresentation } from '../../../src/presentation/resolver.js';
import {
  inlineControlIcon,
  inlineControlSurface,
  inlineControlUnit,
} from '../../../src/presentation/recipes/shared/inline-control.js';
import { joinedEditor } from '../../../src/presentation/recipes/shared/text-control.js';

const resolve = (variant: string) =>
  resolveComponentPresentation(
    inputPresentation.definition,
    { variant },
    inputPresentation.appearance,
  );

describe('Input inline variant', () => {
  it('resolves every variant key from the dictionary', () => {
    for (const variant of ['default', 'inline'])
      expect(resolve(variant).missingKeys.filter((key) => key.includes('-variant-'))).toEqual([]);
  });

  it('paints the row as the shared inline row, ringing while its value is edited', () => {
    const row = resolve('inline').parts['input-row']!;
    expect(row[0]!.declarations).toMatchObject({ background: inlineControlSurface.background });
    expect(
      row.some(
        (rule) => rule.selector === '&:focus-within:not(:has([part~="input-copy"]:focus-within))',
      ),
    ).toBe(true);
    expect(resolve('default').parts['input-row']).toEqual([]);
  });

  it('joins the editor to the row as an Input group joins its control', () => {
    const editor = resolve('inline').parts.input!;
    expect(editor.some((rule) => rule.declarations === joinedEditor)).toBe(true);
    expect(
      inputGroupAppearance['input-group-control']!.some(
        (rule) => rule.declarations === joinedEditor,
      ),
    ).toBe(true);
  });

  it('mutes the unit and the outside icon, and lets a number value meet its unit', () => {
    const parts = resolve('inline').parts;
    expect(parts['input-unit']![0]!.declarations).toMatchObject(inlineControlUnit);
    expect(parts['input-icon']![0]!.declarations).toEqual(inlineControlIcon);
    expect(
      parts['input']!.find((rule) => rule.selector === '&[type="number"][data-unit]')!.declarations[
        'text-align'
      ],
    ).toBe('end');
    expect(resolve('default').parts['input-unit']).toEqual([]);
  });
});
