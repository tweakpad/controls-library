import { describe, expect, it } from 'vitest';
import {
  normalizeStackValue,
  stackAttributeConverter,
  stackDefaults,
  stackLayoutCss,
} from '../../../../src/components/stack/config.js';
describe('Stack responsive configuration', () => {
  it('keeps valid sparse entries in breakpoint order and rejects invalid entries', () => {
    const errors: string[] = [];
    expect(
      normalizeStackValue(
        'direction',
        { lg: 'row', sm: 'invalid', xs: 'column', typo: 'row' },
        (e) => errors.push(e),
      ),
    ).toEqual({ xs: 'column', lg: 'row' });
    expect(errors).toHaveLength(2);
  });
  it('restores defaults and rejects arbitrary lengths and arrays', () => {
    expect(normalizeStackValue('gap', null, () => {})).toBe(0);
    expect(normalizeStackValue('gap', '1.5', () => {})).toBe(1.5);
    for (const value of ['8px', -1, Infinity, [], 7])
      expect(normalizeStackValue('gap', value, () => {})).toBe(0);
  });
  it('converts JSON attributes without throwing on malformed input', () => {
    expect(stackAttributeConverter.fromAttribute('{"sm":"row"}')).toEqual({ sm: 'row' });
    expect(stackAttributeConverter.fromAttribute('{broken')).toBe('{broken');
    expect(stackAttributeConverter.fromAttribute(null)).toBeUndefined();
  });
  it('generates self-container rules with defaults below a sparse breakpoint', () => {
    const css = stackLayoutCss({
      ...stackDefaults,
      direction: { md: 'row' },
      gap: { xs: 1.5, sm: 4 },
    });
    expect(css).toContain('container:tp-stack / inline-size');
    expect(css).toContain('flex-direction:column');
    expect(css).toContain('var(--tp-space-1-5)');
    expect(css.indexOf('inline-size >= 30rem')).toBeLessThan(css.indexOf('inline-size >= 48rem'));
    expect(css).toContain('@container tp-stack (inline-size >= 48rem){.root{flex-direction:row;}}');
  });
  it('does not introduce size containment for scalar layouts', () => {
    expect(stackLayoutCss(stackDefaults)).not.toContain('@container');
    expect(stackLayoutCss(stackDefaults)).not.toContain(':host');
  });
});
