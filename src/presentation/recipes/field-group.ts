import type { PresentationDictionary } from '../resolver.js';
import { joinedGroupGap, joinedGroupSeparator } from './shared/joined-group.js';
import {
  inlineControlLabel,
  inlineControlRings,
  inlineControlSurface,
} from './shared/inline-control.js';

// Field group shares the Button group seam presentation: editors keep their own recipes.
export const fieldGroupAppearance: PresentationDictionary = {
  'field-group': [joinedGroupGap],
  // Inline: the shared inline row; its editors are segments inside it, so the row carries the
  // boundary, the fill and the rings, and the values end where an inline Input's value ends.
  'field-group-variant-inline': [
    {
      declarations: {
        ...inlineControlSurface,
        'min-block-size': 'var(--tp-control-height-md)',
        'padding-inline': 'var(--tp-space-2-5)',
        gap: 'var(--tp-space-3)',
      },
    },
    ...inlineControlRings('&', ':focus-within'),
  ],
  'field-group-label-variant-inline': [{ declarations: inlineControlLabel }],
  'field-group-separator': joinedGroupSeparator,
};
