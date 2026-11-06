import { css } from 'lit';
import { visualizationStructure } from '../../components/data-visualization/styles.js';
export const plotStyles = [
  visualizationStructure,
  css`
    :host {
      block-size: 10rem;
    }

    figure {
      block-size: 100%;
    }

    .viewport {
      position: relative;
      flex: 1;
      min-block-size: 0;
      min-inline-size: 0;
    }

    canvas {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }

    .empty {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      pointer-events: none;
    }

    .inspection {
      position: absolute;
      inset-inline-end: 0;
      inset-block-start: 0;
      pointer-events: none;
    }

    .probe {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    }
  `,
];
