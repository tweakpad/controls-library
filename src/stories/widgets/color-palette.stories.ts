import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { useArgs } from 'storybook/preview-api';
import {
  defaultColorCollection,
  reducedColorCollection,
  type ColorPaletteLayout,
  type ColorPaletteMode,
  type ColorPalettePaletteStyle,
  type ColorPaletteSize,
  type PaletteGrouping,
  type PaletteSort,
  type TpColorPalette,
} from '../../widgets/color-palette/index.js';
import cssNamedColors from '../../foundation/color-palette/collections/css-named/index.js';
import type { TpValueChangeEvent } from '../../foundation/events.js';
import { libraryDocs } from '../library-docs.js';

interface Args {
  value: string;
  mode: ColorPaletteMode;
  layout: ColorPaletteLayout;
  paletteStyle: ColorPalettePaletteStyle;
  grouping: PaletteGrouping;
  sort: PaletteSort;
  size: ColorPaletteSize;
  columns: number;
  toolbar: boolean;
  label: string;
  disabled: boolean;
  readOnly: boolean;
  moreCollections: boolean;
}

const meta: Meta<Args> = {
  title: 'Widgets/Color palette',
  component: 'tp-color-palette',
  parameters: { docs: libraryDocs('widgets/color-palette') },
  args: {
    value: '',
    mode: 'colors',
    layout: 'grid',
    paletteStyle: 'stops',
    grouping: 'collection',
    sort: 'collection',
    size: 'default',
    columns: 9,
    toolbar: true,
    label: 'Fill',
    disabled: false,
    readOnly: false,
    moreCollections: false,
  },
  argTypes: {
    value: { control: 'text', description: 'Controlled color; the story accepts proposals.' },
    mode: { control: 'select', options: ['colors', 'palettes'] },
    paletteStyle: { control: 'select', options: ['stops', 'gradient'] },
    layout: { control: 'select', options: ['grid', 'list'] },
    grouping: { control: 'select', options: ['collection', 'hue', 'none'] },
    sort: { control: 'select', options: ['collection', 'lightness', 'hue', 'chroma'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    columns: { control: { type: 'number', min: 4, max: 16, step: 1 } },
    toolbar: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    moreCollections: {
      control: 'boolean',
      description: 'Story setup: adds the CSS named colors and the reduced collection.',
    },
  },
  render: (args) => {
    const [, updateArgs] = useArgs<Args>();
    const palette = createRef<TpColorPalette>();
    // Each lane follows its Control: the story accepts every proposal and writes it back.
    const accept =
      (key: keyof Args) =>
      (event: TpValueChangeEvent<unknown>): void => {
        if (event.defaultPrevented || event.detail.cancelled) return;
        const element = palette.value as unknown as Record<string, unknown> | undefined;
        if (!element) return;
        element[key] = event.detail.value;
        queueMicrotask(() => updateArgs({ [key]: element[key] } as Partial<Args>));
      };
    return html`<tp-color-palette
      ${ref(palette)}
      .value=${args.value}
      .mode=${args.mode}
      .layout=${args.layout}
      .paletteStyle=${args.paletteStyle}
      .grouping=${args.grouping}
      .sort=${args.sort}
      .size=${args.size}
      .columns=${args.columns}
      .toolbar=${args.toolbar}
      .label=${args.label}
      .disabled=${args.disabled}
      .readOnly=${args.readOnly}
      .collections=${
        args.moreCollections ? [defaultColorCollection, cssNamedColors, reducedColorCollection] : []
      }
      @tp-value-change=${accept('value')}
      @tp-mode-change=${accept('mode')}
      @tp-layout-change=${accept('layout')}
      @tp-palette-style-change=${accept('paletteStyle')}
      @tp-size-change=${accept('size')}
      @tp-grouping-change=${accept('grouping')}
      @tp-sort-change=${accept('sort')}
    ></tp-color-palette>`;
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Collections: Story = {
  tags: ['!autodocs'],
  args: { moreCollections: true, grouping: 'hue', sort: 'lightness', label: 'Ink' },
};

export const Palettes: Story = {
  tags: ['!autodocs'],
  args: { mode: 'palettes', paletteStyle: 'gradient', value: '#e64a7c', label: 'Theme' },
};
