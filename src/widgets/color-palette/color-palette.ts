import { html, nothing, type PropertyValues } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { TpElement } from '../../foundation/element.js';
import { TpFormElement } from '../../foundation/form-element.js';
import {
  ControllableState,
  type ControllableStateOptions,
} from '../../foundation/controllable-state.js';
import { TpValueChangeEvent, TpValueCommitEvent } from '../../foundation/events.js';
import type { ChangeReason } from '../../foundation/types.js';
import { defaultTrue } from '../../foundation/converters.js';
import { containNestedEvents } from '../../foundation/nested-events.js';
import { fillTemplate } from '../../foundation/template.js';
import { reportDiagnostic } from '../../foundation/services.js';
import type { CustomElementConstructorWithTag } from '../../foundation/define.js';
import { parseColor } from '../../foundation/color/parse.js';
import { colorIdentity, resolveColorCollection } from '../../foundation/color-palette/parse.js';
import { defaultColorCollection } from '../../foundation/color-palette/collections/default.js';
import type {
  ColorCollection,
  PaletteGrouping,
  PaletteSort,
  ResolvedColorCollection,
} from '../../foundation/color-palette/types.js';
import type { SortDirection } from '../../foundation/color/palette.js';
import { setPartComposition } from '../../presentation/controller.js';
import { colorPalettePresentation } from '../../presentation/families/color-palette.js';
import { TpButton } from '../../components/button/button.js';
import { TpIcon } from '../../components/icon/icon.js';
import { TpMenu } from '../../components/menu/menu.js';
import { TpMenuRadioGroup } from '../../components/menu/menu-radio-group.js';
import { TpMenuRadioItem } from '../../components/menu/menu-radio-item.js';
import { TpSelect } from '../../components/select/select.js';
import { TpSeparator } from '../../components/separator/separator.js';
import { TpScrollArea } from '../../components/scroll-area/scroll-area.js';
import { TpTabs } from '../../components/tabs/tabs.js';
import { PaletteList } from './list.js';
import {
  buildListModel,
  hslText,
  listText,
  selectedKey,
  swatchInfo,
  type PaletteListModel,
  type PaletteSlot,
} from './model.js';
import { resolveStrings } from './strings.js';
import { colorPaletteStyles } from './styles.js';
import type {
  ColorPaletteChangeMetadata,
  ColorPaletteLayout,
  ColorPaletteMode,
  ColorPalettePaletteStyle,
  ColorPaletteSize,
  ColorPaletteStrings,
  ColorPaletteSwatchInfo,
} from './types.js';
import { renderToolbar } from './views/toolbar.js';

export type ColorPaletteValueChangeCallback = (event: TpValueChangeEvent<string>) => void;
export type ColorPaletteValueCommitCallback = (event: TpValueCommitEvent<string>) => void;
/** The detail of the palette's `tp-value-change`. */
export type ColorPaletteChangeDetail = TpValueChangeEvent<string>['detail'];

const MODES: readonly ColorPaletteMode[] = ['colors', 'palettes'];
const PALETTE_STYLES: readonly ColorPalettePaletteStyle[] = ['stops', 'gradient'];
const GROUPINGS: readonly PaletteGrouping[] = ['collection', 'hue', 'none'];
const SORTS: readonly PaletteSort[] = ['collection', 'lightness', 'hue', 'chroma'];
const DIRECTIONS: readonly SortDirection[] = ['ascending', 'descending'];
const LAYOUTS: readonly ColorPaletteLayout[] = ['grid', 'list'];
const SIZES: readonly ColorPaletteSize[] = ['sm', 'default', 'lg'];
const DEFAULT_COLUMNS = 9;
/** Rows of medium cells the list's box holds. */
const ROWS = 6;
/**
 * Cell extents of the sizes at the default density, in pixels, as the recipe sets them; used until
 * the rendered cell is measured. The palette's box holds `columns` medium cells; another size
 * reflows the cells inside that box.
 */
const SIZE_PIXELS: Readonly<Record<ColorPaletteSize, number>> = { sm: 24, default: 32, lg: 42 };
const NESTED_EVENT_TYPES = [
  'tp-value-change',
  'tp-value-commit',
  'tp-field-value',
  'tp-open-change',
  'tp-open-change-complete',
  'tp-presence-complete',
  'tp-action',
] as const;
const NESTED_HOSTS =
  'tp-scroll-area, tp-tabs, tp-select, tp-button, tp-menu, tp-menu-radio-group, tp-menu-radio-item';

interface ImmediateCommit {
  readonly reason: ChangeReason;
  readonly source: Event | undefined;
  readonly previous: string;
  readonly metadata: ColorPaletteChangeMetadata;
}

/**
 * One enumerated lane of the palette: a controlled and uncontrolled pair with its own cancelable
 * change event.
 */
