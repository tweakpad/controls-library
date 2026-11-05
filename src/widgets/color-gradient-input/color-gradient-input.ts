import { css, html, nothing, type PropertyValues } from 'lit';
import { ControllableState } from '../../foundation/controllable-state.js';
import { defaultTrue } from '../../foundation/converters.js';
import type { CustomElementConstructorWithTag } from '../../foundation/define.js';
import {
  applyKeyboardStep,
  stepForKey,
  type DimensionDefinition,
} from '../../foundation/dimension-step.js';
import { TpValueChangeEvent, TpValueCommitEvent } from '../../foundation/events.js';
import { TpFormElement } from '../../foundation/form-element.js';
import { bindPart } from '../../foundation/part.js';
import { PointerDrag, type PointerDragPoint } from '../../foundation/pointer-drag.js';
import { stateMarkers } from '../../foundation/state-markers.js';
import type { ChangeReason } from '../../foundation/types.js';
import { parseColor } from '../../foundation/color/parse.js';
import { displayColor } from '../../foundation/color/serialize.js';
import type { ColorValue } from '../../foundation/color/types.js';
import { trashIcon } from '../../icons/trash.js';
import { TpButton } from '../../components/button/button.js';
import { rangeHandleStyles } from '../../components/shared/control-styles.js';
import { colorGradientInputPresentation } from '../../presentation/families/color-gradient-input.js';
import {
  MIDPOINT_MAX,
  MIDPOINT_MIN,
  colorGradientTrackPaint,
  insertColorGradientStop,
  moveColorGradientMidpoint,
  moveColorGradientStop,
  normalizeColorGradientStops,
  removeColorGradientStop,
  sameColorGradientStops,
  sampleColorGradient,
  type ColorGradientInterpolation,
  type ColorGradientStop,
} from './model.js';
import { format, resolveStrings, type ColorGradientInputStrings } from './strings.js';

/** The value of every lane event: the stops, or the selected stop's index. */
export type ColorGradientInputValueChangeCallback = (
  event: TpValueChangeEvent<readonly ColorGradientStop[]>,
) => void;
export type ColorGradientInputValueCommitCallback = (
  event: TpValueCommitEvent<readonly ColorGradientStop[]>,
) => void;
export type ColorGradientInputSelectionChangeCallback = (event: TpValueChangeEvent<number>) => void;
export type ColorGradientInputSize = 'sm' | 'default';

type Active = { readonly kind: 'stop' | 'midpoint'; index: number };

/** Stops written as JSON in the `default-value` attribute. */
const stopsConverter = {
  fromAttribute(value: string | null): readonly ColorGradientStop[] | undefined {
    if (value === null) return undefined;
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? normalizeColorGradientStops(parsed) : undefined;
    } catch {
      return undefined;
    }
  },
};

const percent = (value: number): string => `${Math.round(value * 1000) / 10}%`;

/**
 * Edits the color stops of a gradient: where each stop sits, where each pair of neighbors mixes
 * half and half (the midpoint), which stop is selected, and which stops exist. A press on the
 * track adds a stop in the gradient's own color there; a stop dragged past a neighbor passes it.
 * It edits the stops only: a stop's color, the gradient's angle or shape and how it is drawn
 * belong to the controls and the renderer an app composes around it, through `value` and
 * `selected`.
 *
 * @fires tp-value-change - Cancelable proposal of new stops: live while a stop or midpoint is
 * dragged, and for each key, press and removal.
 * @fires tp-value-commit - Settled stops: once per drag on release, and at once for keys, a
 * press that adds a stop and a removal.
 * @fires tp-selection-change - Cancelable proposal of the selected stop's index (`-1` for none).
 * @fires tp-field-value - Each committed value, for a surrounding Field's validation state.
 * @csspart color-gradient-input - The root group named by the label.
 * @csspart color-gradient-input-track - The bar painted with the gradient.
 * @csspart color-gradient-input-stop - A stop's round handle, in its own color.
 * @csspart color-gradient-input-midpoint - A midpoint's diamond handle above the track.
 * @csspart color-gradient-input-remove - The Button that removes the selected stop.
 * @csspart focusable - The native range input inside each stop and midpoint, which takes focus.
 */
