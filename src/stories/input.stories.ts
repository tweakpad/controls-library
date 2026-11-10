import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { useArgs } from 'storybook/preview-api';
import type { InputVariant, TpInput } from '../components/input/index.js';
import type { TpValueChangeEvent } from '../foundation/events.js';
import { libraryDocs } from './library-docs.js';

interface Args {
  value: string;
  type: string;
  label: string;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  mono: boolean;
  revealable: boolean;
  variant: InputVariant;
  unit: string;
}
const meta: Meta<Args> = {
  title: 'Components/Input',
  component: 'tp-input',
  parameters: { docs: libraryDocs('components/input') },
  args: {
    value: '',
    type: 'text',
    label: 'Project name',
    variant: 'default',
    unit: '',
    placeholder: 'Name your project',
    disabled: false,
    readOnly: false,
    required: false,
    mono: false,
    revealable: false,
  },
  argTypes: {
    value: { control: 'text', description: 'Controlled value; this example accepts proposals.' },
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'search',
        'tel',
        'url',
        'number',
        'date',
        'time',
        'color',
        'file',
      ],
    },
    label: { control: 'text' },
    variant: { control: 'select', options: ['default', 'inline'] },
    unit: { control: 'text', description: 'Inline: a unit after the value, such as px.' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    mono: {
      control: 'boolean',
      description: 'Mono font, with spell checking, autocorrection and autocapitalization off.',
    },
    revealable: {
      control: 'boolean',
      description: 'Password type: a Toggle that shows the value as plain text.',
    },
  },
  render: (args) => {
    const [, updateArgs] = useArgs<Args>();
    const control = createRef<TpInput>();
    return html`<tp-input
      ${ref(control)}
      .value=${args.value}
      .type=${args.type}
      .label=${args.label}
      .variant=${args.variant}
      .unit=${args.unit}
      .placeholder=${args.placeholder}
      .disabled=${args.disabled}
      .readOnly=${args.readOnly}
      .required=${args.required}
      .mono=${args.mono}
      .revealable=${args.revealable}
      .onValueChange=${(event: TpValueChangeEvent<string>) => {
        if (!event.defaultPrevented && !event.detail.cancelled && control.value) {
          const owner = control.value;
          owner.value = event.detail.value;
          queueMicrotask(() => {
            if (!event.defaultPrevented && !event.detail.cancelled && owner.isConnected) {
              updateArgs({ value: owner.value });
            }
          });
        }
      }}
    ></tp-input>`;
  },
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
