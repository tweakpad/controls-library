import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  ChoiceCollectionController,
  type ChoiceRecord,
} from '../../foundation/choice-collection.js';
import { componentHandlingPrevented } from '../../foundation/part.js';
import { VirtualList, type VirtualSlot } from '../../foundation/virtual-list.js';
import type { PaletteListModel, PaletteSlot } from './model.js';

/** A listed color as a choice record: its option key, with the slot behind it. */
interface PaletteRecord extends ChoiceRecord<string> {
  readonly slot: PaletteSlot;
}

export interface PaletteListOptions {
  readonly model: () => PaletteListModel;
  /** The listbox, which holds the rows and takes focus. */
  readonly listbox: () => HTMLElement | null;
  /** The scroll container: the viewport of the Scroll area around the listbox. */
  readonly viewport: () => HTMLElement | null;
  /** The rendered extent of one row (a cell), in CSS pixels. */
  readonly extent: () => number;
  /** Option key of the chosen color. */
  readonly selected: () => string | undefined;
  readonly disabled: () => boolean;
  readonly locale: () => string | undefined;
  readonly pick: (key: string, event: Event) => void;
  readonly highlighted: (key: string | undefined) => void;
}

/** Rows mounted beyond each edge of the visible window. */
const OVERSCAN = 4;

/**
 * The color list's state over Foundation controllers: the virtual window of its rows, which
 * follows the Scroll area around it (Foundation §19.24), and the highlight and typeahead of its
 * options (the choice collection). The listbox takes focus and refers to the highlighted option
 * through `aria-activedescendant`; the arrow keys move in the grid, Home and End reach the ends,
 * letters jump by name, and Enter and Space pick.
 */
