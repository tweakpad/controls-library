import { css, html, nothing, type PropertyValues } from 'lit';
import { TpJoinedGroup, type JoinedGroupParts } from '../shared/joined-group.js';
import type { GroupMember } from '../shared/group-members.js';
import type { PartPresentation, PresentationDeclarations } from '../../presentation/resolver.js';
import { fieldGroupPresentation } from '../../presentation/families/field-group.js';

/** `inline`: one compact row with the label at the start and the values at the end. */
export type FieldGroupVariant = 'default' | 'inline';

// An inline row is the boundary: its editors become segments of text inside it, a muted prefix
// before each value, with no edge, fill, ring or radius of their own. Longhands only: the hooks
// that join the members write the same longhands, and a shorthand read back after one of them
// changed no longer matches what was written, so switching variants could not undo it.
const segmentBoundary: PresentationDeclarations = {
  'min-height': '0',
  'border-block-start-width': '0',
  'border-block-end-width': '0',
  'border-inline-start-width': '0',
  'border-inline-end-width': '0',
  'border-start-start-radius': '0',
  'border-start-end-radius': '0',
  'border-end-start-radius': '0',
  'border-end-end-radius': '0',
  'background-color': 'transparent',
  'box-shadow': 'none',
  'outline-style': 'none',
};
// A value is as wide as its text, so the values pack at the row's end like a single inline value.
const segmentValue: PresentationDeclarations = {
  'field-sizing': 'content',
  'inline-size': 'auto',
  'min-inline-size': '1ch',
  // A long value scrolls inside its own segment instead of pushing the row's others out.
  'max-inline-size': '8ch',
  // The row rings for its segments, the invalid one included.
  'outline-style': 'none',
  'padding-inline-start': '0',
  'padding-inline-end': '0',
  'text-align': 'end',
  'font-variant-numeric': 'tabular-nums',
};

/**
 * Joins the editors of one compound value, such as width and height or color channels, into a
 * single seamed row. Each editor keeps its own value, name, label, form participation and
 * validation; the group owns only the layout, the seams and the group name. The inline variant
 * shows the label and the values in one compact row that stacks with other inline controls.
 *
 * @slot - The editors, such as Inputs, Input groups and Selects, with Toggles, Buttons or a
 * Separator between them.
 * @csspart field-group-label - The label at the start of an inline Field group's row.
 */
