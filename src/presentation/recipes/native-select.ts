import type { PresentationDictionary } from '../resolver.js';
import { inputRules } from './shared/text-control.js';
import { controlStepDeclarations } from './shared/variant.js';
import { controlFill } from './shared/edges.js';
import { popupItemSpacingAppearance, popupSpacingAppearance } from './command-surface.js';
import { nativeOptionSelection } from './shared/native-selection.js';
/** Native select layers its native extents over the shared Input boundary. */
export const nativeSelectAppearance: PresentationDictionary = {
  // The host already applies the disabled opacity and cursor.
  'native-select': [],
  'native-select-control': [
    ...inputRules,
    {
      declarations: {
        ...controlStepDeclarations('md'),
        'padding-inline-start': 'var(--tp-space-2-5)',
        'padding-inline-end': 'var(--tp-space-8)',
        'padding-block': 'var(--tp-space-1)',
        // Native text alignment remains native while extent follows shared control sizes.
        'line-height': 'normal',
      },
    },
    {
      selector: '&[data-size="sm"]',
      declarations: {
        ...controlStepDeclarations('sm'),
        'padding-inline-start': 'var(--tp-space-2-5)',
        'padding-inline-end': 'var(--tp-space-8)',
        'padding-block': 'var(--tp-space-0-5)',
      },
    },
    {
      selector: '&:hover:not(:disabled)',
      declarations: {
        background: controlFill,
      },
    },
    {
      selector: '&[multiple]',
      declarations: {
        ...popupSpacingAppearance[0]!.declarations,
        height: 'auto',
        'block-size': 'auto',
        'padding-inline': 'var(--_tp-popup-spacing)',
        'padding-block': 'var(--_tp-popup-spacing)',
        appearance: 'none',
      },
    },
    {
      // Native HTML has no readonly select paint. The Foundation editing state
      // uses existing neutral roles while retaining enabled, submittable text.
      selector: '&[data-readonly]:not(:disabled)',
      declarations: {
        background: 'var(--tp-muted)',
        color: 'var(--tp-foreground)',
        cursor: 'default',
      },
    },
  ],
  'native-select-option': [
    { declarations: { background: 'Canvas', color: 'CanvasText' } },
    {
      selector: 'select[multiple] &',
      declarations: {
        ...popupItemSpacingAppearance[0]!.declarations,
        background: 'transparent',
        color: 'var(--tp-foreground)',
        font: 'inherit',
        'box-sizing': 'border-box',
        'line-height': 'var(--tp-leading-tight)',
      },
    },
    {
      selector: 'select[multiple] &:checked',
      declarations: nativeOptionSelection,
    },
    {
      selector: 'select[multiple] &[data-size="sm"]',
      declarations: {
        'padding-block': 'var(--tp-space-0-5)',
        'min-block-size': 'var(--tp-control-height-xs)',
      },
    },
    {
      selector: 'select[multiple] &:disabled',
      declarations: { color: 'var(--tp-muted-foreground)' },
    },
  ],
  'native-select-option-group': [
    { declarations: { background: 'Canvas', color: 'CanvasText' } },
    {
      selector: 'select[multiple] &',
      declarations: { background: 'transparent', color: 'var(--tp-foreground)', font: 'inherit' },
    },
  ],
  'native-select-indicator': [
    {
      declarations: {
        color: 'var(--tp-muted-foreground)',
        'inline-size': 'var(--tp-icon-size-md)',
        'block-size': 'var(--tp-icon-size-md)',
      },
    },
  ],
};