export class TpColorGradientInput extends TpFormElement<readonly ColorGradientStop[]> {
  static tagName = 'tp-color-gradient-input';
  /** Library elements this element renders; defining it defines them too. */
  static get elementDependencies(): readonly CustomElementConstructorWithTag[] {
    return [TpButton];
  }
  static override presentation = colorGradientInputPresentation;
  static override properties = {
    ...TpFormElement.properties,
    value: { attribute: false, noAccessor: true },
    defaultValue: { attribute: 'default-value', converter: stopsConverter },
    selected: { type: Number, noAccessor: true },
    defaultSelected: { type: Number, attribute: 'default-selected' },
    interpolation: { type: String },
    minStops: { type: Number, attribute: 'min-stops' },
    removable: { converter: defaultTrue, reflect: true },
    step: { type: Number },
    size: { type: String, reflect: true },
    label: { type: String },
    required: { type: Boolean, reflect: true },
    strings: { attribute: false },
    onValueChange: { attribute: false },
    onValueCommitted: { attribute: false },
    onSelectionChange: { attribute: false },
  };
  static override styles = [
    TpFormElement.styles,
    css`
      :host {
        display: block;
        min-inline-size: 0;
      }

      /* The diamonds ride above the track; the stops and the delete Button share its row. */
      .root {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows:
          calc(var(--_tp-color-gradient-input-midpoint) * 2)
          var(--_tp-color-gradient-input-row);
        align-items: center;
        min-inline-size: 0;
      }

      .surface {
        grid-row: 1 / 3;
        grid-column: 1;
        align-self: stretch;
        position: relative;
        min-inline-size: 0;
        touch-action: none;
        user-select: none;
        cursor: copy;
      }

      .surface[data-locked] {
        cursor: default;
      }

      .track {
        position: absolute;
        inset-inline: 0;
        inset-block-end: calc(
          (var(--_tp-color-gradient-input-row) - var(--_tp-color-gradient-input-track)) / 2
        );
        block-size: var(--_tp-color-gradient-input-track);
      }

      /* Positions 0 and 1 sit on the track's rounded ends: the handles span an inset frame. */
      .frame {
        position: absolute;
        inset-block: 0;
        inset-inline: calc(var(--_tp-color-gradient-input-stop) / 2);
        pointer-events: none;
      }

      .stop,
      .midpoint {
        position: absolute;
        pointer-events: auto;
        touch-action: none;
        cursor: grab;
      }

      .surface[data-locked] :is(.stop, .midpoint) {
        cursor: default;
      }

      .stop {
        inset-block-end: calc(
          (var(--_tp-color-gradient-input-row) - var(--_tp-color-gradient-input-stop)) / 2
        );
        margin-inline-start: calc(var(--_tp-color-gradient-input-stop) / -2);
      }

      /* The selected and the dragged stop paint above their neighbors. */
      .stop[data-selected] {
        z-index: 1;
      }

      .stop[data-dragging] {
        z-index: 2;
      }

      /* The hit box stays square so it never reaches the track; only the diamond turns. */
      .midpoint {
        /* Above the stops' hit areas in the row over the track. */
        z-index: 3;
        inset-block-start: calc(var(--_tp-color-gradient-input-midpoint) * 0.5);
        inline-size: var(--_tp-color-gradient-input-midpoint);
        block-size: var(--_tp-color-gradient-input-midpoint);
        margin-inline-start: calc(var(--_tp-color-gradient-input-midpoint) / -2);
      }

      .diamond {
        position: absolute;
        inset: 0;
        box-sizing: border-box;
        rotate: 45deg;
      }

      .midpoint[hidden] {
        display: none;
      }

      .remove {
        grid-row: 2;
        grid-column: 2;
        margin-inline-start: var(--tp-space-2);
      }

      ${rangeHandleStyles('.stop, .midpoint')}

      /* A midpoint's hit area keeps to the row above the track, so a press on the track always
         adds a stop. */
      .midpoint::after {
        inset-block: calc(var(--_tp-color-gradient-input-midpoint) * -0.5);
      }
    `,
  ];

