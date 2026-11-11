// `@tweakpad/ui/register/widgets` defines every widget; `@tweakpad/ui/register` never does.
// One import and one definition per widget, roots before the parts they resolve:
import { TpColorPicker } from '../widgets/color-picker/color-picker.js';
import { TpGradientPicker } from '../widgets/gradient-picker/gradient-picker.js';
import { TpGradientStop } from '../widgets/gradient-picker/gradient-stop.js';
import { TpEasingEditor } from '../widgets/easing-editor/easing-editor.js';
import { TpFlow } from '../widgets/flow/flow.js';
import { TpEmojiPicker } from '../widgets/emoji-picker/emoji-picker.js';
import { TpPlot } from '../widgets/plot/plot.js';
import { TpTextEditor } from '../widgets/text-editor/text-editor.js';
import { TpColorPalette } from '../widgets/color-palette/color-palette.js';
import { defineElement } from '../foundation/define.js';

defineElement(TpColorPicker.tagName, TpColorPicker);
defineElement(TpGradientPicker.tagName, TpGradientPicker);
defineElement(TpGradientStop.tagName, TpGradientStop);
defineElement(TpEasingEditor.tagName, TpEasingEditor);
defineElement(TpFlow.tagName, TpFlow);
defineElement(TpEmojiPicker.tagName, TpEmojiPicker);
defineElement(TpPlot.tagName, TpPlot);
defineElement(TpTextEditor.tagName, TpTextEditor);
defineElement(TpColorPalette.tagName, TpColorPalette);

export * from '../widgets/index.js';
