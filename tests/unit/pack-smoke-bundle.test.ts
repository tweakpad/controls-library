import { describe, expect, it } from 'vitest';

const helper = new URL('../../scripts/pack-smoke-bundle.mjs', import.meta.url).href;
const { hasTagLiteral } = await import(helper);

describe('package smoke tag detection', () => {
  it('detects real component tag literals with either quote style', () => {
    expect(hasTagLiteral('static tagName = "tp-select";', 'tp-select')).toBe(true);
    expect(hasTagLiteral("tagName: 'tp-dialog'", 'tp-dialog')).toBe(true);
  });

  it('does not confuse native selection tokens with Select', () => {
    expect(
      hasTagLiteral(
        'const css = "::selection { color: var(--tp-selection-foreground); background: var(--tp-selection); }";',
        'tp-select',
      ),
    ).toBe(false);
  });

  it('does not accept similarly prefixed tags as the requested component', () => {
    expect(hasTagLiteral('"tp-select-option"', 'tp-select')).toBe(false);
    expect(hasTagLiteral('"tp-switch-group"', 'tp-switch')).toBe(false);
  });
});
