import { css, html, nothing } from 'lit';

/**
 * The icon of an inline field's row: authored content in the `icon` slot, shown before the row,
 * outside its boundary. The box takes no space while the slot is empty; the slotted icon brings
 * its own gap, so rows with and without an icon need no state of their own.
 */
export function renderInlineIcon(part: string, enabled: boolean): unknown {
  if (!enabled) return nothing;
  return html`<span class="inline-icon" part=${part}><slot name="icon"></slot></span>`;
}

/**
 * Places the icon box before the row: it floats beside a row that is a block box in a block
 * host (rows are flex or grid boxes, which flow beside a float) and leads a flex host's row.
 * It is a control height tall, so the icon centers on the row's first line.
 */
export const inlineIconStyles = css`
  .inline-icon {
    float: inline-start;
    display: flex;
    flex: none;
    align-items: center;
    block-size: var(--tp-control-height-md);
  }

  .inline-icon ::slotted(*) {
    margin-inline-end: var(--tp-space-2);
  }
`;
