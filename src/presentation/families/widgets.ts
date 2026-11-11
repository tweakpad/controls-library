import type { PresentationFamily } from '../family.js';
import { colorPalettePresentation } from './color-palette.js';
import { colorPickerPresentation } from './color-picker.js';
import { gradientPickerPresentation } from './gradient-picker.js';
import { easingEditorPresentation } from './easing-editor.js';
import { flowPresentation } from './flow.js';
import { emojiPickerPresentation } from './emoji-picker.js';
import { plotPresentation } from './plot.js';
import { textEditorPresentation } from './text-editor.js';

/**
 * Every widget family, in widget catalog order. Widgets never import this list; each widget
 * carries its own family (`src/presentation/families/<widget>.ts`), so only an explicit import
 * of `@tweakpad/ui/widgets` aggregates bundles every widget's presentation.
 */
export const widgetPresentationFamilies: readonly PresentationFamily[] = [
  colorPickerPresentation,
  gradientPickerPresentation,
  easingEditorPresentation,
  flowPresentation,
  emojiPickerPresentation,
  plotPresentation,
  textEditorPresentation,
  colorPalettePresentation,
];
