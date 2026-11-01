import { focusHalo } from './shared/focus.js';
import type { PresentationDictionary } from '../resolver.js';
import { nativeChoiceAppearance } from './shared/selection-control.js';
import { inputRules } from './shared/text-control.js';
import { fillColor, fillShown } from './shared/fill.js';
import { controlFill, fieldEdge } from './shared/edges.js';
/** Questionnaire appearance; native constituents share existing recipes. */
export const questionnaireAppearance: PresentationDictionary = {
  questionnaire: [{ declarations: { gap: 'var(--tp-space-4)' } }],
  'questionnaire-progress': [
    {
      declarations: {
        gap: 'var(--tp-space-2)',
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        'font-weight': 'var(--tp-font-medium)',
        'font-variant-numeric': 'tabular-nums',
      },
    },
  ],
  'questionnaire-question': [
    { declarations: { gap: 'var(--tp-space-4)', padding: '0', border: '0' } },
  ],
  'questionnaire-title': [
    { selector: '&:is(legend)', declarations: { 'margin-block-end': 'var(--tp-space-4)' } },
    {
      declarations: {
        padding: '0',
        'font-size': 'var(--tp-text-base)',
        'font-weight': 'var(--tp-font-medium)',
        'line-height': 'var(--tp-leading-normal)',
      },
    },
  ],
  'questionnaire-description': [
    { declarations: { color: 'var(--tp-muted-foreground)', 'font-size': 'var(--tp-text-sm)' } },
  ],
  'questionnaire-choices': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'questionnaire-choice': [
    ...nativeChoiceAppearance('radio'),
    ...nativeChoiceAppearance('checkbox'),
    {
      declarations: {
        gap: 'var(--tp-space-2-5)',
        padding: 'var(--tp-space-2-5) var(--tp-space-3)',
        border: fieldEdge.border,
        'border-radius': 'var(--tp-radius-lg)',
        'font-size': 'var(--tp-text-sm)',
        background: controlFill,
      },
    },
    // An unchosen mark sits on the choice's control fill, so it takes the page color: a hole cut
    // through the fill, which stays visible when the appearance draws no edges.
    {
      selector: '&:not([data-checked], [data-indeterminate]) > .box',
      declarations: { background: 'var(--tp-background)' },
    },
    fillColor('color-mix(in oklab,var(--tp-muted) 50%,transparent)'),
    // A checked choice keeps its own fill; hover does not cover it.
    fillShown('&:not([data-disabled], [data-checked]):hover'),
    {
      selector: '&[data-checked]',
      declarations: {
        background: 'var(--tp-muted)',
        'border-color': 'color-mix(in oklab,var(--tp-primary) 40%,transparent)',
      },
    },
    {
      selector: '&:has(>input:focus-visible)',
      declarations: {
        'border-color': 'var(--tp-ring)',
        outline: `var(--tp-ring-width) var(--tp-border-style) ${focusHalo}`,
      },
    },
    { selector: '&[data-invalid]', declarations: { 'border-color': 'var(--tp-destructive)' } },
    {
      selector: '& .choice-copy',
      declarations: {
        gap: 'var(--tp-space-0-5)',
        'line-height': 'var(--tp-leading-normal)',
      },
    },
    { selector: '& .choice-description', declarations: { color: 'var(--tp-muted-foreground)' } },
  ],
  'questionnaire-input-region': inputRules
    .filter((rule) => !rule.selector?.includes('file-selector'))
    .map((rule) => ({ ...rule, selector: (rule.selector ?? '&').replaceAll('&', '& > input') })),
  'questionnaire-error': [
    {
      declarations: {
        color: 'var(--tp-destructive-subtle-foreground)',
        'font-size': 'var(--tp-text-sm)',
      },
    },
  ],
  'questionnaire-actions': [{ declarations: { gap: 'var(--tp-space-2)' } }],
};