class Lane<T> {
  provided: T | undefined;
  readonly state: ControllableState<T>;
  constructor(
    readonly host: TpColorPalette,
    initial: T,
    readDefault: () => T | undefined,
    eventFactory: NonNullable<ControllableStateOptions<T>['eventFactory']>,
    code: string,
  ) {
    this.state = new ControllableState<T>({
      host,
      initialValue: initial,
      readControlledValue: () => this.provided,
      readDefaultValue: readDefault,
      hasDefaultValue: () => readDefault() !== undefined,
      eventFactory,
      onCommit: () => host.requestUpdate(),
      diagnostic: (message) => host.diagnose(code, message),
    });
  }
  /** A write before the first update or to a controlled lane is the owner's; later, a proposal. */
  write(next: T | undefined): void {
    if (!this.host.hasUpdated || this.state.controlled) {
      this.provided = next;
      if (this.host.hasUpdated) this.state.sync();
    } else if (next !== undefined) this.state.set(next, 'programmatic');
  }
}

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): T | undefined =>
    values.includes(value as T) ? (value as T) : undefined;

/**
 * Chooses a color from swatch collections of any size. The colors mode shows a gapless grid
 * grouped by the collection or by hue and sorted by lightness, hue or chroma, or a list of rows
 * that name each color. The palettes mode shows the collection's palettes and palettes generated
 * from the chosen color with the color theory functions, as hard stops or blended as gradients,
 * each of at most twelve colors. The cells follow the size and the density of their region.
 * Form-associated: `name` submits the chosen color.
 *
 * @fires tp-value-change - Cancelable proposal of a different color; `detail.metadata` carries the
 * picked `swatch` and the `collection` id.
 * @fires tp-value-commit - The settled color, right after an accepted pick.
 * @fires tp-collection-change - Cancelable proposal of another active collection.
 * @fires tp-mode-change - Cancelable proposal of another mode.
 * @fires tp-grouping-change - Cancelable proposal of another grouping of the grid.
 * @fires tp-sort-change - Cancelable proposal of another sort of the grid.
 * @fires tp-sort-direction-change - Cancelable proposal of another sort direction.
 * @fires tp-layout-change - Cancelable proposal of another layout of the colors mode.
 * @fires tp-palette-style-change - Cancelable proposal of hard stops or gradients for palettes.
 * @fires tp-size-change - Cancelable proposal of another cell size.
 * @fires tp-field-value - Each committed value, for a surrounding Field's validation state.
 */
export class TpColorPalette extends TpFormElement<string> {
  static tagName = 'tp-color-palette';
  /** Library elements this element renders; defining it defines them too. */
  static get elementDependencies(): readonly CustomElementConstructorWithTag[] {
    return [
      TpScrollArea,
      TpTabs,
      TpSelect,
      TpButton,
      TpIcon,
      TpMenu,
      TpMenuRadioGroup,
      TpMenuRadioItem,
      TpSeparator,
    ];
  }
  static override presentation = colorPalettePresentation;
  static override properties = {
    ...TpFormElement.properties,
    value: { type: String, noAccessor: true },
    defaultValue: { type: String, attribute: 'default-value' },
    collections: { attribute: false },
    collection: { type: String, noAccessor: true },
    defaultCollection: { type: String, attribute: 'default-collection' },
    mode: { type: String, noAccessor: true },
    defaultMode: { type: String, attribute: 'default-mode' },
    modes: { attribute: false },
    grouping: { type: String, noAccessor: true },
    defaultGrouping: { type: String, attribute: 'default-grouping' },
    sort: { type: String, noAccessor: true },
    defaultSort: { type: String, attribute: 'default-sort' },
    sortDirection: { type: String, attribute: 'sort-direction', noAccessor: true },
    defaultSortDirection: { type: String, attribute: 'default-sort-direction' },
    layout: { type: String, noAccessor: true },
    paletteStyle: { type: String, attribute: 'palette-style', noAccessor: true },
    defaultPaletteStyle: { type: String, attribute: 'default-palette-style' },
    defaultLayout: { type: String, attribute: 'default-layout' },
    columns: { type: Number },
    toolbar: { type: Boolean, converter: defaultTrue },
    size: { type: String, noAccessor: true },
    defaultSize: { type: String, attribute: 'default-size' },
    label: { type: String },
    locale: { type: String },
    strings: { attribute: false },
    onValueChange: { attribute: false },
    onValueCommitted: { attribute: false },
  };
  static override styles = [TpElement.styles, colorPaletteStyles];

