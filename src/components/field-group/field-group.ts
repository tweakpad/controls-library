import { css, html, nothing, type PropertyValues } from 'lit';
import type { CustomElementConstructorWithTag } from '../../foundation/define.js';
import { chevronDownIcon } from '../../icons/chevron-down.js';
import { linkIcon, unlinkIcon } from '../../icons/link.js';
import { TpJoinedGroup, type JoinedGroupParts } from '../shared/joined-group.js';
import type { GroupMember } from '../shared/group-members.js';
import { inlineIconStyles, renderInlineIcon } from '../shared/inline-icon.js';
import { TpButton } from '../button/button.js';
import { TpIcon } from '../icon/icon.js';
import { TpToggle } from '../toggle/toggle.js';
import type { PartPresentation, PresentationDeclarations } from '../../presentation/resolver.js';
import { fieldGroupPresentation } from '../../presentation/families/field-group.js';

/** `inline`: one compact row with the label at the start and the values at the end. */
export type FieldGroupVariant = 'default' | 'inline';

/** What a constraint's rule receives when one of its values changes. */
export interface FieldGroupConstraintChange {
  /** The position, in the constraint's `members`, of the value that changed. */
  readonly source: number;
  /** The members' values now, the changed one included; `NaN` where a value is not a number. */
  readonly values: readonly number[];
  /** The members' values when the constraint took hold. */
  readonly reference: readonly number[];
}

/**
 * Computes the values a constraint holds the other members to after `source` changed: one entry
 * per member, `undefined` (or the source's own entry) for a value to leave as it is. Returning
 * `undefined` changes nothing.
 */
export type FieldGroupConstraintRule = (
  change: FieldGroupConstraintChange,
) => readonly (number | undefined)[] | undefined;

/**
 * A relation the group keeps between some of its values while it holds, such as a locked aspect
 * ratio. An expanded inline group shows a toggle beside the values it relates.
 */
export interface FieldGroupConstraint {
  /** The values it relates: each editor's `name`, or its position among the group's editors. */
  readonly members: readonly (string | number)[];
  /** The accessible name of its toggle, such as "Keep aspect ratio". */
  readonly label: string;
  /** Whether it holds at first; its toggle switches it. Defaults to `false`. */
  readonly engaged?: boolean;
  /**
   * `proportional` keeps the values in the ratio they had when the constraint took hold; a
   * function computes the other values itself.
   */
  readonly rule: 'proportional' | FieldGroupConstraintRule;
}

/** The value editor a group child holds: an Input, or the Input inside an Input group. */
interface ValueEditor extends HTMLElement {
  value: string;
  name: string;
  inputElement?: HTMLElement | null;
  formatNumber?(text: string): string;
}

