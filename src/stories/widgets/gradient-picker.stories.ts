import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import {
  type FieldGradientAnchor,
  type FieldGradientFalloff,
  type FieldGradientProjection,
  type GradientInterpolation,
  type GradientPickerSize,
  type GradientPickerVariant,
  type GradientStop,
} from '../../widgets/gradient-picker/index.js';
import { libraryDocs } from '../library-docs.js';

interface Args {
  variant: GradientPickerVariant;
  interpolation: GradientInterpolation;
  falloff: FieldGradientFalloff;
  power: number;
  warpAmplitude: number;
  warpFrequency: number;
  projection: FieldGradientProjection;
  size: GradientPickerSize;
  removable: boolean;
  label: string;
  disabled: boolean;
  readOnly: boolean;
}

const stops: readonly GradientStop[] = [
  { position: 0, color: '#1d4ed8' },
  { position: 0.45, color: '#5eead4' },
  { position: 0.75, color: '#2563eb' },
  { position: 1, color: '#60a5fa' },
];

const anchors: readonly FieldGradientAnchor[] = [
  { x: 0.2, y: 0.3, color: '#f97316' },
  { x: 0.55, y: 0.65, color: '#7c3aed' },
  { x: 0.85, y: 0.25, color: '#0ea5e9' },
];

const field = { table: { category: 'Field' } };

const meta: Meta<Args> = {
  title: 'Widgets/Gradient picker',
  component: 'tp-gradient-picker',
  parameters: { docs: libraryDocs('widgets/gradient-picker') },
  args: {
    variant: 'linear',
    interpolation: 'oklab',
    falloff: 'inverse-distance',
    power: 2.2,
    warpAmplitude: 0.12,
    warpFrequency: 1.2,
    projection: 'equirectangular',
    size: 'default',
    removable: true,
    label: 'Fill',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['linear', 'field'],
      description: 'Stops along a track, or color anchors on a field.',
    },
    interpolation: {
      control: 'radio',
      options: ['oklab', 'srgb'],
      description: 'The color space colors mix in.',
    },
    falloff: { control: 'radio', options: ['inverse-distance', 'gaussian'], ...field },
    power: { control: { type: 'range', min: 0.4, max: 6, step: 0.05 }, ...field },
    warpAmplitude: { control: { type: 'range', min: 0, max: 0.6, step: 0.005 }, ...field },
    warpFrequency: { control: { type: 'range', min: 0.3, max: 4, step: 0.05 }, ...field },
    projection: { control: 'radio', options: ['equirectangular', 'plane'], ...field },
    size: { control: 'radio', options: ['sm', 'default'] },
    removable: { control: 'boolean', description: 'Shows the Button that removes a stop.' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  // Each variant starts from its own stops: switching it renders a new picker.
  render: (args) =>
    html`${keyed(
      args.variant,
      html`<tp-gradient-picker
        .variant=${args.variant}
        .defaultValue=${args.variant === 'field' ? anchors : stops}
        .defaultSelected=${args.variant === 'field' ? 0 : 1}
        .interpolation=${args.interpolation}
        .falloff=${args.falloff}
        .power=${args.power}
        .warpAmplitude=${args.warpAmplitude}
        .warpFrequency=${args.warpFrequency}
        .projection=${args.projection}
        .size=${args.size}
        .removable=${args.removable}
        .label=${args.label}
        .disabled=${args.disabled}
        .readOnly=${args.readOnly}
      ></tp-gradient-picker>`,
    )}`,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Field: Story = { tags: ['!autodocs'], args: { variant: 'field' } };
