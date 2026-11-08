import { css, html } from 'lit';
import type { PropertyValues } from 'lit';
import { TpElementBase } from '../../foundation/element.js';
import { GeneratedStyleResource } from '../../foundation/generated-style.js';
import { stackPresentation } from '../../presentation/families/stack.js';
import {
  normalizeStackValue,
  stackAttributeConverter,
  stackDefaults,
  stackKeys,
  stackLayoutCss,
} from './config.js';
import type {
  ResponsiveValue,
  StackDirection,
  StackGapValue,
  StackAlign,
  StackJustify,
  StackWrap,
  StackProperty,
} from './config.js';

/**
 * Arranges children in a row or column with themed spacing and optional wrapping.
 * Responsive objects follow this Stack's own inline size, without JavaScript resize work.
 * @slot - The content to arrange, preserved in document order.
 * @csspart stack-root - The flex container arranging the projected children.
 * @csspart root - The flex container holding the projected children.
 */
export class TpStack extends TpElementBase {
  static tagName = 'tp-stack';
  static override presentation = stackPresentation;
  static override properties = {
    ...TpElementBase.properties,
    direction: { converter: stackAttributeConverter, reflect: true },
    gap: { converter: stackAttributeConverter, reflect: true },
    align: { converter: stackAttributeConverter, reflect: true },
    justify: { converter: stackAttributeConverter, reflect: true },
    wrap: { converter: stackAttributeConverter, reflect: true },
  };
  static override styles = [
    TpElementBase.styles,
    css`
      :host {
        display: block;
        min-inline-size: 0;
        text-align: inherit;
      }

      .root {
        display: flex;
        min-inline-size: 0;
        min-block-size: 0;
      }
    `,
  ];
  /** Row or column layout; accepts a scalar or a breakpoint map. Defaults to column. */
  direction: ResponsiveValue<StackDirection> = 'column';
  /** Spacing token number; accepts a scalar or a breakpoint map. Defaults to zero. */
  gap: ResponsiveValue<StackGapValue> = 0;
  /** Cross-axis alignment; accepts a scalar or a breakpoint map. Defaults to stretch. */
  align: ResponsiveValue<StackAlign> = 'stretch';
  /** Main-axis distribution; accepts a scalar or a breakpoint map. Defaults to start. */
  justify: ResponsiveValue<StackJustify> = 'start';
  /** Line wrapping; accepts a scalar or a breakpoint map. Defaults to nowrap. */
  wrap: ResponsiveValue<StackWrap> = 'nowrap';
  #layout: GeneratedStyleResource | undefined;
  override connectedCallback(): void {
    super.connectedCallback();
    this.#layout?.connect();
  }
  override disconnectedCallback(): void {
    this.#layout?.disconnect();
    super.disconnectedCallback();
  }
  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    for (const key of stackKeys)
      if (changed.has(key)) {
        const value = normalizeStackValue(key, this[key], (message) =>
          this.diagnose('stack-config', message, { once: true, defer: true }),
        );
        (this as unknown as Record<StackProperty, unknown>)[key] = value;
      }
  }
  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (!this.#layout)
      this.#layout = new GeneratedStyleResource(this, this.renderRoot as ShadowRoot);
    if (stackKeys.some((key) => changed.has(key)))
      this.#layout.setText(
        stackLayoutCss(
          Object.fromEntries(
            stackKeys.map((key) => [key, this[key] ?? stackDefaults[key]]),
          ) as Record<StackProperty, unknown>,
        ),
      );
  }
  protected override render() {
    return this.renderPart('stack-root', Object.freeze({}), {
      properties: { class: 'root', part: 'root stack-root' },
      content: html`<slot></slot>`,
    });
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'tp-stack': TpStack;
  }
}