export class TpFieldGroup extends TpJoinedGroup {
  static tagName = 'tp-field-group';
  static override presentation = fieldGroupPresentation;
  static override properties = {
    ...TpJoinedGroup.properties,
    variant: { type: String, reflect: true },
  };
  static override styles = [
    ...TpJoinedGroup.styles,
    css`
      :host {
        display: flex;
      }

      /* Editors share the main axis equally unless one declares its own size. */
      ::slotted(tp-input),
      ::slotted(tp-input-group),
      ::slotted(tp-text-area),
      ::slotted(tp-select),
      ::slotted(tp-native-select) {
        flex: 1 1 0;
      }

      /* Inline: one row, the label at the start and the values packed at the end. */
      :host([variant='inline']) {
        display: block;
      }

      :host([variant='inline']) .group {
        flex-direction: row;
        align-items: center;
        cursor: text;
      }

      :host([variant='inline']) ::slotted(*) {
        flex: none;
        inline-size: auto;
      }

      .label {
        flex: 0 1 auto;
        min-inline-size: 0;
        margin-inline-end: auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];
  protected readonly groupParts: JoinedGroupParts = {
    root: 'field-group',
    control: 'field-group-control',
    separator: 'field-group-separator',
  };
  /**
   * The accessible name of the compound value, such as "Canvas size"; each editor still needs
   * its own label. An inline Field group shows it at the start of its row.
   */
  override label = 'Values';
  /**
   * `inline` shows the label and the values in one compact control-height row that stacks with
   * other inline controls; the editors become segments of the row, each value after its prefix.
   */
  variant: FieldGroupVariant = 'default';

  protected override get observedMemberAttributes(): readonly string[] {
    return ['aria-invalid', 'invalid', 'disabled'];
  }

  protected override get memberPresentationKey(): string {
    return `${this.variant}:${super.memberPresentationKey}`;
  }

  protected override memberPresentation(
    member: GroupMember,
    index: number,
    count: number,
  ): PartPresentation | undefined {
    if (this.variant !== 'inline') return super.memberPresentation(member, index, count);
    // A bare Input is its own boundary: it fills the row inside the row's borders.
    if (member.part === 'input')
      return {
        input: {
          styleHook: {
            ...segmentBoundary,
            ...segmentValue,
            'block-size': 'calc(var(--tp-control-height-md) - var(--tp-border-width) * 2)',
          },
        },
      };
    if (member.part === 'input-group')
      return {
        // One line of prefix, value and suffix: the boundary's grid keeps tracks for hidden
        // addons, which a flex row drops.
        'input-group': {
          styleHook: {
            ...segmentBoundary,
            display: 'flex',
            'align-items': 'center',
            'column-gap': 'var(--tp-space-1-5)',
          },
        },
        'input-group-addon': {
          styleHook: { 'padding-inline-start': '0', 'padding-inline-end': '0' },
        },
        'input-group-control': { styleHook: segmentValue },
      };
    return { [member.part]: { styleHook: segmentBoundary } };
  }

  #values = new Map<HTMLElement, () => void>();

  /**
   * The row shows a member's invalid state, since segments draw no ring of their own, and each
   * segment's native editor takes the group's value part for what a style hook cannot reach.
   */
  protected override membersSynced(members: readonly GroupMember[]): void {
    const inline = this.variant === 'inline';
    const invalid =
      inline && members.some((member) => !!member.host.querySelector('[aria-invalid="true"]'));
    this.renderRoot.querySelector('.group')?.toggleAttribute('data-invalid', invalid);
    const values = new Set<HTMLElement>();
    if (inline)
      for (const member of members) {
        const host = member.host as GroupMember['host'] & { inputElement?: HTMLElement | null };
        const native =
          host.inputElement ?? host.querySelector<HTMLElement>('input, textarea') ?? null;
        if (native) values.add(native);
      }
    for (const [native, release] of this.#values)
      if (!values.has(native)) {
        release();
        this.#values.delete(native);
      }
    for (const native of values)
      if (!this.#values.has(native))
        this.#values.set(
          native,
          this.presentationController.registerPart('field-group-value', native),
        );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const release of this.#values.values()) release();
    this.#values.clear();
  }

  /** A press on the label or between the values edits the first value, as a label press does. */
  readonly #rowPress = (event: MouseEvent): void => {
    if (this.variant !== 'inline') return;
    const path = event.composedPath();
    if (path.some((node) => node instanceof Element && node.parentElement === this)) return;
    this.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select')?.focus();
  };

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('variant')) this.sync();
  }

  protected override render() {
    const inline = this.variant === 'inline';
    return this.renderPart(
      this.groupParts.root,
      { orientation: this.orientation, joined: this.joined, variant: this.variant },
      {
        tag: 'div',
        properties: {
          class: 'group',
          role: 'group',
          'aria-label': this.getAttribute('aria-label') ?? this.label,
          '.ariaLabelledByElements': this.ariaLabelledByElements,
          '@click': this.#rowPress,
        },
        content: html`${
            inline && this.label
              ? this.renderPart(
                  'field-group-label',
                  { variant: this.variant },
                  {
                    tag: 'span',
                    // The group is named by `label`; this copy is visual.
                    properties: { class: 'label', 'aria-hidden': 'true' },
                    content: this.label,
                  },
                )
              : nothing
          }<slot @slotchange=${this.sync}></slot>`,
      },
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-field-group': TpFieldGroup;
  }
}
