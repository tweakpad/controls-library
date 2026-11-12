import { html, nothing } from 'lit';
import type { TpValueChangeEvent } from '../../../foundation/events.js';
import type { PaletteGrouping } from '../../../foundation/color-palette/index.js';
import { collectionsIcon, viewOptionsIcon } from '../../../icons/color-palette.js';
import type {
  ColorPaletteLayout,
  ColorPaletteMode,
  ColorPalettePaletteStyle,
  ColorPaletteSize,
  ColorPaletteStrings,
} from '../types.js';

export interface ToolbarOptions {
  readonly strings: ColorPaletteStrings;
  readonly modes: readonly ColorPaletteMode[];
  readonly mode: ColorPaletteMode;
  readonly collections: readonly { readonly id: string; readonly label: string }[];
  readonly collection: string;
  readonly layout: ColorPaletteLayout;
  readonly paletteStyle: ColorPalettePaletteStyle;
  readonly grouping: PaletteGrouping;
  readonly size: ColorPaletteSize;
  readonly disabled: boolean;
  readonly onMode: (event: TpValueChangeEvent<unknown>) => void;
  readonly onCollection: (event: TpValueChangeEvent<unknown>) => void;
  readonly onLayout: (event: TpValueChangeEvent<unknown>) => void;
  readonly onPaletteStyle: (event: TpValueChangeEvent<unknown>) => void;
  readonly onGroups: (event: TpValueChangeEvent<unknown>) => void;
  readonly onSize: (event: TpValueChangeEvent<unknown>) => void;
}

const stop = (event: Event): void => event.stopPropagation();

/** A radio group of the menu, led by a section label when it opens a section. */
function radioGroup<T extends string>(
  name: string,
  heading: string | undefined,
  value: T | '',
  items: readonly (readonly [T, string])[],
  onChange: (event: TpValueChangeEvent<unknown>) => void,
) {
  return html`<tp-menu-radio-group .label=${name} .value=${value} @tp-value-change=${onChange}
    >${heading ? html`<span data-menu-label>${heading}</span>` : nothing}${items.map(
      ([key, label]) =>
        html`<tp-menu-radio-item value=${key} .closeOnClick=${false}>${label}</tp-menu-radio-item>`,
    )}</tp-menu-radio-group
  >`;
}

/**
 * The toolbar: the mode Tabs and the view options menu. The Tabs have no panels: the list below
 * shows the selected mode. The menu's Color collections submenu chooses the collection, the default
 * first and then the loaded ones; its Display section shapes the active mode (the colors' layout, then their Group by section, or the palettes' hard stops or
 * gradient; the favorites keep their own); its Size section sizes the cells of every mode.
 */
export function renderToolbar(options: ToolbarOptions) {
  const { strings } = options;
  const modeNames: Readonly<Record<ColorPaletteMode, string>> = {
    colors: strings.modeColors,
    palettes: strings.modePalettes,
    favorites: strings.modeFavorites,
  };
  const modes =
    options.modes.length > 1
      ? html`<tp-tabs
          class="modes"
          activation="automatic"
          label=${strings.modes}
          .value=${options.mode}
          @tp-value-change=${options.onMode}
          @tp-presence-complete=${stop}
          >${options.modes.map(
            (mode) =>
              html`<button slot="tab" value=${mode} ?disabled=${options.disabled}>
                ${modeNames[mode]}
              </button>`,
          )}</tp-tabs
        >`
      : nothing;
  // The collections, once more than the default is loaded: a submenu of the view options.
  const collections = radioGroup(
    strings.collections,
    undefined,
    options.collection,
    options.collections.map((entry) => [entry.id, entry.label] as const),
    options.onCollection,
  );
  const collectionsMenu =
    options.collections.length > 1
      ? html`<tp-menu .portal=${false} .modal=${false} label=${strings.collections}
            ><tp-button slot="trigger" variant="ghost"
              ><tp-icon slot="icon-start" .icon=${collectionsIcon}></tp-icon
              >${strings.collections}</tp-button
            >${collections}</tp-menu
          ><tp-separator></tp-separator>`
      : nothing;
  // Auto groups are the hue families ordered by lightness; collection groups keep the document.
  const groups = options.grouping === 'hue' ? 'auto' : options.grouping;
  // Display shapes the active mode: the colors' layout and groups, or the palettes' style.
  const display =
    options.mode === 'colors'
      ? html`${radioGroup(
            strings.display,
            strings.display,
            options.layout,
            [
              ['grid', strings.layoutGrid],
              ['list', strings.layoutList],
            ],
            options.onLayout,
          )}<tp-separator></tp-separator>${radioGroup(
            strings.groupBy,
            strings.groupBy,
            groups,
            [
              ['auto', strings.groupsAuto],
              ['collection', strings.groupsCollection],
              ['none', strings.groupsNone],
            ],
            options.onGroups,
          )}<tp-separator></tp-separator>`
      : options.mode === 'palettes'
        ? html`${radioGroup(
              strings.display,
              strings.display,
              options.paletteStyle,
              [
                ['stops', strings.paletteStops],
                ['gradient', strings.paletteGradient],
              ],
              options.onPaletteStyle,
            )}<tp-separator></tp-separator>`
        : // Favorites keep the style each was bookmarked in: only the size applies.
          nothing;
  const menu = html`<tp-menu
    class="options-menu"
    .portal=${false}
    align="end"
    label=${strings.options}
    @tp-open-change=${stop}
    @tp-open-change-complete=${stop}
    @tp-action=${stop}
    ><tp-button
      slot="trigger"
      class="options"
      variant="ghost"
      size="icon"
      .icon=${viewOptionsIcon}
      aria-label=${strings.options}
      ?disabled=${options.disabled}
    ></tp-button
    >${collectionsMenu}${display}${radioGroup(
      strings.size,
      strings.size,
      options.size,
      [
        ['sm', strings.sizeSmall],
        ['default', strings.sizeMedium],
        ['lg', strings.sizeLarge],
      ],
      options.onSize,
    )}</tp-menu
  >`;
  return html`<div class="toolbar" part="color-palette-toolbar">${modes}${menu}</div>`;
}