  /** Stops the element starts with when `value` is not set. */
  defaultValue: readonly ColorGradientStop[] | undefined;
  /** The selected stop's index when `selected` is not set; `-1` selects none. */
  defaultSelected: number | undefined;
  /**
   * The color space neighboring stops mix in, for the track and `sample()`; match the renderer
   * that draws the stops.
   */
  interpolation: ColorGradientInterpolation = 'oklab';
  /** The fewest stops the gradient keeps; removing below it is refused. */
  minStops = 2;
  /** Shows the Button that removes the selected stop; `removable="false"` hides it. */
  removable = true;
  /** How far an Arrow key moves a stop or midpoint, as a fraction of the gradient. */
  step = 0.01;
  /** The track, handle and Button size; `sm` fits a compact panel. */
  size: ColorGradientInputSize = 'default';
  /** The accessible name of the group; each handle's name follows it. */
  label = '';
  /** Requires at least one stop for a valid form value. */
  required = false;
  /** Replaces the announced and shown words. */
  strings: Partial<ColorGradientInputStrings> = {};
  /**
   * Called synchronously with each `tp-value-change` proposal, before listeners; a controlled owner
   * writes `value` back here to accept it.
   */
  onValueChange: ColorGradientInputValueChangeCallback | undefined;
  /** Called with each settled value: once per drag, and at once for keys, presses and removals. */
  onValueCommitted: ColorGradientInputValueCommitCallback | undefined;
  /**
   * Called synchronously with each `tp-selection-change` proposal; a controlled owner writes
   * `selected` back here to accept it.
   */
  onSelectionChange: ColorGradientInputSelectionChangeCallback | undefined;

  #provided: readonly ColorGradientStop[] | undefined;
  #providedSelected: number | undefined;
  #surface: HTMLElement | null = null;
  #frame: HTMLElement | null = null;
  #drag: PointerDrag | undefined;
  /** The gesture's stops and selection before the press, restored by Escape. */
  #pressed: { stops: readonly ColorGradientStop[]; selected: number } | undefined;
  /** The stops a drag moves from: the pressed stops, with the stop a press added. */
  #base: readonly ColorGradientStop[] | undefined;
  #baseIndex = -1;
  #active: Active | undefined;
  #dragging = false;
  #focused: Active | undefined;
  #focusVisible = false;

