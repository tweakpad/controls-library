import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { libraryDocs } from './library-docs.js';
import type { TpStack } from '../components/stack/stack.js';
type Args = Pick<TpStack, 'direction' | 'gap' | 'align' | 'justify' | 'wrap'>;
const meta = {
  title: 'Components/Stack',
  component: 'tp-stack',
  parameters: { docs: libraryDocs('components/stack') },
  args: { direction: 'column', gap: 4, align: 'stretch', justify: 'start', wrap: 'nowrap' },
  argTypes: {
    direction: { control: 'object' },
    gap: { control: 'object' },
    align: { control: 'object' },
    justify: { control: 'object' },
    wrap: { control: 'object' },
  },
  render: (args: Args) =>
    html`<tp-stack
      .direction=${args.direction}
      .gap=${args.gap}
      .align=${args.align}
      .justify=${args.justify}
      .wrap=${args.wrap}
      ><tp-button>First action</tp-button
      ><tp-button variant="secondary">Second action</tp-button></tp-stack
    >`,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
