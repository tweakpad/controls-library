// `@tweakpad/ui/register/widgets` defines every widget; `@tweakpad/ui/register` never does.
// One import and one definition per widget, roots before the parts they resolve:
import { TpColorPicker } from '../widgets/color-picker/color-picker.js';
import { TpColorGradientInput } from '../widgets/color-gradient-input/color-gradient-input.js';
import { TpEasingEditor } from '../widgets/easing-editor/easing-editor.js';
import { TpFlow } from '../widgets/flow/flow.js';
import { TpEmojiPicker } from '../widgets/emoji-picker/emoji-picker.js';
import { TpTextEditor } from '../widgets/text-editor/text-editor.js';
import { defineElement } from '../foundation/define.js';

defineElement(TpColorPicker.tagName, TpColorPicker);
defineElement(TpColorGradientInput.tagName, TpColorGradientInput);
defineElement(TpEasingEditor.tagName, TpEasingEditor);
defineElement(TpFlow.tagName, TpFlow);
defineElement(TpEmojiPicker.tagName, TpEmojiPicker);
defineElement(TpTextEditor.tagName, TpTextEditor);

export * from '../widgets/index.js';
