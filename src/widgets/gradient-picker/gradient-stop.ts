import { css, nothing, type PropertyValues } from 'lit';
import { TpElement } from '../../foundation/element.js';
import { gradientPickerPresentation } from '../../presentation/families/gradient-picker.js';

/**
 * Declares one stop of a Gradient picker: a color at a `position` along a linear gradient, with
 * an optional `midpoint` to the next stop, or a color at `x` and `y` on a field gradient. The
 * picker reads its stops from these children and writes its edits back to them, so the markup
 * always shows the current gradient. It renders nothing itself.
 *
 * @fires tp-gradient-stop-change - Bubbles after the stop's declaration changes, so the picker
 * reads it again.
 */
export class TpGradientStop extends TpElement {
  static tagName = 'tp-gradient-stop';
  static override presentation = gradientPickerPresentation;
  static override properties = {
    ...TpElement.properties,
    position: { type: Number, reflect: true },
    color: { type: String, reflect: true },
    midpoint: { type: Number, reflect: true },
    x: { type: Number, reflect: true },
    y: { type: Number, reflect: true },
  };
  static override styles = [
    TpElement.styles,
    css`
      :host {
        display: none;
      }
    `,
  ];
  /** Linear: where the stop sits along the gradient, from 0 to 1. */
  position: number | undefined;
  /** The stop's color, in any CSS Color 4 notation. */
  color = '';
  /** Linear: where, within the span to the next stop (0–1), the two colors mix half and half. */
  midpoint: number | undefined;
  /** Field: horizontal place on the field, from 0 (start) to 1 (end). */
  x: number | undefined;
  /** Field: vertical place on the field, from 0 (top) to 1 (bottom). */
  y: number | undefined;

  protected override render(): unknown {
    return nothing;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.dispatchEvent(new Event('tp-gradient-stop-change', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-gradient-stop': TpGradientStop;
  }
}
