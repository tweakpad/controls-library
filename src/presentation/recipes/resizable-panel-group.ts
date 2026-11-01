import type { PresentationDictionary } from '../resolver.js';
import { resizeSeparatorRules } from './shared/separator.js';
import { divider } from './shared/edges.js';
export const resizablePanelGroupAppearance: PresentationDictionary = {
  'resizable-panel-group-separator': resizeSeparatorRules,
  'resizable-panel-group-handle-decoration': [
    {
      declarations: {
        background: divider.color,
        width: 'var(--tp-space-1)',
        height: 'var(--tp-space-6)',
        'border-radius': 'var(--tp-radius-lg)',
      },
    },
    {
      selector: '&[data-orientation="vertical"]',
      declarations: { width: 'var(--tp-space-6)', height: 'var(--tp-space-1)' },
    },
  ],
};
