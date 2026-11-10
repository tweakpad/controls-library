import type { PresentationDictionary } from '../resolver.js';
import { invalidFocusRing } from './shared/focus.js';
import {
  disabledBackground,
  fieldBoundary,
  fieldFocus,
  fieldInvalid,
} from './shared/text-control.js';

/** Every slot, the ends of a group included, which the joined strip rounds and closes. */
const everySlot = '&, &:first-child, &:last-child';

export const oneTimeCodeAppearance: PresentationDictionary = {
  'one-time-code-field': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'one-time-code-field-group': [{ declarations: { 'border-radius': 'var(--tp-radius-lg)' } }],
  'one-time-code-field-separator': [{ declarations: { color: 'var(--tp-muted-foreground)' } }],
  'one-time-code-field-slot': [
    {
      declarations: {
        ...fieldBoundary,
        padding: '0',
        'min-height': '0',
        // Slots are field-height squares with the shared field typography in the mono role:
        // code characters keep equal widths and stay distinct (0 and O, 1 and l).
        'font-family': 'var(--tp-font-mono)',
        'inline-size': 'var(--tp-control-height-md)',
        'block-size': 'var(--tp-control-height-md)',
        'border-inline-start-width': '0',
        'border-inline-end-width': 'var(--tp-joined-edge-width)',
        'border-radius': '0',
        // The fill stays inside the edge: where the edge is transparent (the flat appearance), the
        // lines between slots read as gaps cut through the fill.
        'background-clip': 'padding-box',
      },
    },
    {
      selector: '&:first-child',
      declarations: {
        'border-inline-start-width': 'var(--tp-border-width)',
        'border-start-start-radius': 'var(--tp-radius-lg)',
        'border-end-start-radius': 'var(--tp-radius-lg)',
      },
    },
    {
      selector: '&:last-child',
      declarations: {
        'border-inline-end-width': 'var(--tp-border-width)',
        'border-start-end-radius': 'var(--tp-radius-lg)',
        'border-end-end-radius': 'var(--tp-radius-lg)',
      },
    },
    { selector: '&[data-active]', declarations: fieldFocus },
    { selector: '&[data-selected]', declarations: { background: 'var(--tp-muted)' } },
    { selector: '&[data-invalid]', declarations: fieldInvalid },
    { selector: '&[data-invalid][data-active]', declarations: invalidFocusRing },
    // The host already applies the disabled opacity; only the surface changes here.
    { selector: '&[data-disabled]', declarations: { background: disabledBackground } },
    {
      selector: '&[data-caret]::after',
      declarations: {
        content: "''",
        position: 'absolute',
        'inline-size': 'var(--tp-border-width)',
        'block-size': '1em',
        background: 'var(--tp-foreground)',
      },
    },
  ],
  // Separate slots (underline, bubbles): a gap between the slots of a group, and a wider one
  // around the separator, so groups still read apart.
  'one-time-code-field-variant-underline': [{ declarations: { gap: 'var(--tp-space-3)' } }],
  'one-time-code-field-variant-bubbles': [{ declarations: { gap: 'var(--tp-space-3)' } }],
  'one-time-code-field-group-variant-underline': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'one-time-code-field-group-variant-bubbles': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  // Underline: each character stands on its own line in the field edge color, with no box. The
  // active slot's line takes the focus color and doubles inward, so the character never moves.
  'one-time-code-field-slot-variant-underline': [
    {
      selector: everySlot,
      declarations: {
        'border-width': '0',
        'border-block-end-width': 'var(--tp-border-width)',
        'border-radius': '0',
        background: 'transparent',
      },
    },
    {
      selector: '&[data-active]',
      declarations: {
        outline: 'none',
        'box-shadow': 'inset 0 calc(-1 * var(--tp-border-width)) 0 0 var(--tp-ring)',
      },
    },
    {
      selector: '&[data-invalid][data-active]',
      declarations: {
        outline: 'none',
        'box-shadow': 'inset 0 calc(-1 * var(--tp-border-width)) 0 0 var(--tp-destructive)',
      },
    },
    { selector: '&[data-disabled]', declarations: { background: 'transparent' } },
  ],
  // Bubbles: every slot is its own circle with the full field edge; focus, invalid and disabled
  // paint as in the joined strip.
  'one-time-code-field-slot-variant-bubbles': [
    {
      selector: everySlot,
      declarations: {
        'border-width': 'var(--tp-border-width)',
        'border-radius': 'var(--tp-radius-full)',
      },
    },
  ],
};