  readonly #state = new ControllableState<readonly ColorGradientStop[]>({
    host: this,
    initialValue: [],
    readControlledValue: () =>
      this.#provided === undefined ? undefined : normalizeColorGradientStops(this.#provided),
    readDefaultValue: () =>
      this.defaultValue === undefined ? undefined : normalizeColorGradientStops(this.defaultValue),
    hasDefaultValue: () => this.defaultValue !== undefined,
    equals: sameColorGradientStops,
    onChange: (event) => this.onValueChange?.(event),
    onCommit: (value, previous, reason) =>
      this.emit('tp-field-value', { value, previousValue: previous, reason }),
    diagnostic: (message) => this.diagnose('color-gradient-input-state', message),
  });
  readonly #selectedState = new ControllableState<number>({
    host: this,
    initialValue: -1,
    readControlledValue: () => this.#providedSelected,
    readDefaultValue: () => this.defaultSelected,
    hasDefaultValue: () => this.defaultSelected !== undefined,
    equals: (a, b) => a === b,
    eventFactory: (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent(value, previous, reason, sourceEvent, options, 'tp-selection-change'),
    onChange: (event) => this.onSelectionChange?.(event),
    diagnostic: (message) => this.diagnose('color-gradient-input-selection', message),
  });

  // ---- public lanes --------------------------------------------------------------------------

  /** The stops in gradient order. Setting it makes the element controlled. */
  override get value(): readonly ColorGradientStop[] {
    return this.#state.value;
  }
  override set value(value: readonly ColorGradientStop[]) {
    const previous = this.value;
    this.#provided = value === null || value === undefined ? undefined : value;
    if (this.hasUpdated) this.#state.sync();
    this.requestUpdate('value', previous);
  }

  /** The selected stop's index, `-1` for none. Setting it makes the selection controlled. */
  get selected(): number {
    const index = this.#selectedState.value;
    return Number.isInteger(index) && index >= 0 && index < this.value.length ? index : -1;
  }
  set selected(value: number) {
    const previous = this.selected;
    this.#providedSelected =
      value === null || value === undefined || !Number.isFinite(value) ? undefined : value;
    if (this.hasUpdated) this.#selectedState.sync();
    this.requestUpdate('selected', previous);
  }

  /** Whether an owner supplies `value`. */
  get controlled(): boolean {
    return this.#state.controlled;
  }

  /**
   * Proposes new stops as an edit does: published at once while uncontrolled, asked of the owner
   * while controlled. Returns whether the proposal was accepted.
   */
  setValue(
    stops: readonly ColorGradientStop[],
    reason: ChangeReason = 'programmatic',
    sourceEvent?: Event,
  ): boolean {
    const previous = this.value;
    const next = normalizeColorGradientStops(stops);
    if (sameColorGradientStops(previous, next)) return true;
    if (!this.#propose(next, reason, sourceEvent)) return false;
    this.#commit(previous, reason, sourceEvent);
    return true;
  }

  /**
   * Changes one stop from a control composed around the element, such as its color or location.
   * A stop that moves past a neighbor passes it, and stays selected if it was. Returns whether
   * the proposal was accepted.
   */
  setStop(
    index: number,
    changes: Partial<ColorGradientStop>,
    reason: ChangeReason = 'programmatic',
    sourceEvent?: Event,
  ): boolean {
    const previous = this.value;
    const stop = previous[index];
    if (!stop) return false;
    const edited = previous.map((entry, at) => (at === index ? { ...entry, ...changes } : entry));
    const moved =
      changes.position === undefined
        ? { stops: normalizeColorGradientStops(edited), index }
        : moveColorGradientStop(
            previous.map((entry, at) =>
              at === index ? { ...entry, ...changes, position: entry.position } : entry,
            ),
            index,
            changes.position,
          );
    if (sameColorGradientStops(previous, moved.stops)) return true;
    if (!this.#propose(moved.stops, reason, sourceEvent)) return false;
    if (this.selected === index) this.#select(moved.index, reason, sourceEvent);
    this.#commit(previous, reason, sourceEvent);
    return true;
  }

  /** Proposes the selected stop's index (`-1` for none); returns whether it was accepted. */
  setSelected(index: number, reason: ChangeReason = 'programmatic', sourceEvent?: Event): boolean {
    const next = Number.isInteger(index) && index >= 0 && index < this.value.length ? index : -1;
    if (next === this.selected) return true;
    return this.#selectedState.set(next, reason, sourceEvent);
  }

  /** The color of the gradient at `t` (0–1), mixed in `interpolation`. */
  sample(t: number): ColorValue {
    return sampleColorGradient(this.value, t, this.interpolation);
  }

  // ---- lifecycle -----------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    // Field discovers its control through this marker.
    this.setAttribute('data-field-control', '');
  }

  override disconnectedCallback(): void {
    this.#drag?.disconnect();
    this.#drag = undefined;
    this.#surface = null;
    this.#endGesture();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    this.#state.initialize();
    this.#selectedState.initialize();
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    const stops = this.value;
    const text = stops.length ? JSON.stringify(stops) : null;
    this.setFormValue(text, text);
    this.setRequiredValidity(this.required && !stops.length, 'Add at least one stop.');
    const input = this.renderRoot.querySelector<HTMLInputElement>('input:focus');
    if (input && input.matches(':focus-visible') !== this.#focusVisible) {
      this.#focusVisible = input.matches(':focus-visible');
      this.requestUpdate();
    }
  }

  protected override resetFormValue(): void {
    this.#state.reset();
  }

  override formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    const stops = stopsConverter.fromAttribute(state);
    if (stops) this.#state.set(stops, 'programmatic', undefined, { cancelable: false });
  }

  override get inputElement(): HTMLElement | null {
    return this.#input({ kind: 'stop', index: Math.max(0, this.selected) });
  }

  protected override focusTarget(): HTMLElement | null {
    return this.inputElement ?? super.focusTarget();
  }

  protected override associationTarget(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('[part~="color-gradient-input"]');
  }

  // ---- proposals -----------------------------------------------------------------------------

  get #editable(): boolean {
    return !this.effectiveDisabled && !this.readOnly;
  }

  get #text(): ColorGradientInputStrings {
    return resolveStrings(this.strings);
  }

  #propose(stops: readonly ColorGradientStop[], reason: ChangeReason, source?: Event): boolean {
    return this.#state.set(stops, reason, source);
  }

  #select(index: number, reason: ChangeReason, source?: Event): void {
    if (index !== this.selected) this.#selectedState.set(index, reason, source);
  }

  /**
   * Emits the commit once the proposal settles: at once while uncontrolled, after the owner's
   * write-back render while controlled.
   */
  #commit(previous: readonly ColorGradientStop[], reason: ChangeReason, source?: Event): void {
    const finish = (): void => {
      const value = this.value;
      if (sameColorGradientStops(previous, value)) return;
      const event = new TpValueCommitEvent(value, previous, reason, source);
      this.onValueCommitted?.(event);
      this.dispatchEvent(event);
    };
    if (!this.controlled) finish();
    else void Promise.resolve().then(() => this.updateComplete.then(finish));
  }

  /** Removes the stop at `index` and selects its neighbor; returns whether it was removed. */
  #remove(index: number, reason: ChangeReason, source?: Event): boolean {
    if (!this.#editable) return false;
    const previous = this.value;
    const next = removeColorGradientStop(previous, index, this.minStops);
    if (!next || !this.#propose(next, reason, source)) return false;
    this.#select(Math.min(index, next.length - 1), reason, source);
    this.#commit(previous, reason, source);
    return true;
  }

  /** The remove Button keeps focus while it can remove more; at the minimum, the stop takes it. */
  readonly #removePress = (event: MouseEvent): void => {
    if (!this.#remove(this.selected, 'item-press', event)) return;
    if (this.value.length <= Math.max(0, this.minStops))
      this.#focusLater({ kind: 'stop', index: Math.max(0, this.selected) });
  };

  // ---- pointer -------------------------------------------------------------------------------

  #surfaceReference = (element: HTMLElement | null): void => {
    if (element === this.#surface) return;
    this.#drag?.disconnect();
    this.#drag = undefined;
    this.#surface = element;
    if (!element) return;
    this.#drag = new PointerDrag({
      element,
      owner: this.ownerDocument.defaultView,
      disabled: () => !this.#editable,
      // A press inside a handle drags it from where it was pressed.
      grip: (event) => (event.target as Element | null)?.closest?.('.stop, .midpoint'),
      focusTarget: () => (this.#active ? this.#input(this.#active) : null),
      handlers: {
        begin: (point, event) => this.#begin(point, event),
        move: (point, event) => {
          if (!this.#active) return;
          this.#dragging = true;
          this.#moveTo(point, 'drag', event);
          this.requestUpdate();
        },
        end: (point, event, dragged) => {
          const pressed = this.#pressed;
          if (this.#active && dragged) this.#moveTo(point, 'drag', event);
          this.#endGesture();
          this.requestUpdate();
          if (pressed) this.#commit(pressed.stops, dragged ? 'drag' : 'track-press', event);
        },
        cancel: (reason, event) => {
          const pressed = this.#pressed;
          this.#endGesture();
          this.requestUpdate();
          if (!pressed) return;
          const why: ChangeReason = reason === 'escape' ? 'escape-key' : 'pointer';
          this.#propose(pressed.stops, why, event ?? undefined);
          this.#select(pressed.selected, why, event ?? undefined);
        },
      },
    });
    this.#drag.connect();
  };

  #frameReference = (element: HTMLElement | null): void => {
    this.#frame = element;
  };

  #endGesture(): void {
    this.#dragging = false;
    this.#active = undefined;
    this.#pressed = undefined;
    this.#base = undefined;
    this.#baseIndex = -1;
  }

  /** Where a surface position falls along the gradient (0–1), in the writing direction. */
  #positionAt(point: PointerDragPoint): number {
    const frame = this.#frame;
    const left = frame?.offsetLeft ?? 0;
    const width = frame?.offsetWidth || point.width || 1;
    const fraction = Math.min(1, Math.max(0, (point.x - left) / width));
    return this.direction === 'rtl' ? 1 - fraction : fraction;
  }

  /** Resolves a press: a stop or midpoint to drag, or a new stop where the track was pressed. */
  #begin(point: PointerDragPoint, event: PointerEvent): boolean | undefined {
    const stops = this.value;
    const target = (event.target as Element | null)?.closest?.<HTMLElement>('.stop, .midpoint');
    this.#pressed = { stops, selected: this.selected };
    if (target) {
      const index = Number(target.dataset.index);
      const kind = target.classList.contains('stop') ? 'stop' : 'midpoint';
      this.#active = { kind, index };
      this.#base = stops;
      this.#baseIndex = index;
      if (kind === 'stop') this.#select(index, 'item-press', event);
      return undefined;
    }
    const added = insertColorGradientStop(stops, this.#positionAt(point), this.interpolation);
    if (!this.#propose(added.stops, 'track-press', event)) {
      this.#pressed = undefined;
      return false;
    }
    this.#select(added.index, 'track-press', event);
    this.#active = { kind: 'stop', index: added.index };
    this.#base = added.stops;
    this.#baseIndex = added.index;
    return undefined;
  }

  /** Moves the active handle to a surface position, from the stops the gesture started with. */
  #moveTo(point: PointerDragPoint, reason: ChangeReason, source: Event): void {
    const active = this.#active;
    const base = this.#base;
    if (!active || !base) return;
    const at = this.#positionAt(point);
    if (active.kind === 'stop') {
      const moved = moveColorGradientStop(base, this.#baseIndex, at);
      if (
        this.#propose(moved.stops, reason, source) ||
        sameColorGradientStops(moved.stops, this.value)
      ) {
        active.index = moved.index;
        this.#select(moved.index, reason, source);
      }
      return;
    }
    const from = base[active.index];
    const to = base[active.index + 1];
    if (!from || !to || to.position <= from.position) return;
    const midpoint = (at - from.position) / (to.position - from.position);
    this.#propose(moveColorGradientMidpoint(base, active.index, midpoint), reason, source);
  }

  // ---- keyboard ------------------------------------------------------------------------------

  get #dimension(): DimensionDefinition {
    const step = this.step > 0 && Number.isFinite(this.step) ? Math.min(this.step, 1) : 0.01;
    return { min: 0, max: 1, step, smallStep: step / 10, largeStep: Math.min(1, step * 10) };
  }

  #keyDown = (event: KeyboardEvent): void => {
    if (!this.#editable) return;
    const input = event.currentTarget as HTMLInputElement;
    const active: Active = {
      kind: input.dataset.kind === 'midpoint' ? 'midpoint' : 'stop',
      index: Number(input.dataset.index),
    };
    const stops = this.value;
    if (active.kind === 'stop' && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      if (this.#remove(active.index, 'keyboard', event))
        this.#focusLater({ kind: 'stop', index: Math.min(active.index, this.value.length - 1) });
      return;
    }
    const step = stepForKey(event, {
      definition: this.#dimension,
      axis: 'both',
      direction: this.direction,
    });
    if (!step) return;
    event.preventDefault();
    if (active.kind === 'stop') {
      const stop = stops[active.index];
      if (!stop) return;
      const at = applyKeyboardStep(stop.position, step, this.#dimension);
      const moved = moveColorGradientStop(stops, active.index, at);
      if (!this.#propose(moved.stops, 'keyboard', event)) return;
      this.#select(moved.index, 'keyboard', event);
      this.#commit(stops, 'keyboard', event);
      if (moved.index !== active.index) this.#focusLater({ kind: 'stop', index: moved.index });
      return;
    }
    const current = stops[active.index]?.midpoint ?? 0.5;
    const next = Math.min(
      MIDPOINT_MAX,
      Math.max(
        MIDPOINT_MIN,
        step.kind === 'min'
          ? MIDPOINT_MIN
          : step.kind === 'max'
            ? MIDPOINT_MAX
            : applyKeyboardStep(current, step, this.#dimension),
      ),
    );
    if (this.#propose(moveColorGradientMidpoint(stops, active.index, next), 'keyboard', event))
      this.#commit(stops, 'keyboard', event);
  };

  #input(active: Active): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(
      `input[data-kind="${active.kind}"][data-index="${active.index}"]`,
    );
  }

  /** Focuses a handle's input after the render that moved it there. */
  #focusLater(active: Active): void {
    void this.updateComplete.then(() => this.#input(active)?.focus());
  }

  #restoreInput = (event: Event): void => {
    // The element owns the value; a native range key never publishes.
    const input = event.currentTarget as HTMLInputElement;
    input.value = input.getAttribute('aria-valuenow') ?? input.value;
  };

  #focus = (event: FocusEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    const kind = input.dataset.kind === 'midpoint' ? 'midpoint' : 'stop';
    const index = Number(input.dataset.index);
    this.#focused = { kind, index };
    this.#focusVisible = input.matches(':focus-visible');
    // Focusing a stop selects it, as pressing it does.
    if (kind === 'stop' && this.#editable && !this.#active) this.#select(index, 'focus', event);
    this.requestUpdate();
  };

  #blur = (): void => {
    this.#focused = undefined;
    this.#focusVisible = false;
    this.requestUpdate();
  };

  // ---- render --------------------------------------------------------------------------------

  #markers(active: Active): Record<string, unknown> {
    const focused = this.#focused?.kind === active.kind && this.#focused.index === active.index;
    const dragging =
      this.#dragging && this.#active?.kind === active.kind && this.#active.index === active.index;
    return stateMarkers(
      {
        disabled: this.effectiveDisabled,
        readOnly: this.readOnly,
        dragging,
        focused,
        focusVisible: focused && this.#focusVisible,
      },
      ['disabled', 'readOnly', 'dragging', 'focused', 'focusVisible'],
    );
  }

  #handleInput(active: Active, value: number, name: string, valueText: string, min = 0, max = 1) {
    const props: Record<string, unknown> = {
      type: 'range',
      class: 'dimension',
      part: 'focusable',
      'data-kind': active.kind,
      'data-index': String(active.index),
      '.min': String(min),
      '.max': String(max),
      '.step': String(this.#dimension.step),
      '.value': String(value),
      '.disabled': this.effectiveDisabled,
      tabindex: this.effectiveDisabled ? -1 : 0,
      'aria-label': this.label ? `${this.label}: ${name}` : name,
      'aria-valuemin': String(Math.round(min * 100)),
      'aria-valuemax': String(Math.round(max * 100)),
      'aria-valuenow': String(Math.round(value * 1000) / 10),
      'aria-valuetext': valueText,
      'aria-orientation': 'horizontal',
      'aria-readonly': this.readOnly ? 'true' : undefined,
      '@keydown': this.#keyDown,
      '@input': this.#restoreInput,
      '@focus': this.#focus,
      '@blur': this.#blur,
    };
    return html`<input ${bindPart(props, [])} />`;
  }

  #renderStop(stop: ColorGradientStop, index: number, count: number, selected: number) {
    const parsed = parseColor(stop.color);
    const paint = parsed ? displayColor(parsed) : 'transparent';
    const active: Active = { kind: 'stop', index };
    const name = format(this.#text.stop, { index: index + 1, count });
    return this.renderPart(
      'color-gradient-input-stop',
      { size: this.size, index, selected: index === selected },
      {
        tag: 'span',
        properties: {
          part: 'color-gradient-input-stop',
          class: 'stop',
          'data-index': String(index),
          'data-selected': index === selected,
          style: {
            'inset-inline-start': `${(stop.position * 100).toFixed(3)}%`,
            '--_tp-handle-paint': paint,
          },
          ...this.#markers(active),
        },
        content: this.#handleInput(
          active,
          stop.position,
          name,
          `${percent(stop.position)}, ${stop.color}`,
        ),
      },
    );
  }

  #renderMidpoint(stops: readonly ColorGradientStop[], index: number) {
    const from = stops[index]!;
    const to = stops[index + 1]!;
    const midpoint = from.midpoint ?? 0.5;
    const at = from.position + (to.position - from.position) * midpoint;
    const active: Active = { kind: 'midpoint', index };
    const name = format(this.#text.midpoint, { from: index + 1, to: index + 2 });
    const markers = this.#markers(active);
    const diamond = this.renderPart(
      'color-gradient-input-midpoint',
      { size: this.size, index },
      {
        tag: 'span',
        properties: {
          part: 'color-gradient-input-midpoint',
          class: 'diamond',
          'aria-hidden': 'true',
          ...markers,
        },
      },
    );
    return html`<span
      ${bindPart(
        {
          class: 'midpoint',
          'data-index': String(index),
          // Stops at one position leave no span to mix across.
          hidden: to.position <= from.position,
          style: `inset-inline-start: ${(at * 100).toFixed(3)}%`,
          ...markers,
        },
        [],
      )}
      >${diamond}${this.#handleInput(
        active,
        midpoint,
        name,
        percent(midpoint),
        MIDPOINT_MIN,
        MIDPOINT_MAX,
      )}</span
    >`;
  }

  protected override render() {
    const text = this.#text;
    const stops = this.value;
    const selected = this.selected;
    const state = { size: this.size, dragging: this.#dragging, count: stops.length, selected };
    const removable = this.removable;
    const canRemove = this.#editable && selected >= 0 && stops.length > Math.max(0, this.minStops);
    return this.renderPart('color-gradient-input', state, {
      tag: 'div',
      properties: {
        part: 'color-gradient-input',
        class: 'root',
        role: 'group',
        'aria-label': this.label || this.getAttribute('aria-label') || text.label,
        'data-dragging': this.#dragging,
        style: {
          '--_tp-color-gradient-input-paint': colorGradientTrackPaint(stops, this.interpolation),
          '--_tp-color-gradient-input-axis': this.direction === 'rtl' ? 'to left' : 'to right',
        },
      },
      content: html`<div
          ${bindPart(
            {
              class: 'surface',
              'data-locked': !this.#editable,
              'data-disabled': this.effectiveDisabled,
            },
            [this.#surfaceReference],
          )}
        >
          ${this.renderPart('color-gradient-input-track', state, {
            tag: 'div',
            properties: {
              part: 'color-gradient-input-track',
              class: 'track',
              'aria-hidden': 'true',
            },
          })}
          <div ${bindPart({ class: 'frame' }, [this.#frameReference])}>
            ${stops.map(
              (stop, index) =>
                html`${this.#renderStop(stop, index, stops.length, selected)}${
                  index < stops.length - 1 ? this.#renderMidpoint(stops, index) : nothing
                }`,
            )}
          </div>
        </div>
        ${
          removable
            ? html`<tp-button
                class="remove"
                part="color-gradient-input-remove"
                variant="ghost"
                size="icon-sm"
                .icon=${trashIcon}
                .ariaLabel=${text.remove}
                ?disabled=${!canRemove}
                @click=${this.#removePress}
              ></tp-button>`
            : nothing
        }`,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-color-gradient-input': TpColorGradientInput;
  }
}
