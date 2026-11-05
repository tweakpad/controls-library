import { html, nothing } from 'lit';
import { preventComponentHandling } from '../../foundation/part.js';
import { TpCopyButton } from '../copy-button/copy-button.js';

/** The library elements the copy action renders; a field that offers it lists them as its own. */
export const inlineCopy = Object.freeze({ elements: Object.freeze([TpCopyButton]) });

export interface InlineCopyOptions {
  /** The public part name of the action, such as `input-copy`. */
  readonly part: string;
  /** The value text the row shows; nothing renders while it is empty. */
  readonly value: string;
  /** The field's name, which the action's accessible name repeats. */
  readonly name: string;
  /** Whether the row offers the action: inline, copyable and not disabled. */
  readonly enabled: boolean;
}

/**
 * The copy action of an inline field's row: a Copy button for the value the row shows. It follows
 * the value in the tree, so Tab reaches the field first, and the row places it beside its label.
 * Its presses never reach the row, which would otherwise focus, open or set the field.
 */
export function renderInlineCopy(options: InlineCopyOptions): unknown {
  if (!options.enabled || !options.value) return nothing;
  return html`<tp-copy-button
    class="inline-copy"
    part=${options.part}
    size="xs"
    .value=${options.value}
    label=${options.name ? `Copy ${options.name}` : 'Copy value'}
    @pointerdown=${preventComponentHandling}
    @click=${preventComponentHandling}
  ></tp-copy-button>`;
}
