// `@tweakpad/ui/patterns/auth` defines every element the Auth pattern's markup uses (sign in,
// create account, password recovery and verification code), and nothing else. Fields and controls
// come before the Form, which reaches its Fields as soon as it is defined.
import { TpAlert } from '../components/alert/alert.js';
import { TpButton } from '../components/button/button.js';
import { TpCard } from '../components/card/card.js';
import { TpCheckbox } from '../components/checkbox/checkbox.js';
import { TpField } from '../components/field/field.js';
import { TpForm } from '../components/form/form.js';
import { TpInput } from '../components/input/input.js';
import { TpOneTimeCodeField } from '../components/one-time-code-field/one-time-code-field.js';
import { TpSeparator } from '../components/separator/separator.js';
import { TpStack } from '../components/stack/stack.js';
import { defineElement } from '../foundation/define.js';

defineElement(TpAlert.tagName, TpAlert);
defineElement(TpButton.tagName, TpButton);
defineElement(TpCard.tagName, TpCard);
defineElement(TpCheckbox.tagName, TpCheckbox);
defineElement(TpField.tagName, TpField);
defineElement(TpInput.tagName, TpInput);
defineElement(TpOneTimeCodeField.tagName, TpOneTimeCodeField);
defineElement(TpSeparator.tagName, TpSeparator);
defineElement(TpStack.tagName, TpStack);
defineElement(TpForm.tagName, TpForm);
