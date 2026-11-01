import type { MarkdownAlertKind } from '../../../foundation/markdown/types.js';
import type { PresentationDeclarations } from '../../resolver.js';
import { surfaceEdge } from './edges.js';

/** The callout surface (`uwg-te-tab-vocabulary-r17`): the Alert surface with its icon column gap. */
export const calloutSurface: PresentationDeclarations = {
  'column-gap': 'var(--tp-space-2)',
  padding: 'var(--tp-space-2) var(--tp-space-2-5)',
  border: surfaceEdge.border,
  'border-radius': 'var(--tp-radius-lg)',
  background: 'var(--tp-card)',
  color: 'var(--tp-card-foreground)',
  'font-size': 'var(--tp-text-sm)',
  'box-shadow': 'var(--tp-shadow-none)',
};

/** The severities of a callout surface; `informational` keeps the surface's own text color. */
export type CalloutSeverity = 'informational' | 'success' | 'warning' | 'danger';

/** The severities that tint the callout surface, in this order. */
export const calloutTints = ['informational', 'success', 'warning', 'danger'] as const;
type CalloutTint = (typeof calloutTints)[number];

/** The status role of a tinting severity. */
const roleOf = (severity: CalloutTint) =>
  severity === 'danger' ? 'destructive' : severity === 'informational' ? 'primary' : severity;

/** The severity of each alert kind (`> [!NOTE]`), shared by Markdown alerts and callout tones. */
export const alertKindSeverity: Readonly<Record<MarkdownAlertKind, CalloutSeverity>> = {
  note: 'informational',
  important: 'informational',
  tip: 'success',
  warning: 'warning',
  caution: 'danger',
};

/**
 * The callout surface in a severity, painted as a status variant: its role's tinted fill, edge and
 * text tone, which the title, the description and the mark all take.
 */
export function calloutTint(severity: CalloutTint): PresentationDeclarations {
  const role = roleOf(severity);
  return {
    background: `var(--tp-${role}-subtle)`,
    'border-color': `var(--tp-${role}-border)`,
    color: `var(--tp-${role}-subtle-foreground)`,
  };
}