export class PaletteList implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #options: PaletteListOptions;
  readonly #collection: ChoiceCollectionController<string, PaletteRecord>;
  readonly #virtual: VirtualList;
  #model: PaletteListModel | undefined;
  #unitKeys: readonly string[] = [];

  constructor(host: ReactiveControllerHost, options: PaletteListOptions) {
    this.#host = host;
    this.#options = options;
    this.#collection = new ChoiceCollectionController<string, PaletteRecord>({
      locale: options.locale,
    });
    this.#virtual = new VirtualList(host, {
      list: options.listbox,
      viewport: options.viewport,
      estimate: options.extent,
      overscan: () => OVERSCAN,
      enabled: () => true,
    });
    host.addController(this);
  }

  hostDisconnected(): void {
    this.#collection.disconnect();
  }

  /** Follows the model: its options become the choices, its rows the virtual window's keys. */
  sync(): void {
    const model = this.#options.model();
    if (model === this.#model) return;
    this.#model = model;
    const records = model.keys.map((key): PaletteRecord => ({
      value: key,
      label: '',
      text: textOf(model.slots.get(key)!),
      slot: model.slots.get(key)!,
    }));
    this.#collection.setSource(records);
    this.#unitKeys = model.units.map((unit) => unit.key);
    this.#virtual.setKeys(this.#unitKeys);
  }

  /** Mounted rows in order, with spaces for the unmounted ones; the highlighted row stays. */
  slots(): VirtualSlot[] {
    const key = this.highlighted;
    const row = key === undefined ? undefined : this.#model?.rowOf.get(key);
    return this.#virtual.slots(row === undefined ? [] : [row]);
  }

  /** Follows the extent of a mounted row; `null` when it unmounts. */
  observe(key: string, element: Element | null): void {
    this.#virtual.observe(key, element);
  }

  /** Option key of the highlighted color. */
  get highlighted(): string | undefined {
    return this.#collection.highlighted?.value;
  }

  /** Highlights an option and, with `reveal`, scrolls its row into view by the nearest distance. */
  highlight(key: string | undefined, reveal = false): void {
    const index =
      key === undefined ? -1 : this.#collection.visible.findIndex((record) => record.value === key);
    const previous = this.highlighted;
    this.#collection.activeIndex = index;
    if (reveal) this.reveal(this.highlighted);
    if (this.highlighted !== previous) {
      this.#options.highlighted(this.highlighted);
      this.#host.requestUpdate();
    }
  }

  /** Scrolls the row of an option into view by the nearest distance. */
  reveal(key: string | undefined): void {
    const row = key === undefined ? undefined : this.#model?.rowOf.get(key);
    if (row !== undefined) this.#virtual.scrollToIndex(row);
  }

  /** Scrolls the group of an option to the top of the Scroll area. */
  showGroupOf(key: string): void {
    const model = this.#model;
    const row = model?.rowOf.get(key);
    if (!model || row === undefined) return;
    const group = model.units[row]!.group;
    this.#virtual.scrollToIndex(
      model.units.findIndex((unit) => unit.group === group),
      'start',
    );
  }

  /** Keyboard focus on the listbox highlights the chosen color, otherwise the first one. */
  readonly focusIn = (event: FocusEvent): void => {
    const listbox = this.#options.listbox();
    if (event.target !== listbox || !listbox?.matches(':focus-visible')) return;
    if (this.highlighted !== undefined) return;
    const selected = this.#options.selected();
    const first = this.#collection.visible.find((record) => !record.disabled)?.value;
    this.highlight(
      selected !== undefined && this.#model?.slots.has(selected) ? selected : first,
      true,
    );
  };

  /** The pointer highlights the option under it, without scrolling. */
  readonly pointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.#options.disabled()) return;
    const key = optionKey(event);
    if (key !== undefined && key !== this.highlighted) this.highlight(key);
  };

  /** A press on an option picks it; the listbox takes focus as a native press gives it. */
  readonly click = (event: MouseEvent): void => {
    const key = optionKey(event);
    if (key === undefined || this.#options.disabled()) return;
    this.highlight(key);
    this.#options.pick(key, event);
  };

  readonly keyDown = (event: KeyboardEvent): void => {
    if (
      event.defaultPrevented ||
      componentHandlingPrevented(event) ||
      event.isComposing ||
      this.#options.disabled() ||
      event.target !== this.#options.listbox()
    )
      return;
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp')
      this.#moveRow(event, key === 'ArrowDown' ? 1 : -1);
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const rtl = getComputedStyle(event.target as Element).direction === 'rtl';
      this.#moveInRow(event, (key === 'ArrowRight') !== rtl ? 1 : -1);
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      this.highlight(this.#collection.boundary(key === 'End')?.value, true);
    } else if (key === 'Enter' || (key === ' ' && !this.#collection.typeahead.typing)) {
      event.preventDefault();
      const highlighted = this.highlighted;
      if (highlighted !== undefined && !event.repeat) this.#options.pick(highlighted, event);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const previous = this.highlighted;
      const match = this.#collection.search(key);
      if (match || key === ' ') event.preventDefault();
      if (match) {
        // The search moved the highlight; publish it and reveal its row.
        this.#collection.activeIndex = this.#collection.visible.indexOf(match);
        if (match.value !== previous) this.#options.highlighted(match.value);
        this.reveal(match.value);
        this.#host.requestUpdate();
      }
    }
  };

  /** Down and Up: the next or previous row of options, keeping the column. */
  #moveRow(event: KeyboardEvent, delta: 1 | -1): void {
    event.preventDefault();
    const model = this.#model;
    const current = this.highlighted;
    if (!model) return;
    if (current === undefined) {
      this.highlight(this.#collection.boundary(delta < 0)?.value, true);
      return;
    }
    const rows = model.units.filter((unit) => unit.kind === 'row');
    const at = model.rowOf.get(current);
    const index = rows.findIndex((unit) => model.units.indexOf(unit) === at);
    const row = rows[index];
    const next = rows[index + delta];
    if (!row || row.kind !== 'row' || !next || next.kind !== 'row') return;
    const column = row.slots.findIndex((slot) => slot.key === current);
    const target = next.slots[Math.min(column, next.slots.length - 1)];
    if (target) this.highlight(target.key, true);
  }

  /** Left and Right: the previous or next option in the row, following the writing direction. */
  #moveInRow(event: KeyboardEvent, delta: 1 | -1): void {
    event.preventDefault();
    const model = this.#model;
    const current = this.highlighted;
    if (!model) return;
    if (current === undefined) {
      this.highlight(this.#collection.boundary(false)?.value, true);
      return;
    }
    const row = model.units[model.rowOf.get(current) ?? -1];
    if (!row || row.kind !== 'row') return;
    const target = row.slots[row.slots.findIndex((slot) => slot.key === current) + delta];
    if (target) this.highlight(target.key, true);
  }
}

/** The typeahead text of a color: its name, otherwise its color text. */
function textOf(slot: PaletteSlot): string {
  return slot.swatch.name ?? slot.swatch.value;
}

/** The option key under an event, from the option's `data-key`. */
export function optionKey(event: Event): string | undefined {
  for (const target of event.composedPath()) {
    if (!(target instanceof HTMLElement)) continue;
    if (target.getAttribute('role') === 'listbox') return undefined;
    const key = target.dataset['key'];
    if (target.getAttribute('role') === 'option' && key !== undefined) return key;
  }
  return undefined;
}
