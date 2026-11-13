import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import type { TreeViewSize } from '../../components/tree-view/types.js';
import { eyeIcon } from '../../icons/eye.js';
import { eyeOffIcon } from '../../icons/eye-off.js';
import { lockIcon } from '../../icons/lock.js';
import { fileTextIcon } from '../../icons/file-text.js';
import { imageIcon } from '../../icons/image.js';
import { folderIcon } from '../../icons/folder.js';
import { libraryDocs } from '../library-docs.js';

interface Args {
  size: TreeViewSize;
  canReorder: boolean;
  canRename: boolean;
  canRemove: boolean;
  label: string;
  disabled: boolean;
  readOnly: boolean;
}

// Visibility swaps its icon; the lock shows while locked and, unlocked, only on the row's hover.
const visibility = (value: 'visible' | 'hidden') =>
  html`<tp-layer-state name="visibility" label="Visibility" value=${value}>
    <tp-layer-state-value value="visible"
      ><tp-icon .icon=${eyeIcon}></tp-icon
    ></tp-layer-state-value>
    <tp-layer-state-value value="hidden" dims
      ><tp-icon .icon=${eyeOffIcon}></tp-icon
    ></tp-layer-state-value>
  </tp-layer-state>`;
const lock = (value: 'locked' | 'unlocked') =>
  html`<tp-layer-state name="locked" label="Lock" value=${value}>
    <tp-layer-state-value value="locked"
      ><tp-icon .icon=${lockIcon}></tp-icon
    ></tp-layer-state-value>
    <tp-layer-state-value value="unlocked" display="hover"
      ><tp-icon .icon=${lockIcon}></tp-icon
    ></tp-layer-state-value>
  </tp-layer-state>`;

const meta: Meta<Args> = {
  title: 'Widgets/Layers',
  component: 'tp-layers',
  parameters: { docs: libraryDocs('widgets/layers') },
  args: {
    size: 'default',
    canReorder: true,
    canRename: true,
    canRemove: true,
    label: 'Poster',
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default'] },
    canReorder: { control: 'boolean' },
    canRename: { control: 'boolean' },
    canRemove: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  render: (args) =>
    html`<tp-card style="inline-size: 18rem">
      <tp-layers
        .label=${args.label}
        .size=${args.size}
        .canReorder=${args.canReorder}
        .canRename=${args.canRename}
        .canRemove=${args.canRemove}
        .disabled=${args.disabled}
        .readOnly=${args.readOnly}
        default-expanded='["night"]'
        default-value='["moon"]'
      >
        <tp-layer id="headline" label="Headline"
          ><tp-icon .icon=${fileTextIcon}></tp-icon
          >${visibility('visible')}${lock('locked')}</tp-layer
        >
        <tp-layer id="night" label="Night sky"
          ><tp-icon .icon=${folderIcon}></tp-icon>${visibility('visible')}${lock('unlocked')}
          <tp-layer id="moon" label="Moon"
            ><tp-icon .icon=${imageIcon}></tp-icon>${visibility('visible')}</tp-layer
          >
          <tp-layer id="stars" label="Stars"
            ><tp-icon .icon=${imageIcon}></tp-icon>${visibility('hidden')}</tp-layer
          >
        </tp-layer>
        <tp-layer id="paper" label="Paper texture"><tp-icon .icon=${imageIcon}></tp-icon></tp-layer>
      </tp-layers>
    </tp-card>`,
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
