import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import {
  type ColorGradientInputSize,
  type ColorGradientInterpolation,
  type ColorGradientStop,
} from '../../widgets/color-gradient-input/index.js';
import { libraryDocs } from '../library-docs.js';

interface Args {
  interpolation: ColorGradientInterpolation;
  size: ColorGradientInputSize;
  removable: boolean;
  minStops: number;
  label: string;
  disabled: boolean;
  readOnly: boolean;
}

const stops: readonly ColorGradientStop[] = [
  { position: 0, color: '#1d4ed8' },
  { position: 0.45, color: '#5eead4' },
  { position: 0.75, color: '#2563eb' },
  { position: 1, color: '#60a5fa' },
];

const meta: Meta<Args> = {
  title: 'Widgets/Color gradient input',
  component: 'tp-color-gradient-input',
  parameters: { docs: libraryDocs('widgets/color-gradient-input') },
  args: {
    interpolation: 'oklab',
    size: 'default',
    removable: true,
    minStops: 2,
    label: 'Fill',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    interpolation: {
      control: 'radio',
      options: ['oklab', 'srgb'],
      description: 'The color space neighboring stops mix in.',
    },
    size: { control: 'radio', options: ['sm', 'default'] },
    removable: { control: 'boolean', description: 'Shows the Button that removes a stop.' },
    minStops: { control: { type: 'number', min: 0, max: 6, step: 1 } },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  render: (args) =>
    html`<tp-color-gradient-input
      style="max-inline-size: calc(var(--tp-spacing) * 100)"
      .defaultValue=${stops}
      .defaultSelected=${1}
      .interpolation=${args.interpolation}
      .size=${args.size}
      .removable=${args.removable}
      .minStops=${args.minStops}
      .label=${args.label}
      .disabled=${args.disabled}
      .readOnly=${args.readOnly}
    ></tp-color-gradient-input>`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
