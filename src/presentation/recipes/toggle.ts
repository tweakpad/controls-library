import type { PresentationDictionary } from '../resolver.js';
import { fillHidden } from './shared/fill.js';

const pressedInteraction =
  '&[aria-pressed="true"]:not(:disabled, [aria-disabled="true"]):is(:hover, :focus-visible)';

export const toggleAppearance: PresentationDictionary = {
  toggle: [
    // A Toggle is never narrower than its height.
    { declarations: { 'min-inline-size': 'var(--tp-control-height-md)' } },
    // A pressed Toggle under the pointer deepens its own fill; the neutral hover layer stays hidden.
    {
      selector: pressedInteraction,
      declarations: {
        background: 'color-mix(in oklab, var(--tp-pressed-foreground) 10%, var(--tp-pressed))',
      },
    },
    fillHidden(pressedInteraction),
  ],
  'toggle-content': [{ declarations: { gap: 'inherit' } }],
  'toggle-size-xs': [{ declarations: { 'min-inline-size': 'var(--tp-control-height-xs)' } }],
  'toggle-size-sm': [{ declarations: { 'min-inline-size': 'var(--tp-control-height-sm)' } }],
  'toggle-size-lg': [{ declarations: { 'min-inline-size': 'var(--tp-control-height-lg)' } }],
};
