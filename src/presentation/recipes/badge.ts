import type { PresentationDictionary } from '../resolver.js';
import { focusRing } from './shared/focus.js';
import { surfaceEdge } from './shared/edges.js';

export const badgeAppearance: PresentationDictionary = {
  badge: [
    {
      selector: '&',
      declarations: {
        'block-size': 'var(--tp-space-5)',
        gap: 'var(--tp-space-1)',
        padding: '0 var(--tp-space-2)',
        'border-radius': 'var(--tp-radius-full)',
        'font-family': 'inherit',
        'font-size': 'var(--tp-text-xs)',
        'font-weight': 'var(--tp-font-medium)',
        'line-height': 'var(--tp-leading-normal)',
        'white-space': 'nowrap',
        '--_tp-icon-extent': 'var(--tp-icon-size-xs)',
        'text-decoration': 'none',
        border: surfaceEdge.border,
      },
    },
    {
      selector: ':host([interactive]) &:is(button,a)',
      declarations: { appearance: 'none', cursor: 'pointer' },
    },
    {
      selector: ':host([interactive]) &:is(button,a):focus-visible, &[tabindex]:focus-visible',
      declarations: {
        'border-color': 'var(--tp-ring)',
        ...focusRing,
      },
    },
    // Status pills take their role as the focused border.
    ...(['destructive', 'success', 'warning'] as const).map((variant) => ({
      selector: `:host([interactive][variant="${variant}"]) &:is(button,a):focus-visible`,
      declarations: { 'border-color': `var(--tp-${variant})` },
    })),
    {
      selector: ':host([disabled]) &:is(button,a)',
      declarations: { cursor: 'not-allowed' },
    },
  ],
};