  /** Starting color of an uncontrolled palette; form reset returns to it. */
  defaultValue: string | undefined;
  /**
   * The collections offered, as documents or typed modules; the built-in default collection when
   * empty. Import more from `@tweakpad/ui/color-palette/collections/<id>`, or parse a fetched
   * document with `parseColorCollection`.
   */
  collections: readonly ColorCollection[] = [];
  /** Starting collection id of an uncontrolled collection choice. */
  defaultCollection: string | undefined;
  /** Starting mode of an uncontrolled mode choice. */
  defaultMode: ColorPaletteMode | undefined;
  /** The modes the toolbar offers, in order; one mode hides the mode toggles. */
  modes: readonly ColorPaletteMode[] = MODES;
  /** Starting grouping of an uncontrolled grid. */
  defaultGrouping: PaletteGrouping | undefined;
  /** Starting sort of an uncontrolled grid. */
  defaultSort: PaletteSort | undefined;
  /** Starting sort direction. */
  defaultSortDirection: SortDirection | undefined;
  /** Starting layout of an uncontrolled grid. */
  defaultLayout: ColorPaletteLayout | undefined;
  /** Starting palette style of an uncontrolled palettes mode. */
  defaultPaletteStyle: ColorPalettePaletteStyle | undefined;
  /** Starting cell size of an uncontrolled size. */
  defaultSize: ColorPaletteSize | undefined;
  /** Cells per row of the grid; the list layout keeps the same width. */
  columns = DEFAULT_COLUMNS;
  /** Shows the toolbar with the modes, the collections and the view options. */
  toolbar = true;
  /** Accessible name of the color list; a surrounding Field supplies it otherwise. */
  label = '';
  /** Language of the texts; the document language when empty. */
  locale = '';
  /** Replaces built-in texts (mode, group and set names) for localization. */
  strings: Partial<ColorPaletteStrings> = {};
  /**
   * Called synchronously with each `tp-value-change` proposal, before listeners; a controlled owner
   * writes `value` back here to accept it.
   */
  onValueChange: ColorPaletteValueChangeCallback | undefined;
  /** Called with each settled pick. */
  onValueCommitted: ColorPaletteValueCommitCallback | undefined;

  #provided: string | undefined;
  #strings: ColorPaletteStrings = resolveStrings();
  #immediate: ImmediateCommit | undefined;
  #model: { key: readonly unknown[]; model: PaletteListModel } | undefined;
  /** Option key of the last pick, so the picked option stays the selected one. */
  #picked: string | undefined;
  #reported = new Set<string>();
  #composed = new WeakSet<Element>();
  #composition: object | undefined;
  /** The list state that a toolbar change reveals the value against. */
  #revealKey: string | undefined;

