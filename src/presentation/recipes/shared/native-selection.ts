import type { PresentationDeclarations } from '../../resolver.js';

/** Shared native text selection and the forced-color projection for shadow roots. */
export const nativeSelectionCss = `
::selection {
  background-color: var(--tp-selection);
  color: var(--tp-selection-foreground);
  text-shadow: none;
}
@media (forced-colors: active) {
  :host {
    --_tp-native-selection-background: Highlight;
    --_tp-native-selection-foreground: HighlightText;
    --_tp-native-selection-shadow: none;
  }
  ::selection {
    background-color: Highlight;
    color: HighlightText;
  }
}
`;

/** Native focused options override background/color in some user-agent styles.
 * An inset paint layer and text fill keep the theme without replacing native input.
 * TpElement removes the paint layer and supplies system colors in forced colors.
 */
export const nativeOptionSelection: PresentationDeclarations = {
  'background-color': 'var(--_tp-native-selection-background, var(--tp-selection))',
  color: 'var(--_tp-native-selection-foreground, var(--tp-selection-foreground))',
  'box-shadow': 'var(--_tp-native-selection-shadow, inset 0 0 0 100vmax var(--tp-selection))',
  '-webkit-text-fill-color':
    'var(--_tp-native-selection-foreground, var(--tp-selection-foreground))',
};
