import { html, nothing, type TemplateResult } from 'lit';
import { TpTextControl } from '../../../components/field/text-control.js';
import type { FlowPropertyControl } from '../../../foundation/flow/types.js';
import type { FlowPropertyControlContext, FlowPropertyControls } from '../types.js';

/**
 * Default property control factories (Widgets 6.3 Properties: each property definition names
 * the library control that edits it). Every factory marks its control with
 * `data-flow-property` so the node host re-proposes the control's lane events as node data
 * changes; `number` marks a NumberField root that the host binds after render. In a node body
 * (`inline`), the controls listed in `INLINE_PROPERTY_CONTROLS` render their inline variant,
 * which is the whole row and shows the property's label.
 */

/** The text a text control shows for a property value. */
const propertyText = (value: unknown): string => (value == null ? '' : String(value));

/** Control kinds whose default control has an inline variant: in a node body it is the row. */
export const INLINE_PROPERTY_CONTROLS: ReadonlySet<FlowPropertyControl> = new Set([
  'text',
  'number',
  'slider',
  'select',
  'switch',
  'checkbox',
  'color',
]);

function optionItems(context: FlowPropertyControlContext) {
  return (context.definition.options ?? []).map((option) => ({
    value: String(option.value),
    label: option.label,
  }));
}

export const defaultPropertyControls: FlowPropertyControls = {
  text: (context) =>
    html`<tp-input
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      size=${context.inline ? nothing : 'sm'}
      variant=${context.inline ? 'inline' : nothing}
      label=${context.inline ? context.definition.label : nothing}
      ?mono=${context.definition.mono === true}
      .value=${propertyText(context.value)}
      placeholder=${context.definition.placeholder ?? ''}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.definition.label}
    ></tp-input>`,
  textarea: (context) =>
    html`<tp-text-area
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      .value=${propertyText(context.value)}
      placeholder=${context.definition.placeholder ?? ''}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.definition.label}
      ?mono=${context.definition.mono === true}
      rows="2"
    ></tp-text-area>`,
  number: (context) =>
    context.inline
      ? html`<span
          class="control number"
          data-number-field=${context.definition.key}
          data-flow-property=${context.definition.key}
          ><tp-input
            id=${context.id}
            variant="inline"
            label=${context.definition.label}
            type="text"
            inputmode="decimal"
            ?mono=${context.definition.mono !== false}
            ?disabled=${context.disabled}
            ?readonly=${context.readOnly}
          ></tp-input
        ></span>`
      : html`<tp-input-group
          class="control number"
          data-number-field=${context.definition.key}
          data-flow-property=${context.definition.key}
          size="sm"
          ><tp-input
            id=${context.id}
            type="text"
            inputmode="decimal"
            ?mono=${context.definition.mono !== false}
            ?disabled=${context.disabled}
            ?readonly=${context.readOnly}
            aria-label=${context.definition.label}
          ></tp-input
        ></tp-input-group>`,
  slider: (context) =>
    html`<tp-slider
      class="control slider"
      data-flow-property=${context.definition.key}
      id=${context.id}
      size=${context.inline ? nothing : 'sm'}
      variant=${context.inline ? 'inline' : nothing}
      label=${context.inline ? context.definition.label : nothing}
      ?editable-value=${context.inline}
      .value=${typeof context.value === 'number' ? context.value : (context.definition.min ?? 0)}
      .minimum=${context.definition.min ?? 0}
      .maximum=${context.definition.max ?? 100}
      .step=${context.definition.step ?? 1}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      .getAccessibleLabel=${() => context.definition.label}
    ></tp-slider>`,
  select: (context) =>
    html`<tp-select
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      size=${context.inline ? nothing : 'sm'}
      variant=${context.inline ? 'inline' : nothing}
      .items=${optionItems(context)}
      .value=${context.value == null ? '' : String(context.value)}
      placeholder=${context.definition.placeholder ?? ''}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      label=${context.definition.label}
    ></tp-select>`,
  switch: (context) =>
    html`<tp-switch
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      size=${context.inline ? nothing : 'sm'}
      variant=${context.inline ? 'inline' : nothing}
      .checked=${Boolean(context.value)}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.inline ? nothing : context.definition.label}
      >${context.inline ? context.definition.label : nothing}</tp-switch
    >`,
  checkbox: (context) =>
    html`<tp-checkbox
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      variant=${context.inline ? 'inline' : nothing}
      .checked=${Boolean(context.value)}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.inline ? nothing : context.definition.label}
      >${context.inline ? context.definition.label : nothing}</tp-checkbox
    >`,
  // Inline, the popup picker opens from an inline Color input: the row shows the label, the
  // swatch and the color text.
  color: (context) =>
    html`<tp-color-picker
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      picker="popup"
      .value=${context.value == null ? '' : String(context.value)}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.definition.label}
      >${
        context.inline
          ? html`<tp-color-input
              slot="trigger"
              variant="inline"
              label=${context.definition.label}
            ></tp-color-input>`
          : nothing
      }</tp-color-picker
    >`,
  easing: (context) =>
    html`<tp-easing-editor
      class="control"
      data-flow-property=${context.definition.key}
      id=${context.id}
      layout="compact"
      size="sm"
      .value=${context.value == null ? '' : String(context.value)}
      ?disabled=${context.disabled}
      ?readonly=${context.readOnly}
      aria-label=${context.definition.label}
      preset-picker="false"
      frames="false"
      preview="none"
    ></tp-easing-editor>`,
  custom: () => html`${nothing}`,
};

/** Reads the value a control's lane event carries, normalized per control kind. */
export function controlEventValue(control: Element, raw: unknown): unknown {
  if (control.localName === 'tp-slider') return Array.isArray(raw) ? raw[0] : raw;
  return raw;
}

/**
 * Writes an edit its owner took back to the bound text control during the control's own
 * proposal, as a synchronous controlled owner does, so the control keeps the typed text with its
 * caret and selection. Left to the owner's next render, the control would first restore its
 * previous text and the render would then replace it, moving the caret to the end. Other
 * controls take the value on that render.
 */
export function acceptControlValue(control: Element, value: unknown): void {
  if (control instanceof TpTextControl && control.controlled) control.value = propertyText(value);
}

export function renderControlWrapper(content: TemplateResult): TemplateResult {
  return html`<span class="control-wrapper">${content}</span>`;
}
