import { css, unsafeCSS } from 'lit';
import { surfaceFooterLayout } from '../../presentation/recipes/shared/surface.js';

/** Applies the shared action-row geometry; section paint stays in the surface recipes. */
export const surfaceFooterStyles = css`
  .footer {
    ${unsafeCSS(
      Object.entries(surfaceFooterLayout)
        .map(([name, value]) => `${name}:${value};`)
        .join(''),
    )}
  }

  .footer slot {
    display: contents;
  }
`;
