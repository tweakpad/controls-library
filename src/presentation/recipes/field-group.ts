import type { PresentationDictionary } from '../resolver.js';
import { joinedGroupGap, joinedGroupSeparator } from './shared/joined-group.js';
import { motionTransition } from '../motion.js';
import {
  inlineControlIcon,
  inlineControlLabel,
  inlineControlRings,
  inlineControlSurface,
} from './shared/inline-control.js';

// Field group shares the Button group seam presentation: editors keep their own recipes.
export const fieldGroupAppearance: PresentationDictionary = {
  'field-group': [joinedGroupGap],
  // Inline: the group lays out its row and, expanded, the rows of its values below it.
  'field-group-variant-inline': [{ declarations: { 'row-gap': 'var(--tp-space-2)' } }],
  // The shared inline row; collapsed, its editors are segments inside it, so the row carries the
  // boundary, the fill and the rings, and the values end where an inline Input's value ends.
  'field-group-row-variant-inline': [
    {
      declarations: {
        ...inlineControlSurface,
        'min-block-size': 'var(--tp-control-height-md)',
        'padding-inline': 'var(--tp-space-2-5)',
        gap: 'var(--tp-space-3)',
      },
    },
    // The expand Button sits at the row's end, inset like the Select trigger's chevron.
    { selector: '&[data-expandable]', declarations: { 'padding-inline-end': 'var(--tp-space-1)' } },
    // The row rings while a value is edited; the expand Button rings on its own.
    ...inlineControlRings(
      '&',
      ':focus-within:not(:has([part~="field-group-toggle"]:focus-within))',
    ),
  ],
  'field-group-icon-variant-inline': [{ declarations: inlineControlIcon }],
  // The chevron turns over while the values show on rows of their own.
  'field-group-toggle': [
    { declarations: { transition: motionTransition(['rotate'], 'fast') } },
    { selector: '&[data-expanded]', declarations: { rotate: '180deg' } },
  ],
  // Expanded rows keep the rhythm of a stack of inline rows.
  'field-group-rows': [{ declarations: { 'row-gap': 'var(--tp-space-2)' } }],
  // A constraint's bracket is a quiet connector, not an edge, so it stays in flat mode.
  'field-group-constraint': [
    {
      declarations: {
        'border-color': 'color-mix(in oklab, var(--tp-muted-foreground) 45%, transparent)',
        color: 'var(--tp-muted-foreground)',
      },
    },
  ],
  'field-group-label-variant-inline': [{ declarations: inlineControlLabel }],
  // A segment's number value steps with the Arrow keys; the browser's spin buttons stay hidden.
  'field-group-value-variant-inline': [
    {
      selector: '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button',
      declarations: { appearance: 'none', margin: '0' },
    },
    { selector: '&[type="number"]', declarations: { appearance: 'textfield' } },
  ],
  'field-group-separator': joinedGroupSeparator,
};
