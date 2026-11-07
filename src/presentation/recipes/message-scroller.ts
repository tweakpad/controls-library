import type { PresentationDictionary } from '../resolver.js';
import { motionTransition } from '../motion.js';
import { surfaceEdge } from './shared/edges.js';

export const messageScrollerAppearance: PresentationDictionary = {
  'message-scroller-return-control': [
    {
      declarations: {
        background: 'var(--tp-background)',
        color: 'var(--tp-foreground)',
        'border-color': surfaceEdge.color,
        'border-radius': 'var(--tp-radius-full)',
        transition: motionTransition(['opacity', 'translate'], 'fast'),
        opacity: '1',
        translate: '0 0',
      },
    },
    {
      selector: '&:not([data-active])',
      declarations: { opacity: '0', translate: '0 var(--tp-space-1)' },
    },
  ],
  'message-scroller-content': [
    { declarations: { gap: 'var(--tp-space-6)', padding: 'var(--tp-space-3)' } },
  ],
};
