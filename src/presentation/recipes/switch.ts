import { motionTransition } from '../motion.js';
import type { PresentationDictionary } from '../resolver.js';
import { fillColor, fillShown } from './shared/fill.js';
import { focusHalo, focusRing, invalidFocusHalo } from './shared/focus.js';
import {
  inlineControlLabel,
  inlineControlRings,
  inlineControlSurface,
} from './shared/inline-control.js';
import { divider } from './shared/edges.js';
// An invalid track takes the destructive edge; focused, it rings as a focused track does, in the
// destructive color.
const invalidPaint = { 'border-color': 'var(--tp-destructive)' };
const invalidFocusPaint = {
  'border-color': 'var(--tp-destructive)',
  'box-shadow': `0 0 0 var(--tp-ring-width) ${invalidFocusHalo}`,
};
/** Switch paint; translated geometry remains structural. */
export const switchAppearance: PresentationDictionary = {
  switch: [
    {
      selector: '& ~ tp-label:not([hidden])',
      declarations: { 'padding-inline-start': 'var(--tp-space-2)' },
    },
    {
      declarations: {
        background: `light-dark(${divider.color}, color-mix(in oklab, ${divider.color} 80%, transparent))`,
        border: 'var(--tp-border-width) var(--tp-border-style) transparent',
        'border-radius': 'var(--tp-radius-full)',
      },
    },
    fillColor('var(--tp-primary)'),
    fillShown('&[data-checked]'),
    // The host already applies the disabled opacity; dimming the root too would double it.
    { selector: '&[data-disabled]', declarations: { cursor: 'not-allowed' } },
    { selector: '&[data-readonly]:not([data-disabled])', declarations: { cursor: 'default' } },
    {
      selector: '&[data-focus-visible]:focus-visible',
      declarations: {
        ...focusRing,
        'border-color': 'var(--tp-ring)',
        'box-shadow': `0 0 0 var(--tp-ring-width) ${focusHalo}`,
      },
    },
    {
      selector: '&[data-invalid][data-focus-visible]:focus-visible',
      declarations: { 'outline-color': 'var(--tp-destructive)', ...invalidFocusPaint },
    },
    {
      selector: '&[data-invalid]',
      declarations: invalidPaint,
    },
  ],
  // Inline variant: the row is the shared inline row, its label at the start inset like a Select
  // trigger's text and the track at the end inset like the trigger's chevron. The row carries the
  // focus and validity rings, so the track draws neither.
  'switch-row-variant-inline': [
    {
      declarations: {
        ...inlineControlSurface,
        'min-block-size': 'var(--tp-control-height-md)',
        gap: 'var(--tp-space-2)',
        'padding-inline-start': 'var(--tp-space-2-5)',
        'padding-inline-end': 'var(--tp-space-3)',
      },
    },
    { selector: '& > tp-label', declarations: inlineControlLabel },
    ...inlineControlRings('&', ':has(> [part~="switch"]:focus-visible)'),
  ],
  'switch-variant-inline': [
    {
      // As specific as the base invalid rule for focusable parts, so the row's ring replaces it.
      selector: '&[data-focus-visible]:focus-visible, &[data-invalid][part~="focusable"]',
      declarations: { outline: 'none', 'border-color': 'transparent', 'box-shadow': 'none' },
    },
  ],
  'switch-thumb': [
    {
      declarations: {
        background: 'light-dark(var(--tp-background), var(--tp-foreground))',
        'border-radius': 'var(--tp-radius-full)',
        transition: motionTransition(['transform'], 'fast'),
      },
    },
    {
      selector: '&[data-checked]',
      declarations: {
        background: 'light-dark(var(--tp-background), var(--tp-primary-foreground))',
      },
    },
  ],
};
