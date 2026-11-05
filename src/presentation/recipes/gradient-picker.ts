import { motionTransition } from '../motion.js';
import type { PresentationDeclarations, PresentationDictionary } from '../resolver.js';
import { floatEdge } from './shared/edges.js';
import {
  activeRing,
  colorThumbRing,
  focusRing,
  handleSurface,
  ringMix,
  thumbRing,
} from './shared/handle.js';
import { swatchFill } from './shared/swatch.js';

// The gradient stop editor (`tp-gradient-picker`). The element supplies its gradient as
// `--_tp-gradient-picker-paint` (an <image>) and each stop's color as `--_tp-handle-paint`;
// every rule below resolves through tokens and the shared handle and swatch recipes.

const sizes = (
  track: string,
  stop: string,
  midpoint: string,
  row: string,
  checker: string,
): PresentationDeclarations => ({
  '--_tp-gradient-picker-track': track,
  '--_tp-gradient-picker-stop': stop,
  '--_tp-gradient-picker-midpoint': midpoint,
  '--_tp-gradient-picker-row': row,
  '--_tp-gradient-picker-checker': checker,
});

const stopSize = 'var(--_tp-gradient-picker-stop)';

export const gradientPickerAppearance: PresentationDictionary = {
  'gradient-picker': [
    // The field's aspect; an environment map's is 2:1.
    { declarations: { '--_tp-gradient-picker-aspect': '5 / 3' } },
    {
      declarations: sizes(
        'var(--tp-space-4)',
        'var(--tp-space-5)',
        'var(--tp-space-2)',
        'var(--tp-control-height-sm)',
        'var(--tp-space-2)',
      ),
    },
  ],
  'gradient-picker-size-sm': [
    {
      declarations: sizes(
        'var(--tp-space-3)',
        'var(--tp-space-4)',
        'var(--tp-space-1-5)',
        'var(--tp-control-height-xs)',
        'var(--tp-space-1-5)',
      ),
    },
  ],
  // The gradient over a transparency checker, so translucent stops read.
  'gradient-picker-track': [
    {
      declarations: {
        'border-radius': 'var(--tp-radius-full)',
        ...swatchFill(
          'var(--_tp-gradient-picker-paint, none)',
          'var(--_tp-gradient-picker-checker)',
        ),
        'box-shadow': floatEdge.ring,
      },
    },
  ],
  // The field over a transparency checker, so translucent anchors read.
  'gradient-picker-field': [
    {
      declarations: {
        'border-radius': 'var(--tp-radius-md)',
        ...swatchFill('none', 'var(--_tp-gradient-picker-checker)'),
        'box-shadow': floatEdge.ring,
      },
    },
  ],
  // A stop shows its own color inside a ring in the background color; the selected stop takes
  // the near-white ring every color marker wears and grows a little.
  'gradient-picker-stop': [
    {
      declarations: {
        'inline-size': stopSize,
        'block-size': stopSize,
        ...thumbRing,
        transition: motionTransition(['box-shadow', 'outline-color', 'scale'], 'fast'),
      },
    },
    {
      selector: '&[data-selected]',
      declarations: {
        border: colorThumbRing.border!,
        'box-shadow': colorThumbRing['box-shadow']!,
        scale: '1.15',
      },
    },
    { selector: '&:has(input:focus-visible)', declarations: focusRing },
    { selector: '&[data-dragging]', declarations: activeRing },
  ],
  // A midpoint is a small diamond in the muted tone, ringed like the other handles.
  'gradient-picker-midpoint': [
    {
      declarations: {
        'border-radius': 'calc(var(--tp-radius-sm) * 0.4)',
        border: `var(--tp-border-width) var(--tp-border-style) color-mix(in oklab, ${handleSurface} 60%, transparent)`,
        background: 'var(--tp-muted-foreground)',
        'box-shadow': `0 0 0 var(--tp-border-width) ${ringMix}`,
        transition: motionTransition(['box-shadow', 'outline-color'], 'fast'),
      },
    },
    {
      selector: '&:is(:hover, [data-dragging])',
      declarations: { background: 'var(--tp-foreground)' },
    },
    { selector: '&[data-focus-visible]', declarations: focusRing },
    { selector: '&[data-dragging]', declarations: activeRing },
  ],
  'gradient-picker-remove': [],
  // On the field it glides between corners instead of jumping.
  'gradient-picker-remove-variant-field': [
    { declarations: { transition: motionTransition(['translate'], 'fast') } },
  ],
};