/** Keeps the values in the ratio of the reference; a zero or missing reference changes nothing. */
const proportional: FieldGroupConstraintRule = ({ source, values, reference }) => {
  const from = reference[source]!;
  const to = values[source]!;
  if (!Number.isFinite(from) || from === 0 || !Number.isFinite(to)) return undefined;
  return reference.map((value, index) =>
    index === source || !Number.isFinite(value) ? undefined : (value * to) / from,
  );
};

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
// Expanded, each member is a row of its own, painted as an inline row: its prefix leads as its
// label and its value ends the row. It keeps its own boundary, rings and invalid state.
const expandedRow: PresentationDeclarations = {
  'background-color': 'var(--tp-muted)',
  'padding-inline-start': 'var(--tp-space-1)',
  'padding-inline-end': 'var(--tp-space-2-5)',
};
// Each addon leads with the space a segment keeps from the one before it: the prefix from the
// row's edge, which then matches an inline row's inset, and a unit from its value.
const expandedAddon: PresentationDeclarations = {
  'padding-inline-start': 'var(--tp-space-1-5)',
  'padding-inline-end': '0',
};
const expandedValue: PresentationDeclarations = {
  flex: '1 1 0',
  'min-inline-size': '0',
  'padding-inline-start': '0',
  'padding-inline-end': '0',
  'text-align': 'end',
  'font-variant-numeric': 'tabular-nums',
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
 * shows the label and the values in one compact row that stacks with other inline controls, or
 * expanded, each value on a row of its own below it.
 *
 * @slot - The editors, such as Inputs, Input groups and Selects, with Toggles, Buttons or a
 * Separator between them.
 * @slot icon - An Icon before an inline Field group's row, outside its boundary.
 * @csspart field-group-row - The row of an inline Field group around its label and values.
 * @csspart field-group-label - The label at the start of an inline Field group's row.
 * @csspart field-group-icon - The box before an inline Field group's row that holds the `icon`
 * slot.
 * @csspart field-group-toggle - The Button at the end of an expandable inline Field group's row
 * that expands and collapses it.
 * @csspart field-group-rows - The rows of an expanded inline Field group, one per value, below its
 * row.
 * @csspart field-group-constraint - The bracket beside the rows a constraint relates, around its
 * toggle.
 * @csspart field-group-constraint-toggle - The Toggle that engages and releases a constraint.
 * @fires tp-expanded-change - Cancelable proposal to expand or collapse an expandable inline group
 * from its Button; `detail.value` is the proposed state.
 * @fires tp-constraint-change - Cancelable proposal to engage or release a constraint from its
 * Toggle; `detail.constraint` and `detail.value`.
 */
export class TpFieldGroup extends TpJoinedGroup {
  static tagName = 'tp-field-group';
  /** Library elements this element renders; defining it defines them too. */
  static get elementDependencies(): readonly CustomElementConstructorWithTag[] {
    return [TpButton, TpIcon, TpToggle];
  }
  static override presentation = fieldGroupPresentation;
  static override properties = {
    ...TpJoinedGroup.properties,
    variant: { type: String, reflect: true },
    expandable: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
    constraints: { attribute: false },
  };
  static override styles = [
    ...TpJoinedGroup.styles,
    inlineIconStyles,
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

      /* Inline: one row, the label at the start and the values packed at the end; expanded, the
         values follow in rows of their own, indented past a gutter for constraint toggles. */
      :host([variant='inline']) {
        display: block;
      }

      :host([variant='inline']) .group {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
      }

      .row {
        grid-column: 2;
        display: flex;
        align-items: center;
        min-inline-size: 0;
        cursor: text;
      }

      .group[data-expanded] .row {
        cursor: default;
      }

      .row ::slotted(*) {
        flex: none;
        inline-size: auto;
      }

      .toggle {
        display: inline-flex;
        flex: none;
        cursor: default;
      }

      .rows {
        grid-column: 2;
        display: grid;
        grid-template-columns:
          [gutter] calc(var(--tp-control-height-xs) + var(--tp-space-3))
          [value] minmax(0, 1fr);
        min-inline-size: 0;
      }

      .rows ::slotted(*) {
        grid-column: value;
      }

      .rows ::slotted(tp-separator) {
        display: none;
      }

      /* A bracket from the middle of its first row to the middle of its last, broken by its
         Toggle. */
      .constraint {
        grid-column: gutter;
        position: relative;
        display: flex;
        align-items: center;
      }

      .constraint::before,
      .constraint::after {
        content: '';
        position: absolute;
        inset-inline: calc(var(--tp-control-height-xs) / 2) var(--tp-space-1);
        border-color: inherit;
        border-style: solid;
        border-width: 0;
        border-inline-start-width: var(--tp-border-width);
      }

      .constraint::before {
        inset-block: calc(var(--tp-control-height-md) / 2)
          calc(50% + var(--tp-control-height-xs) / 2);
        border-block-start-width: var(--tp-border-width);
        border-start-start-radius: var(--tp-radius-sm);
      }

      .constraint::after {
        inset-block: calc(50% + var(--tp-control-height-xs) / 2)
          calc(var(--tp-control-height-md) / 2);
        border-block-end-width: var(--tp-border-width);
        border-end-start-radius: var(--tp-radius-sm);
      }

      .constraint tp-toggle {
        position: relative;
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
  /**
   * Shows a Button at the end of an inline group's row that expands and collapses it; `expanded`
   * sets the state it starts in.
   */
  expandable = false;
  /**
   * Shows each value of an inline group on an indented row of its own below the group's row, its
   * prefix as its label. Without `expandable` it always shows them so.
   */
  expanded = false;
  /**
   * Relations the group keeps between its values, such as a locked aspect ratio, each engaged and
   * released by its Toggle beside the rows of an expanded inline group. A constraint holds in
   * every variant while engaged.
   */
  constraints: readonly FieldGroupConstraint[] = [];

  protected override get observedMemberAttributes(): readonly string[] {
    return ['aria-invalid', 'invalid', 'disabled'];
  }

  protected override get memberPresentationKey(): string {
    return `${this.variant}:${this.#expanded}:${super.memberPresentationKey}`;
  }

  /** Whether the values show on rows of their own: only an inline group expands. */
  get #expanded(): boolean {
    return this.variant === 'inline' && this.expanded;
  }

  protected override memberPresentation(
    member: GroupMember,
    index: number,
    count: number,
  ): PartPresentation | undefined {
    if (this.variant !== 'inline') return super.memberPresentation(member, index, count);
    if (this.expanded) {
      if (member.part === 'input')
        return {
          input: {
            styleHook: {
              ...expandedRow,
              ...expandedValue,
              'padding-inline-start': 'var(--tp-space-2-5)',
              'padding-inline-end': 'var(--tp-space-2-5)',
            },
          },
        };
      if (member.part === 'input-group')
        return {
          'input-group': { styleHook: expandedRow },
          'input-group-addon': { styleHook: expandedAddon },
          'input-group-control': { styleHook: expandedValue },
        };
      return undefined;
    }
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
      inline &&
      !this.expanded &&
      members.some((member) => !!member.host.querySelector('[aria-invalid="true"]'));
    this.renderRoot.querySelector('.row')?.toggleAttribute('data-invalid', invalid);
    // The constraint brackets span the rows of their values, which follow the light tree.
    const layout = this.#constraintLayout();
    if (layout !== this.#layout) {
      this.#layout = layout;
      this.requestUpdate();
    }
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
    this.removeEventListener('focusin', this.#focusIn);
    this.removeEventListener('input', this.#valueInput);
    this.removeEventListener('change', this.#valueChange);
    for (const release of this.#values.values()) release();
    this.#values.clear();
  }

  /**
   * A press on the label or between the values edits the first value, as a label press does;
   * expanded, a press on the row expands and collapses it, as a press on its Button does.
   */
  readonly #rowPress = (event: MouseEvent): void => {
    if (this.variant !== 'inline') return;
    const path = event.composedPath();
    if (path.some((node) => node instanceof Element && node.parentElement === this)) return;
    if (path.some((node) => node instanceof Element && node.classList.contains('toggle'))) return;
    if (this.expanded) {
      if (this.expandable) this.#requestExpanded(false);
      return;
    }
    this.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select')?.focus();
  };

  #requestExpanded(expanded: boolean): void {
    if (expanded === this.expanded) return;
    if (!this.emit('tp-expanded-change', { value: expanded }, { cancelable: true })) return;
    this.expanded = expanded;
  }

  // Constraints ------------------------------------------------------------------------------

  /** Engaged state by constraint position and members, so a re-created list keeps it. */
  #engaged = new Map<string, { declared: boolean; engaged: boolean }>();
  /** The values each engaged constraint relates as they were when it took hold. */
  #references = new Map<string, number[]>();
  #layout = '';
  #applying = false;
  /** Editors a constraint changed during the current edit; they commit with the source. */
  #changed = new Set<ValueEditor>();

  #constraintKey(constraint: FieldGroupConstraint, index: number): string {
    return `${index}:${constraint.members.join(',')}`;
  }

  #isEngaged(constraint: FieldGroupConstraint, index: number): boolean {
    const key = this.#constraintKey(constraint, index);
    const declared = constraint.engaged ?? false;
    const state = this.#engaged.get(key);
    if (!state || state.declared !== declared) {
      this.#engaged.set(key, { declared, engaged: declared });
      if (state) this.#references.delete(key);
      return declared;
    }
    return state.engaged;
  }

  /** The rows of the group in order: its direct, shown, unslotted children. */
  #rows(): Element[] {
    return [...this.children].filter(
      (child) => !child.hasAttribute('slot') && !child.hasAttribute('hidden'),
    );
  }

  /** The value editor a row holds, if any. */
  #editorOf(row: Element): ValueEditor | null {
    if (row.localName === 'tp-input') return row as ValueEditor;
    return row.querySelector<ValueEditor>('tp-input');
  }

  /** The editors a constraint relates, in its order; `null` where a member is not found. */
  #members(constraint: FieldGroupConstraint): (ValueEditor | null)[] {
    const editors = this.#rows().flatMap((row) => {
      const editor = this.#editorOf(row);
      return editor ? [editor] : [];
    });
    return constraint.members.map((member) =>
      typeof member === 'number'
        ? (editors[member] ?? null)
        : (editors.find((editor) => editor.name === member) ?? null),
    );
  }

  /** The grid rows a constraint's bracket spans: from its first value's row to its last's. */
  #span(constraint: FieldGroupConstraint): [number, number] | undefined {
    const rows = this.#rows();
    const positions = this.#members(constraint)
      .map((editor) =>
        editor ? rows.findIndex((row) => row === editor || row.contains(editor)) : -1,
      )
      .filter((position) => position >= 0);
    if (positions.length < 2) return undefined;
    return [Math.min(...positions) + 1, Math.max(...positions) + 2];
  }

  #constraintLayout(): string {
    return this.constraints.map((constraint) => this.#span(constraint)?.join('/') ?? '-').join(' ');
  }

  #valuesOf(editors: readonly (ValueEditor | null)[]): number[] {
    return editors.map((editor) => {
      const text = editor?.value.trim() ?? '';
      return text === '' ? Number.NaN : Number(text);
    });
  }

  /** An edit starts: an engaged constraint without a reference takes the values as they are. */
  readonly #focusIn = (): void => {
    this.constraints.forEach((constraint, index) => {
      const key = this.#constraintKey(constraint, index);
      if (this.#isEngaged(constraint, index) && !this.#references.has(key))
        this.#references.set(key, this.#valuesOf(this.#members(constraint)));
    });
  };

  /** A value changed: each engaged constraint that relates it sets its other values. */
  readonly #valueInput = (event: Event): void => {
    if (this.#applying) return;
    const editor = (event.target as Element | null)?.closest?.('tp-input') as ValueEditor | null;
    if (!editor) return;
    this.constraints.forEach((constraint, index) => {
      if (!this.#isEngaged(constraint, index)) return;
      const editors = this.#members(constraint);
      const source = editors.indexOf(editor);
      if (source < 0) return;
      const key = this.#constraintKey(constraint, index);
      const values = this.#valuesOf(editors);
      const reference = this.#references.get(key) ?? values;
      const rule = constraint.rule === 'proportional' ? proportional : constraint.rule;
      const next = rule({ source, values, reference });
      if (!next) return;
      next.forEach((value, position) => {
        const target = editors[position];
        if (position === source || !target || value === undefined || !Number.isFinite(value))
          return;
        this.#write(target, value);
      });
    });
  };

  /**
   * Writes a value into an editor as an edit does: a number value snaps to the editor's step grid
   * (whole numbers without a `step`), so a held ratio never leaves it invalid, and shows in its
   * precision.
   */
  #write(editor: ValueEditor, value: number): void {
    const input = editor.inputElement ?? editor.querySelector('input');
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type === 'number' && input.step.trim().toLowerCase() !== 'any') {
      const step = input.step.trim() === '' ? 1 : Number(input.step);
      const base =
        input.min.trim() !== '' && Number.isFinite(Number(input.min)) ? Number(input.min) : 0;
      if (Number.isFinite(step) && step > 0)
        value = base + Math.round((value - base) / step) * step;
    }
    const raw = String(Number(value.toPrecision(12)));
    const text = editor.formatNumber?.(raw) ?? raw;
    if (input.value === text) return;
    input.value = text;
    this.#applying = true;
    try {
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    } finally {
      this.#applying = false;
    }
    this.#changed.add(editor);
  }

  /**
   * The source commits: the values a constraint changed commit after it, once its own change event
   * has reached every listener.
   */
  readonly #valueChange = (event: Event): void => {
    if (this.#applying || !this.#changed.size) return;
    const source = (event.target as Element | null)?.closest?.('tp-input');
    const changed = [...this.#changed].filter((editor) => editor !== source);
    this.#changed.clear();
    setTimeout(() => {
      this.#applying = true;
      try {
        for (const editor of changed) {
          const input = editor.inputElement ?? editor.querySelector('input');
          input?.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } finally {
        this.#applying = false;
      }
    });
  };

  #toggleConstraint(constraint: FieldGroupConstraint, index: number, engaged: boolean): void {
    if (!this.emit('tp-constraint-change', { constraint, value: engaged }, { cancelable: true }))
      return;
    const key = this.#constraintKey(constraint, index);
    this.#engaged.set(key, { declared: constraint.engaged ?? false, engaged });
    if (engaged) this.#references.set(key, this.#valuesOf(this.#members(constraint)));
    else this.#references.delete(key);
    this.requestUpdate();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('focusin', this.#focusIn);
    this.addEventListener('input', this.#valueInput);
    this.addEventListener('change', this.#valueChange);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('variant') || changed.has('expanded')) this.sync();
    if (changed.has('constraints')) this.#layout = this.#constraintLayout();
    this.#syncToggle();
  }

  /** The expand Button announces its state, as a disclosure button does. */
  #syncToggle(): void {
    const button = this.renderRoot.querySelector<TpButton>('[part~="field-group-toggle"]');
    if (!button) return;
    void button.updateComplete.then(() => {
      const target = button.shadowRoot?.querySelector<HTMLElement>('button');
      target?.setAttribute('aria-expanded', String(this.expanded));
      const rows = this.renderRoot.querySelector<HTMLElement>('.rows');
      if (target) target.ariaControlsElements = rows ? [rows] : null;
    });
  }

  #renderConstraints(state: Record<string, unknown>) {
    return this.constraints.map((constraint, index) => {
      const span = this.#span(constraint);
      if (!span) return nothing;
      const engaged = this.#isEngaged(constraint, index);
      return this.renderPart('field-group-constraint', state, {
        tag: 'div',
        properties: {
          class: 'constraint',
          style: { 'grid-row': `${span[0]} / ${span[1]}` },
          'data-engaged': engaged,
        },
        content: html`<tp-toggle
          part="field-group-constraint-toggle"
          size="icon-xs"
          .pressed=${engaged}
          aria-label=${constraint.label}
          @tp-value-change=${(event: CustomEvent<{ value: boolean }>) => {
            event.preventDefault();
            this.#toggleConstraint(constraint, index, event.detail.value);
          }}
          ><tp-icon .icon=${engaged ? linkIcon : unlinkIcon}></tp-icon
        ></tp-toggle>`,
      });
    });
  }

  protected override render() {
    const inline = this.variant === 'inline';
    const expanded = this.#expanded;
    const state = {
      orientation: this.orientation,
      joined: this.joined,
      variant: this.variant,
      expanded,
    };
    const slot = html`<slot @slotchange=${this.sync}></slot>`;
    return this.renderPart(this.groupParts.root, state, {
      tag: 'div',
      properties: {
        class: 'group',
        role: 'group',
        'aria-label': this.getAttribute('aria-label') ?? this.label,
        '.ariaLabelledByElements': this.ariaLabelledByElements,
        'data-expanded': expanded,
      },
      content: inline
        ? html`${renderInlineIcon('field-group-icon', true)}${this.renderPart(
            'field-group-row',
            state,
            {
              tag: 'div',
              properties: {
                class: 'row',
                'data-expandable': this.expandable,
                '@click': this.#rowPress,
              },
              content: html`${
                this.label
                  ? this.renderPart('field-group-label', state, {
                      tag: 'span',
                      // The group is named by `label`; this copy is visual.
                      properties: { class: 'label', 'aria-hidden': 'true' },
                      content: this.label,
                    })
                  : nothing
              }${expanded ? nothing : slot}${this.expandable ? this.#renderToggle(state) : nothing}`,
            },
          )}${
            expanded
              ? this.renderPart('field-group-rows', state, {
                  tag: 'div',
                  properties: { class: 'rows' },
                  content: html`${this.#renderConstraints(state)}${slot}`,
                })
              : nothing
          }`
        : slot,
    });
  }

  #renderToggle(state: Record<string, unknown>) {
    return html`<span class="toggle"
      ><tp-button
        part="field-group-toggle"
        variant="ghost"
        size="icon-xs"
        .icon=${chevronDownIcon}
        .ariaLabel=${this.label ? `Expand ${this.label}` : 'Expand'}
        data-expanded=${state.expanded ? '' : nothing}
        @click=${() => this.#requestExpanded(!this.expanded)}
      ></tp-button
    ></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-field-group': TpFieldGroup;
  }
}
