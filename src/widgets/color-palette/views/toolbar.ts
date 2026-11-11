import { html, nothing } from 'lit';
import type { TpValueChangeEvent } from '../../../foundation/events.js';
import type { PaletteGrouping } from '../../../foundation/color-palette/index.js';
import { viewOptionsIcon } from '../../../icons/color-palette.js';
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
 * The toolbar: the mode Tabs, the view options menu and the collection Select. The Tabs have no
 * panels: the list below shows the selected mode. The menu's Display section shapes the active
 * mode (the colors' layout, then their Group by section, or the palettes' hard stops or
 * gradient); its Size section sizes the cells of every mode.
 */
export function renderToolbar(options: ToolbarOptions) {
  const { strings } = options;
  const modeNames: Readonly<Record<ColorPaletteMode, string>> = {
    colors: strings.modeColors,
    palettes: strings.modePalettes,
  };
  const modes =
    options.modes.length > 1
      ? html`<tp-tabs
          class="modes"
          variant="underline"
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
  const collection =
    options.collections.length > 1
      ? html`<tp-select
          class="collection"
          size="sm"
          label=${strings.collection}
          .items=${options.collections.map((entry) => ({ value: entry.id, label: entry.label }))}
          .value=${options.collection}
          ?disabled=${options.disabled}
          @tp-value-change=${options.onCollection}
          @tp-field-value=${stop}
          @tp-open-change=${stop}
          @tp-open-change-complete=${stop}
        ></tp-select>`
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
      : html`${radioGroup(
            strings.display,
            strings.display,
            options.paletteStyle,
            [
              ['stops', strings.paletteStops],
              ['gradient', strings.paletteGradient],
            ],
            options.onPaletteStyle,
          )}<tp-separator></tp-separator>`;
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
      size="icon-sm"
      .icon=${viewOptionsIcon}
      aria-label=${strings.options}
      ?disabled=${options.disabled}
    ></tp-button
    >${display}${radioGroup(
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
  return html`<div class="toolbar" part="color-palette-toolbar">${modes}${menu}${collection}</div>`;
}
