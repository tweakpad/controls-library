import { css, nothing, type PropertyValues } from 'lit';
import { TpElement } from '../../foundation/element.js';
import { layersPresentation } from '../../presentation/families/layers.js';

/** The event a declaration element dispatches after it changes, so its stack reads it again. */
export const LAYER_DECLARATION_CHANGE = 'tp-layer-change';

/** An attribute that is unset, present (`true`) or `"false"`. */
const optionalBoolean = {
  fromAttribute: (value: string | null) => (value === null ? undefined : value !== 'false'),
  toAttribute: (value: boolean | undefined) => (value === undefined ? null : value ? '' : 'false'),
};

/** Shared base: renders nothing and tells its stack when it changed. */
class LayerDeclaration extends TpElement {
  static override presentation = layersPresentation;
  static override styles = [
    TpElement.styles,
    css`
      :host {
        display: none;
      }
    `,
  ];

  protected override render(): unknown {
    return nothing;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.dispatchEvent(new Event('tp-layer-change', { bubbles: true, composed: true }));
  }
}

/**
 * Declares one layer of a Layers stack: its `id`, its `label`, a `tp-icon` child shown before the
 * label, `tp-layer-state` children for its states and, for a group, `tp-layer` children. The stack
 * reads its layers from these elements and writes its edits back to them. It renders nothing
 * itself.
 *
 * @slot - `tp-icon`, `tp-layer-state` and `tp-layer` children.
 * @fires tp-layer-change - Bubbles after the declaration changes, so the stack reads it again.
 */
export class TpLayer extends LayerDeclaration {
  static tagName = 'tp-layer';
  static override properties = {
    ...TpElement.properties,
    label: { type: String, reflect: true },
    group: { type: Boolean, reflect: true },
    canRename: { attribute: 'can-rename', converter: optionalBoolean, reflect: true },
    canRemove: { attribute: 'can-remove', converter: optionalBoolean, reflect: true },
    data: { attribute: false },
  };
  /** The visible text, which renaming edits. */
  label = '';
  /** Makes the layer a group while it has no `tp-layer` children. */
  group = false;
  /** Whether people can rename this layer; `false` to forbid it. The stack's `can-rename` when unset. */
  canRename: boolean | undefined;
  /** Whether people can remove this layer; `false` to forbid it. The stack's `can-remove` when unset. */
  canRemove: boolean | undefined;
  /** Anything the app keeps with the layer; the stack's records carry it as `data`. */
  data: unknown;
}

/**
 * Declares one state of its `tp-layer`, such as its visibility: its `name`, the `label` of its
 * control, its current `value` and, as `tp-layer-state-value` children, the values a press on its
 * control steps through.
 *
 * @slot - `tp-layer-state-value` children.
 * @fires tp-layer-change - Bubbles after the declaration changes, so the stack reads it again.
 */
export class TpLayerState extends LayerDeclaration {
  static tagName = 'tp-layer-state';
  static override properties = {
    ...TpElement.properties,
    name: { type: String, reflect: true },
    label: { type: String, reflect: true },
    value: { type: String, reflect: true },
    scope: { type: String, reflect: true },
  };
  /** Names the state; layers that share a state share its name. `enabled` is built in. */
  name = '';
  /** The control's accessible name. */
  label = '';
  /** The state's current value, one of its `tp-layer-state-value` children's. */
  value = '';
  /** A press on a selected row changes this layer only, or every selected layer with the state. */
  scope: 'layer' | 'selection' = 'layer';
}

/**
 * Declares one value of its `tp-layer-state`, with the `tp-icon` its control shows while the
 * layer has that value; without an icon the row shows nothing.
 *
 * @slot - A `tp-icon` child.
 * @fires tp-layer-change - Bubbles after the declaration changes, so the stack reads it again.
 */
export class TpLayerStateValue extends LayerDeclaration {
  static tagName = 'tp-layer-state-value';
  static override properties = {
    ...TpElement.properties,
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    display: { type: String, reflect: true },
    dims: { type: Boolean, reflect: true },
  };
  /** The value this declares, which the state's `value` names while the layer has it. */
  value = '';
  /** Read after the state's label in the control's name; the value itself when empty. */
  label = '';
  /** Shows the control at rest, or only while the row is hovered or has focus. */
  display: 'always' | 'hover' = 'always';
  /** Dims the layer's label and icon, and everything inside a group, while it has this value. */
  dims = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-layer': TpLayer;
    'tp-layer-state': TpLayerState;
    'tp-layer-state-value': TpLayerStateValue;
  }
}
