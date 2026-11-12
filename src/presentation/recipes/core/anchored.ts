import type { PresentationDictionary } from '../../resolver.js';
import { anchoredPresenceAppearance } from '../command-surface.js';
import { surfaceAppearance } from '../shared/surface.js';
import { rule } from '../shared/variant.js';

/** Preview card surface with anchored presence and its own sizing. */
export const previewCardCoreAppearance: PresentationDictionary = {
  'preview-card-content': [
    ...surfaceAppearance,
    ...anchoredPresenceAppearance,
    rule({ fill: 'var(--tp-popover)' }, '& > .arrow'),
    rule({
      // 64 spacing units wide (space-16 × 4), capped by the available width.
      'inline-size': 'min(calc(var(--tp-space-16) * 4), var(--tp-available-width))',
      padding: 'var(--tp-space-2-5)',
      gap: 'var(--tp-space-2-5)',
      'font-size': 'var(--tp-text-sm)',
    }),
  ],
};

/** Tooltip surface with anchored presence, inverted palette and arrow fill. */
export const tooltipCoreAppearance: PresentationDictionary = {
  'tooltip-content': [
    ...surfaceAppearance,
    ...anchoredPresenceAppearance,
    rule({
      // As wide as its text, up to `max-width` when one is set, and never wider than the space.
      'max-inline-size': 'min(var(--_tp-tooltip-max-width, 100vw), var(--tp-available-width))',
      // One line unless `wrap` is set; a line wider than the tooltip is cropped.
      'white-space': 'nowrap',
      padding: 'var(--tp-space-1-5) var(--tp-space-3)',
      gap: 'var(--tp-space-1-5)',
      border: '0',
      'border-radius': 'var(--tp-radius-md)',
      background: 'var(--tp-foreground)',
      color: 'var(--tp-background)',
      'font-size': 'var(--tp-text-xs)',
      'line-height': 'var(--tp-leading-normal)',
      'box-shadow': 'none',
    }),
    // The content is one centered row: an icon, the label and its Kbd elements side by side. The
    // row shrinks to the tooltip, so wrapped text breaks at its width and one line is cropped.
    rule({ 'flex-direction': 'row', 'align-items': 'center', overflow: 'hidden' }, '& .body'),
    rule({ flex: '0 1 auto', 'min-inline-size': '0' }, '& .scroll-content'),
    rule({ 'white-space': 'normal' }, '&[data-wrap]'),
  ],
  'tooltip-arrow': [rule({ fill: 'var(--tp-foreground)' })],
};