  readonly #state = new ControllableState<string>({
    host: this,
    initialValue: '',
    readControlledValue: () => this.#provided,
    readDefaultValue: () => this.defaultValue,
    hasDefaultValue: () => this.defaultValue !== undefined,
    equals: (a, b) => a === b,
    onChange: (event) => this.onValueChange?.(event),
    onCommit: (value, previous, reason) => this.#committed(value, previous, reason),
    diagnostic: (message) => this.diagnose('color-palette-state', message),
  });
  readonly #collection = new Lane<string>(
    this,
    '',
    () => this.defaultCollection,
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<string>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-collection-change',
      ),
    'color-palette-collection',
  );
  readonly #mode = new Lane<ColorPaletteMode>(
    this,
    'colors',
    () => oneOf(MODES)(this.defaultMode),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<ColorPaletteMode>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-mode-change',
      ),
    'color-palette-mode',
  );
  readonly #grouping = new Lane<PaletteGrouping>(
    this,
    'collection',
    () => oneOf(GROUPINGS)(this.defaultGrouping),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<PaletteGrouping>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-grouping-change',
      ),
    'color-palette-grouping',
  );
  readonly #sort = new Lane<PaletteSort>(
    this,
    'collection',
    () => oneOf(SORTS)(this.defaultSort),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<PaletteSort>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-sort-change',
      ),
    'color-palette-sort',
  );
  readonly #direction = new Lane<SortDirection>(
    this,
    'ascending',
    () => oneOf(DIRECTIONS)(this.defaultSortDirection),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<SortDirection>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-sort-direction-change',
      ),
    'color-palette-sort-direction',
  );
  readonly #layout = new Lane<ColorPaletteLayout>(
    this,
    'grid',
    () => oneOf(LAYOUTS)(this.defaultLayout),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<ColorPaletteLayout>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-layout-change',
      ),
    'color-palette-layout',
  );
  readonly #paletteStyle = new Lane<ColorPalettePaletteStyle>(
    this,
    'stops',
    () => oneOf(PALETTE_STYLES)(this.defaultPaletteStyle),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<ColorPalettePaletteStyle>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-palette-style-change',
      ),
    'color-palette-palette-style',
  );
  readonly #size = new Lane<ColorPaletteSize>(
    this,
    'default',
    () => oneOf(SIZES)(this.defaultSize),
    (value, previous, reason, sourceEvent, options) =>
      new TpValueChangeEvent<ColorPaletteSize>(
        value,
        previous,
        reason,
        sourceEvent,
        options,
        'tp-size-change',
      ),
    'color-palette-size',
  );

  constructor() {
    super();
    // Nested constituent events stop at this shadow root; the widget republishes its own lanes.
    containNestedEvents(this, { types: NESTED_EVENT_TYPES, on: 'root' });
  }

  // ---- lanes -------------------------------------------------------------------------------

  override get value(): string {
    return this.#state.value;
  }
  override set value(value: string) {
    const previous = this.value;
    this.#provided = value === null || value === undefined ? undefined : String(value);
    if (this.hasUpdated) this.#state.sync();
    this.requestUpdate('value', previous);
  }
  /** Id of the active collection; setting it makes the collection choice controlled. */
  get collection(): string {
    return this.activeCollection.id;
  }
  set collection(value: string) {
    const previous = this.collection;
    this.#collection.write(value === null || value === undefined ? undefined : String(value));
    this.requestUpdate('collection', previous);
  }
  /** How the active collection is presented; setting it makes the mode controlled. */
  get mode(): ColorPaletteMode {
    const mode = this.#mode.state.value;
    const offered = this.#modes();
    return offered.includes(mode) ? mode : offered[0]!;
  }
  set mode(value: ColorPaletteMode) {
    const previous = this.mode;
    this.#mode.write(oneOf(MODES)(value));
    this.requestUpdate('mode', previous);
  }
  /** Groups of the grid; setting it makes the grouping controlled. */
  get grouping(): PaletteGrouping {
    return this.#grouping.state.value;
  }
  set grouping(value: PaletteGrouping) {
    const previous = this.grouping;
    this.#grouping.write(oneOf(GROUPINGS)(value));
    this.requestUpdate('grouping', previous);
  }
  /** Order inside each group of the grid; setting it makes the sort controlled. */
  get sort(): PaletteSort {
    return this.#sort.state.value;
  }
  set sort(value: PaletteSort) {
    const previous = this.sort;
    this.#sort.write(oneOf(SORTS)(value));
    this.requestUpdate('sort', previous);
  }
  /** Direction of the sort; setting it makes the direction controlled. */
  get sortDirection(): SortDirection {
    return this.#direction.state.value;
  }
  set sortDirection(value: SortDirection) {
    const previous = this.sortDirection;
    this.#direction.write(oneOf(DIRECTIONS)(value));
    this.requestUpdate('sortDirection', previous);
  }
  /** Cells in rows, or one row per color with its name; setting it makes the layout controlled. */
  get layout(): ColorPaletteLayout {
    return this.#layout.state.value;
  }
  set layout(value: ColorPaletteLayout) {
    const previous = this.layout;
    this.#layout.write(oneOf(LAYOUTS)(value));
    this.requestUpdate('layout', previous);
  }
  /**
   * How the palettes mode shows each palette: hard stops side by side, or blended as one gradient
   * whose colors stay pickable; setting it makes the style controlled.
   */
  get paletteStyle(): ColorPalettePaletteStyle {
    return this.#paletteStyle.state.value;
  }
  set paletteStyle(value: ColorPalettePaletteStyle) {
    const previous = this.paletteStyle;
    this.#paletteStyle.write(oneOf(PALETTE_STYLES)(value));
    this.requestUpdate('paletteStyle', previous);
  }
  /**
   * The cell size, the same in the grid and the list, scaled with the density of the region;
   * setting it makes the size controlled.
   */
  get size(): ColorPaletteSize {
    return this.#size.state.value;
  }
  set size(value: ColorPaletteSize) {
    const previous = this.size;
    this.#size.write(oneOf(SIZES)(value));
    this.requestUpdate('size', previous);
  }

  // ---- read-only state ---------------------------------------------------------------------

  /** The active collection, parsed. */
  get activeCollection(): ResolvedColorCollection {
    const resolved = this.#resolved();
    const id = this.#collection.state.value;
    return resolved.find((collection) => collection.id === id) ?? resolved[0]!;
  }
  /** The highlighted color with where it is listed, or null. */
  get activeSwatch(): ColorPaletteSwatchInfo | null {
    const key = this.#list.highlighted;
    const slot = key === undefined ? undefined : this.#listModel().slots.get(key);
    return slot ? swatchInfo(slot) : null;
  }
  /** Whether the value is owned by the application through `value`. */
  get controlled(): boolean {
    return this.#state.controlled;
  }

  // ---- methods -----------------------------------------------------------------------------

  /** Proposes and commits a value; returns whether it was accepted. */
  setValue(value: string, reason: ChangeReason = 'programmatic', sourceEvent?: Event): boolean {
    return this.#propose(String(value ?? ''), reason, sourceEvent, {});
  }
  /** Scrolls the value's color into view and highlights it; false when it is not listed. */
  async scrollToValue(): Promise<boolean> {
    await this.updateComplete;
    const key = this.#selectedKey();
    if (key === undefined) return false;
    this.#list.highlight(key, true);
    return true;
  }

  // ---- lifecycle ---------------------------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    // Field discovers its control through this marker (Field's selector list is closed).
    this.setAttribute('data-field-control', '');
    this.#probes = undefined;
  }

  override disconnectedCallback(): void {
    this.#probeObserver?.disconnect();
    this.#probeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has('strings')) this.#strings = resolveStrings(this.strings);
    this.#state.initialize();
    for (const lane of this.#lanes()) lane.state.initialize();
    if (changed.has('columns') && !this.#validColumns() && this.columns !== DEFAULT_COLUMNS)
      this.diagnose(
        'color-palette-columns',
        `columns must be a positive integer; ${String(this.columns)} uses ${DEFAULT_COLUMNS}.`,
      );
    for (const collection of this.#resolved())
      for (const issue of collection.issues)
        reportDiagnostic(
          this,
          { code: issue.code, message: issue.message, severity: 'warning' },
          { once: this.#reported },
        );
    const id = this.#collection.state.value;
    if (id && !this.#resolved().some((collection) => collection.id === id))
      reportDiagnostic(
        this,
        {
          code: 'color-palette-collection',
          message: `No collection "${id}"; the first collection is shown.`,
          severity: 'warning',
        },
        { once: this.#reported },
      );
    this.#list.sync();
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.toggleAttribute('data-empty', !this.value);
    this.setAttribute('data-mode', this.mode);
    this.setAttribute('data-grouping', this.grouping);
    this.setAttribute('data-sort', this.sort);
    this.setAttribute('data-layout', this.layout);
    this.setAttribute('data-palette-style', this.paletteStyle);
    this.setFormValue(this.value || null, this.value);
    this.setRequiredValidity(this.required && !this.value, this.#strings.valueMissing);
    this.#syncComposition();
    this.#observeProbes();
    this.#revealAfterViewChange();
  }

  protected override resetFormValue(): void {
    this.#state.reset();
  }

  override formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    this.#state.set(state, 'programmatic', undefined, { cancelable: false });
  }

  override get inputElement(): HTMLElement | null {
    return this.#listbox;
  }

  protected override focusTarget(): HTMLElement | null {
    return this.#listbox ?? super.focusTarget();
  }

  protected override associationTarget(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('[part~="color-palette"]');
  }

  /** Reports a diagnostic from this palette. */
  override diagnose(code: string, message: string): void {
    super.diagnose(code, message);
  }

  // ---- model -------------------------------------------------------------------------------

  #lanes(): readonly Lane<unknown>[] {
    return [
      this.#collection,
      this.#mode,
      this.#grouping,
      this.#sort,
      this.#direction,
      this.#layout,
      this.#paletteStyle,
      this.#size,
    ] as unknown as readonly Lane<unknown>[];
  }

  #resolvedCache:
    { source: readonly ColorCollection[]; resolved: ResolvedColorCollection[] } | undefined;
  #resolved(): ResolvedColorCollection[] {
    const source = this.collections?.length ? this.collections : [defaultColorCollection];
    if (this.#resolvedCache?.source !== source)
      this.#resolvedCache = { source, resolved: source.map(resolveColorCollection) };
    return this.#resolvedCache.resolved;
  }

  #modes(): readonly ColorPaletteMode[] {
    const modes = (this.modes ?? []).filter((mode) => MODES.includes(mode));
    return modes.length ? modes : MODES;
  }

  #validColumns(): boolean {
    return Number.isInteger(this.columns) && this.columns > 0;
  }

  /** Medium cells per row of the palette's box. */
  #columns(): number {
    return this.#validColumns() ? this.columns : DEFAULT_COLUMNS;
  }

  /**
   * Cells of the current size that fit in a row of the box: the size reflows, the box stays. The
   * rendered cell and medium cell are measured, since the density of the region sets them.
   */
  #cellColumns(): number {
    const cell = this.#measured?.cell || SIZE_PIXELS[this.size] || SIZE_PIXELS.default;
    const frame = this.#measured?.frame || SIZE_PIXELS.default;
    return Math.max(1, Math.floor((this.#columns() * frame) / cell + 1e-6));
  }

  #measured: { cell: number; frame: number } | undefined;
  #probes: readonly Element[] | undefined;
  #probeObserver: ResizeObserver | undefined;

  /** Follows the rendered cell and medium cell, which the size and the region's density set. */
  #observeProbes(): void {
    const probes = [...this.renderRoot.querySelectorAll('.probe > span')];
    if (probes.length !== 2 || probes.every((probe, index) => this.#probes?.[index] === probe))
      return;
    this.#probes = probes;
    this.#probeObserver?.disconnect();
    const view = this.ownerDocument.defaultView;
    if (!view?.ResizeObserver) return;
    this.#probeObserver = new view.ResizeObserver(() => {
      const [cell, frame] = probes.map((probe) => probe.getBoundingClientRect().width);
      if (!cell || !frame) return;
      const previous = this.#cellColumns();
      this.#measured = { cell, frame };
      if (this.#cellColumns() !== previous) this.requestUpdate();
    });
    for (const probe of probes) this.#probeObserver.observe(probe);
  }

  #listModel(): PaletteListModel {
    const collection = this.activeCollection;
    const mode = this.mode;
    const key = [
      collection,
      mode,
      this.layout,
      this.paletteStyle,
      this.grouping,
      this.sort,
      this.sortDirection,
      this.#strings,
      this.#cellColumns(),
    ] as const;
    const cached = this.#model;
    if (cached && cached.key.every((part, index) => part === key[index])) return cached.model;
    const model = buildListModel({
      collection,
      mode,
      layout: this.layout,
      paletteStyle: this.paletteStyle,
      grouping: this.grouping,
      sort: this.sort,
      direction: this.sortDirection,
      strings: this.#strings,
      columns: this.#cellColumns(),
    });
    this.#model = { key, model };
    return model;
  }

  #selectedKey(): string | undefined {
    return selectedKey(this.#listModel(), this.value, this.#picked, identityOf);
  }

  // ---- picks -------------------------------------------------------------------------------

  #pick = (key: unknown, event: Event): void => {
    if (this.readOnly || this.effectiveDisabled) return;
    const slot = this.#listModel().slots.get(String(key));
    if (!slot) return;
    const reason: ChangeReason = event.type.startsWith('key') ? 'keyboard' : 'item-press';
    const value = slot.swatch.value;
    if (value === this.value) {
      this.#picked = slot.key;
      this.requestUpdate();
      return;
    }
    if (
      this.#propose(value, reason, event, {
        swatch: swatchInfo(slot),
        collection: this.activeCollection.id,
      })
    )
      this.#picked = slot.key;
  };

  #propose(
    value: string,
    reason: ChangeReason,
    sourceEvent: Event | undefined,
    metadata: ColorPaletteChangeMetadata,
  ): boolean {
    const previous = this.value;
    this.#immediate = { reason, source: sourceEvent, previous, metadata };
    const accepted = this.#state.set(value, reason, sourceEvent, { metadata });
    if (!accepted || !this.controlled) this.#immediate = undefined;
    return accepted;
  }

  #committed(value: string, previous: string, reason: ChangeReason): void {
    this.emit('tp-field-value', { value, previousValue: previous, reason });
    const immediate = this.#immediate;
    if (immediate) {
      this.#immediate = undefined;
      if (value !== immediate.previous) {
        const event = new TpValueCommitEvent<string>(
          value,
          immediate.previous,
          immediate.reason,
          immediate.source,
          { metadata: immediate.metadata },
        );
        this.onValueCommitted?.(event);
        this.dispatchEvent(event);
      }
    }
    this.requestUpdate('value', previous);
  }

  // ---- constituents ------------------------------------------------------------------------

  /** The listbox of the colors, which takes focus. */
  get #listbox(): HTMLElement | null {
    return this.renderRoot?.querySelector?.<HTMLElement>('.list') ?? null;
  }

  /** The viewport of the Scroll area around the listbox, which scrolls it. */
  get #viewport(): HTMLElement | null {
    return (
      this.renderRoot?.querySelector?.<TpScrollArea>('tp-scroll-area')?.viewportElement ?? null
    );
  }

  /** The color list over the Foundation virtual window and choice collection. */
  readonly #list = new PaletteList(this, {
    model: () => this.#listModel(),
    listbox: () => this.#listbox,
    viewport: () => this.#viewport,
    extent: () => this.#measured?.cell || SIZE_PIXELS[this.size] || SIZE_PIXELS.default,
    selected: () => this.#selectedKey(),
    disabled: () => this.effectiveDisabled,
    locale: () => this.locale || undefined,
    pick: (key, event) => this.#pick(key, event),
    highlighted: () => this.requestUpdate(),
  });

  /** Stable references per row key, so a row's extent is followed across renders. */
  readonly #rowRefs = new Map<string, (element: HTMLElement | null) => void>();
  #rowRef(key: string): (element: HTMLElement | null) => void {
    let reference = this.#rowRefs.get(key);
    if (!reference) {
      reference = (element) => this.#list.observe(key, element ?? null);
      this.#rowRefs.set(key, reference);
    }
    return reference;
  }

  /** Re-proposes a constituent's change on `lane`; a rejected proposal cancels the constituent's. */
  #relay<T>(lane: Lane<T>, read: (value: unknown) => T | undefined) {
    return (event: TpValueChangeEvent<unknown>): void => {
      event.stopPropagation();
      const { reason, sourceEvent } = event.detail;
      const next = read(event.detail.value);
      if (next === undefined || this.effectiveDisabled) {
        event.preventDefault();
        return;
      }
      if (!lane.state.set(next, reason === 'keyboard' ? 'keyboard' : 'item-press', sourceEvent))
        event.preventDefault();
    };
  }

  #onMode = this.#relay(this.#mode, (value) =>
    oneOf(MODES)(Array.isArray(value) ? value[0] : value),
  );
  #onCollection = this.#relay(this.#collection, (value) =>
    typeof value === 'string' && value ? value : undefined,
  );
  #onLayout = this.#relay(this.#layout, oneOf(LAYOUTS));
  #onPaletteStyle = this.#relay(this.#paletteStyle, oneOf(PALETTE_STYLES));
  #onSize = this.#relay(this.#size, oneOf(SIZES));

  /**
   * Group by: Auto proposes the hue grouping ordered by lightness, Collection the collection's own
   * groups and order, and None one flat group in the collection's order; each choice proposes the
   * grouping and the sort as one transaction in which both lanes change or neither, so a choice
   * shows the same order whatever was chosen before.
   */
  #onGroups = (event: TpValueChangeEvent<unknown>): void => {
    event.stopPropagation();
    const { reason, sourceEvent } = event.detail;
    const choice = event.detail.value;
    if (this.effectiveDisabled || !['auto', 'collection', 'none'].includes(choice as string)) {
      event.preventDefault();
      return;
    }
    const lane = reason === 'keyboard' ? 'keyboard' : 'item-press';
    const grouping: PaletteGrouping =
      choice === 'auto' ? 'hue' : choice === 'none' ? 'none' : 'collection';
    const accepted = ControllableState.transaction([
      this.#grouping.state.proposal(grouping, lane, sourceEvent),
      this.#sort.state.proposal(choice === 'auto' ? 'lightness' : 'collection', lane, sourceEvent),
    ]);
    if (!accepted) event.preventDefault();
  };

  /** After a mode, collection, grouping or sort change, the value comes into view. */
  #revealAfterViewChange(): void {
    const key = [
      this.activeCollection.id,
      this.mode,
      this.layout,
      this.grouping,
      this.sort,
      this.sortDirection,
    ].join('|');
    if (key === this.#revealKey) return;
    const first = this.#revealKey === undefined;
    this.#revealKey = key;
    if (!this.value) return;
    void this.updateComplete.then(() => {
      const selected = this.#selectedKey();
      if (selected === undefined) return;
      // The first render scrolls the value's group to the top; later views reveal its row.
      if (first) this.#list.showGroupOf(selected);
      else this.#list.reveal(selected);
    });
  }

  #syncComposition(): void {
    const changed = this.#composition !== this.partPresentation;
    this.#composition = this.partPresentation;
    for (const nested of this.renderRoot.querySelectorAll<HTMLElement>(NESTED_HOSTS)) {
      if (!changed && this.#composed.has(nested)) continue;
      this.#composed.add(nested);
      setPartComposition(
        nested as Parameters<typeof setPartComposition>[0],
        this,
        this.partPresentation,
      );
    }
  }

  // ---- render ------------------------------------------------------------------------------

  /** Whether the grid shows one row per color. */
  #listLayout(): boolean {
    return this.mode === 'colors' && this.layout === 'list';
  }

  /** Accessible name of an option: the text it shows, then its color text and share. */
  #optionName(slot: PaletteSlot): string {
    const { swatch } = slot;
    // A list row's name starts with the text it shows.
    const shown = swatch.name ?? (this.#listLayout() ? hslText(swatch, this.#strings) : undefined);
    const parts = [shown ? `${shown}, ${swatch.value}` : swatch.value];
    if (slot.share !== undefined)
      parts.push(fillTemplate(this.#strings.share, { share: Math.round(slot.share * 100) }));
    return parts.join(', ');
  }

  /** The listbox: its mounted groups, label rows and option rows, with spaces for the rest. */
  #renderList(model: PaletteListModel, label: string, state: Record<string, unknown>): unknown {
    if (!model.units.length)
      return this.renderPart('color-palette-empty', state, {
        tag: 'div',
        properties: { part: 'color-palette-empty', class: 'empty', role: 'presentation' },
        content: this.#strings.empty,
      });
    const highlighted = this.#list.highlighted;
    const selected = this.#selectedKey();
    const disabled = this.effectiveDisabled;
    const list = this.#listLayout();
    type Block = { readonly key: string; readonly group: number; readonly content: unknown[] };
    const blocks: Block[] = [];
    let open: Block | undefined;
    for (const slot of this.#list.slots()) {
      if (slot.kind === 'space') {
        const space = html`<div
          class="space"
          aria-hidden="true"
          style=${`block-size:${slot.extent}px`}
        ></div>`;
        if (open) open.content.push(space);
        else blocks.push({ key: slot.key, group: -1, content: [space] });
        continue;
      }
      const unit = model.units[slot.index]!;
      if (open?.group !== unit.group) {
        open = { key: model.groups[unit.group]!.key, group: unit.group, content: [] };
        blocks.push(open);
      }
      const group = model.groups[unit.group]!;
      open.content.push(
        unit.kind === 'label'
          ? this.renderPart('color-palette-group-label', state, {
              tag: 'div',
              properties: {
                part: 'color-palette-group-label',
                class: 'label',
                'aria-hidden': 'true',
              },
              reference: this.#rowRef(unit.key),
              content: group.label,
            })
          : this.renderPart('color-palette-row', state, {
              tag: 'div',
              properties: { part: 'color-palette-row', class: 'row', role: 'presentation' },
              reference: this.#rowRef(unit.key),
              content: repeat(
                unit.slots,
                (option) => option.key,
                (option) =>
                  this.#renderOption(option, {
                    selected: option.key === selected,
                    highlighted: option.key === highlighted,
                    disabled,
                    list,
                  }),
              ),
            }),
      );
    }
    return this.renderPart('color-palette-list', state, {
      tag: 'div',
      properties: {
        part: 'color-palette-list',
        class: 'list',
        role: 'listbox',
        tabindex: disabled ? -1 : 0,
        'aria-label': label,
        'aria-activedescendant':
          highlighted !== undefined && !disabled ? optionId(highlighted) : undefined,
        'aria-disabled': disabled ? 'true' : undefined,
        'aria-readonly': this.readOnly ? 'true' : undefined,
        '@keydown': this.#list.keyDown,
        '@focusin': this.#list.focusIn,
        '@pointermove': this.#list.pointerMove,
        '@click': this.#list.click,
      },
      content: repeat(
        blocks,
        (block) => block.key,
        (block) =>
          block.group < 0
            ? block.content
            : this.renderPart('color-palette-group', state, {
                tag: 'div',
                properties: {
                  part: 'color-palette-group',
                  class: 'group',
                  role: model.groups[block.group]!.name ? 'group' : 'presentation',
                  'aria-label': model.groups[block.group]!.name,
                },
                content: block.content,
              }),
      ),
    });
  }

  /** One color: a gapless cell, or in the list layout a row with its color and its name. */
  #renderOption(
    slot: PaletteSlot,
    flags: { selected: boolean; highlighted: boolean; disabled: boolean; list: boolean },
  ): unknown {
    return this.renderPart(
      'color-palette-item',
      { ...flags },
      {
        tag: 'div',
        properties: {
          part: 'color-palette-item',
          class: 'option',
          id: optionId(slot.key),
          role: 'option',
          'aria-selected': String(flags.selected),
          'aria-label': this.#optionName(slot),
          'aria-disabled': flags.disabled ? 'true' : undefined,
          'data-key': slot.key,
          'data-selected': flags.selected,
          'data-highlighted': flags.highlighted,
          'data-disabled': flags.disabled,
          'data-layout': flags.list ? 'list' : undefined,
          'data-paint': slot.blend ? 'blend' : undefined,
          style: slot.paint,
        },
        content: flags.list
          ? html`<span class="swatch"></span
              ><span class="row-text">${listText(slot.swatch, this.#strings)}</span>`
          : nothing,
      },
    );
  }

  protected override render() {
    const strings = this.#strings;
    const collection = this.activeCollection;
    const columns = this.#columns();
    const state = {
      value: this.value,
      size: this.size,
      empty: !this.value,
      disabled: this.effectiveDisabled,
      readOnly: this.readOnly,
    };
    const label = this.label || strings.label;
    const model = this.#listModel();
    const resolved = this.#resolved();
    const toolbar = this.toolbar
      ? renderToolbar({
          strings,
          modes: this.#modes(),
          mode: this.mode,
          collections: resolved.map((entry) => ({ id: entry.id, label: entry.name ?? entry.id })),
          collection: collection.id,
          layout: this.layout,
          paletteStyle: this.paletteStyle,
          grouping: this.grouping,
          size: this.size,
          disabled: this.effectiveDisabled,
          onMode: this.#onMode,
          onCollection: this.#onCollection,
          onLayout: this.#onLayout,
          onPaletteStyle: this.#onPaletteStyle,
          onGroups: this.#onGroups,
          onSize: this.#onSize,
        })
      : nothing;
    const attribution = collection.attribution;
    const credit = attribution
      ? html`<div class="attribution" part="color-palette-attribution">
          ${
            attribution.url
              ? html`<a href=${attribution.url} target="_blank" rel="noopener noreferrer"
                  >${attribution.name ?? collection.name ?? collection.id}</a
                >`
              : (attribution.name ?? collection.name ?? collection.id)
          }${
            attribution.license
              ? html` · ${fillTemplate(strings.license, { license: attribution.license })}`
              : nothing
          }
        </div>`
      : nothing;
    return this.renderPart('color-palette', state, {
      tag: 'div',
      properties: {
        part: 'color-palette',
        class: 'root',
        role: 'group',
        'aria-label': label,
        'data-mode': this.mode,
        'data-layout': this.layout,
        'data-palette-style': this.paletteStyle,
        'data-empty': !this.value,
        'data-disabled': this.effectiveDisabled,
        'data-readonly': this.readOnly,
        style: {
          // The box: medium cells and rows, whatever the size; the cells reflow inside it.
          '--_tp-color-palette-frame-columns': String(columns),
          '--_tp-color-palette-columns': String(this.#cellColumns()),
          '--_tp-color-palette-list': `calc(var(--_tp-color-palette-frame) * ${ROWS + 1} + var(--tp-space-1) * 2)`,
        },
      },
      content: html`<div class="probe" aria-hidden="true">
          <span class="probe-cell"></span><span class="probe-frame"></span>
        </div>
        ${toolbar}<tp-scroll-area class="scroller" axis="y"
          >${this.#renderList(model, label, state)}</tp-scroll-area
        >${credit}`,
    });
  }
}

/** The element id of an option, from its key. */
const optionId = (key: string): string => `option-${key.replace(/\s/g, '_')}`;

/** The hex identity of a color text, or undefined when it does not parse. */
function identityOf(value: string): string | undefined {
  const parsed = value ? parseColor(value) : null;
  return parsed ? colorIdentity(parsed) : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-color-palette': TpColorPalette;
  }
}
