import type { PresentationDictionary } from '../../resolver.js';
import { controlSizePresentation, rule, variantPresentation } from '../shared/variant.js';
import { buttonCoreAppearance, buttonSizes, outlineFieldPaint } from './button.js';

export const toggleCoreAppearance: PresentationDictionary = {
  toggle: [
    ...buttonCoreAppearance.button!,
    rule(
      { background: 'var(--tp-muted)', color: 'var(--tp-foreground)' },
      '&[aria-pressed="true"]',
    ),
  ],
  ...Object.fromEntries(
    ['toggle', 'toggle-content'].flatMap((part) => [
      // An outline Toggle takes the control fill and edge, as an outline Button does.
      ...['ghost', 'outline'].map((variant) => [
        `${part}-variant-${variant}`,
        part === 'toggle'
          ? [
              ...variantPresentation(variant, true),
              ...(variant === 'outline' ? [outlineFieldPaint] : []),
            ]
          : [],
      ]),
      ...buttonSizes.map((size) => [
        `${part}-size-${size}`,
        part === 'toggle'
          ? controlSizePresentation(size, {
              start: ':host([data-icon-inline-start]) &',
              end: ':host([data-icon-inline-end]) &',
            })
          : [],
      ]),
    ]),
  ),
};
