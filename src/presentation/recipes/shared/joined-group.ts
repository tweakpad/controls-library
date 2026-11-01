import type { PresentationRule } from '../../resolver.js';

import { divider } from './edges.js';

// Nested groups and unjoined members keep the theme gap.
export const joinedGroupGap: PresentationRule = {
  selector: ':host(:not([joined])) &, &[data-nested]',
  declarations: { gap: 'var(--tp-space-2)' },
};
/**
 * A separator between unjoined members is a divider; between joined members it is part of the
 * seam the group cuts, so it is transparent.
 */
export const joinedGroupSeparator: readonly PresentationRule[] = [
  { declarations: { background: divider.color } },
  { selector: ':host([joined]) &', declarations: { background: 'transparent' } },
];
