import type { PresentationDictionary } from '../resolver.js';
import { invalidFocusRing } from './shared/focus.js';
import {
  anchoredPresenceAppearance,
  popupSpacingAppearance,
  popupItemSpacingAppearance,
  commandSeparatorAppearance,
} from './command-surface.js';
import { inputRules } from './shared/text-control.js';
import {
  inlineControlLabel,
  inlineControlSurface,
  inlineControlValue,
} from './shared/inline-control.js';
import { controlStepDeclarations } from './shared/variant.js';
import { controlFill, floatEdge } from './shared/edges.js';

/**
 * A matched range of option text (Text search highlighting). Matched text keeps the option's color and gains weight, with the native mark background removed.
 */
export const searchMatchRules: PresentationDictionary[string] = [
  {
    declarations: {
      background: 'transparent',
      color: 'inherit',
      'font-weight': 'var(--tp-font-semibold)',
    },
  },
];

/** The empty row: muted, small, centered; also the loading and error status row. */
const emptyStateRules: PresentationDictionary[string] = [
  {
    declarations: {
      padding: 'var(--tp-space-2)',
      color: 'var(--tp-muted-foreground)',
      'font-size': 'var(--tp-text-sm)',
      'text-align': 'center',
    },
  },
];

/** Select appearance over the shared field and surface base. */
export const selectAppearance: PresentationDictionary = {
  select: [],
  'select-input': [
    {
      declarations: {
        font: 'inherit',
        'font-size': 'var(--tp-text-sm)',
        color: 'var(--tp-foreground)',
        background: 'transparent',
        border: '0',
        outline: '0',
        padding: 'var(--tp-space-1) var(--tp-space-2-5)',
        'min-block-size': 'var(--tp-control-height-md)',
      },
    },
  ],
  'select-chip-list': [
    { declarations: { gap: 'var(--tp-space-1)', padding: 'var(--tp-space-1)' } },
  ],
  'select-chip': [
    {
      selector: '&::part(badge)',
      declarations: {
        'border-radius': 'var(--tp-radius-md)',
        gap: 'var(--tp-space-1)',
        'padding-block': '0',
        'padding-inline': 'var(--tp-space-1)',
      },
    },
  ],
  'select-empty-state': emptyStateRules,
  'select-status': emptyStateRules,
  'select-match': searchMatchRules,
  'select-trigger': [
    ...inputRules,
    {
      declarations: {
        ...controlStepDeclarations('md'),
        // The text and the chevron line up with the options' text and check marks.
        'padding-inline-start': 'var(--tp-space-2-5)',
        'padding-inline-end': 'var(--tp-space-3)',
      },
    },
    {
      selector: '&:hover:not(:disabled, [aria-disabled="true"])',
      declarations: {
        background: controlFill,
      },
    },
    { selector: '&[data-placeholder]', declarations: { color: 'var(--tp-muted-foreground)' } },
    { selector: '&[data-invalid]', declarations: { 'border-color': 'var(--tp-destructive)' } },
    { selector: '&[data-invalid]:focus-visible', declarations: invalidFocusRing },
    { selector: '&[data-disabled]', declarations: { cursor: 'not-allowed' } },
  ].map((rule) => ({
    ...rule,
    selector: (rule.selector ?? '&').replaceAll('&', '&:not([data-searchable])'),
  })),
  'select-value': [{ declarations: { gap: 'var(--tp-space-1-5)' } }],
  // Inline variant: the trigger is the shared inline row; the label sits at its start and the
  // selection at its end.
  'select-trigger-variant-inline': [
    {
      declarations: {
        ...inlineControlSurface,
        gap: 'var(--tp-space-2)',
      },
    },
    {
      selector: '&:hover:not(:disabled, [aria-disabled="true"])',
      declarations: { background: inlineControlSurface.background! },
    },
  ].map((rule) => ({
    ...rule,
    selector: (rule.selector ?? '&').replaceAll('&', '&:not([data-searchable])'),
  })),
  'select-trigger-label-variant-inline': [{ declarations: inlineControlLabel }],
  'select-value-variant-inline': [
    { declarations: inlineControlValue },
    {
      selector: '[part~="select-trigger"][data-placeholder] &',
      declarations: { color: 'var(--tp-muted-foreground)' },
    },
  ],
  'select-content': [
    ...anchoredPresenceAppearance.map((rule) => ({
      ...rule,
      selector: (rule.selector ?? '&').replaceAll('&', '&:not([data-inline], [data-align-item])'),
    })),
    {
      selector: '&[data-inline]',
      declarations: {
        border: '0',
        'box-shadow': 'none',
        background: 'transparent',
        'min-inline-size': '0',
        opacity: '1',
      },
    },
    {
      declarations: {
        padding: '0',
        'box-shadow': 'var(--tp-shadow-md)',
        'border-color': floatEdge.color,
        'border-radius': 'var(--tp-radius-lg)',
        // At least three space-12 steps wide.
        'min-inline-size': 'max(var(--tp-anchor-width, 0px), calc(var(--tp-space-12) * 3))',
        opacity: '1',
        'transform-origin': 'var(--tp-transform-origin)',
      },
    },
    { selector: '&[data-tp-motion-driven]', declarations: { transition: 'none' } },
    { selector: '& .select-item-text', declarations: { gap: 'var(--tp-space-1-5)' } },
    { selector: '& .select-arrow', declarations: { color: 'var(--tp-popover)' } },
  ],
  'select-list': [
    ...popupSpacingAppearance,
    // Without options the list has no block extent; the empty state follows it.
    { selector: '&[data-empty]', declarations: { 'padding-block': '0' } },
  ],
  'select-group': [{ declarations: { padding: '0' } }],
  'select-label': [
    {
      declarations: {
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        padding: 'var(--tp-space-1) var(--tp-space-1-5)',
      },
    },
  ],
  'select-option': [
    ...popupItemSpacingAppearance,
    {
      declarations: {
        color: 'var(--tp-popover-foreground)',
        background: 'transparent',
        border: '0',
        'border-radius': 'var(--tp-radius-md)',
        'font-family': 'inherit',
        'font-size': 'var(--tp-text-sm)',
        'line-height': 'var(--tp-leading-tight)',
        'padding-inline-end': 'var(--tp-space-8)',
        'text-align': 'start',
        outline: '0',
      },
    },
    // The highlighted option, by pointer or keyboard, shows by its fill alone: the accent fill
    // stands apart from the list surface in lightness, not only in hue.
    {
      selector: '&[data-highlighted]:not([data-disabled])',
      declarations: { background: 'var(--tp-accent)', color: 'var(--tp-accent-foreground)' },
    },
    {
      selector: '&[data-disabled]',
      declarations: { opacity: 'var(--tp-opacity-disabled)', cursor: 'not-allowed' },
    },
  ],
  'select-separator': commandSeparatorAppearance,
  'select-scroll-up-button': [
    {
      declarations: {
        background: 'var(--tp-popover)',
        color: 'var(--tp-popover-foreground)',
        padding: 'var(--tp-space-1) 0',
      },
    },
  ],
  'select-scroll-down-button': [
    {
      declarations: {
        background: 'var(--tp-popover)',
        color: 'var(--tp-popover-foreground)',
        padding: 'var(--tp-space-1) 0',
      },
    },
  ],
};
