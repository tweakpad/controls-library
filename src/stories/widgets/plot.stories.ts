import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { libraryDocs } from '../library-docs.js';
import type { PlotSeries } from '../../widgets/plot/types.js';
interface Args {
  label: string;
  background: 'none' | 'solid' | 'dots' | 'grid';
  axes: boolean;
  legend: boolean;
  interaction: 'none' | 'inspect';
  lineWidth: number;
  fill: boolean;
  size: 'sm' | 'default' | 'lg';
}
const points = Array.from({ length: 240 }, (_, i) => [i, Math.sin((i * Math.PI) / 40)] as const);
const meta: Meta<Args> = {
  title: 'Widgets/Plot',
  component: 'tp-plot',
  parameters: { docs: libraryDocs('widgets/plot') },
  args: {
    label: 'Waveform',
    background: 'none',
    axes: false,
    legend: false,
    interaction: 'none',
    lineWidth: 1.5,
    fill: false,
    size: 'default',
  },
  argTypes: {
    label: { control: 'text' },
    background: { control: 'select', options: ['none', 'solid', 'dots', 'grid'] },
    axes: { control: 'boolean' },
    legend: { control: 'boolean' },
    interaction: { control: 'select', options: ['none', 'inspect'] },
    lineWidth: { control: { type: 'number', min: 0, max: 6, step: 0.5 } },
    fill: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
  render: (args) =>
    html`<tp-plot
      .label=${args.label}
      .background=${args.background}
      .xAxis=${args.axes ? {} : false}
      .yAxis=${args.axes ? {} : false}
      .legend=${args.legend ? {} : false}
      .interaction=${args.interaction}
      .size=${args.size}
      .series=${[{ id: 'wave', label: 'Amplitude', lineWidth: args.lineWidth, fill: args.fill ? { baseline: 0 } : false }] satisfies PlotSeries[]}
      .data=${{ wave: points }}
      style="inline-size:100%;height:12rem"
    ></tp-plot>`,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
export const SignedArea: Story = {
  tags: ['!autodocs'],
  render: () =>
    html`<tp-plot
      label="Signed load"
      background="solid"
      y-domain="-1.2 1.2"
      .series=${[{ id: 'load', label: 'Load', fill: { baseline: 0 }, negativeColor: 'var(--tp-destructive)' }]}
      .data=${{ load: points }}
      .guides=${[{ id: 'zero', axis: 'y', value: 0 }]}
      style="height:12rem"
    ></tp-plot>`,
};
export const Monitors: Story = {
  tags: ['!autodocs'],
  render: () =>
    html`<tp-plot
      label="Service CPU"
      background="grid"
      .xAxis=${{}}
      .yAxis=${{}}
      .legend=${{}}
      .series=${[
        { id: 'a', label: 'Service A', fill: { baseline: 0 } },
        { id: 'b', label: 'Service B', lineDash: [4, 2], fill: { baseline: 0 } },
      ]}
      .data=${{ a: points.map(([x, y]) => [x, (y + 1) * 30]), b: points.map(([x, y]) => [x, 40 + y * 12]) }}
      style="height:16rem"
    ></tp-plot>`,
};
