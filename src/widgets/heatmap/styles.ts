import { css } from 'lit';
import { ambientCss } from '../../presentation/motion.js';

/**
 * Structure only: the grid tracks, the label strips, the fit modes and the cell box. Sizes,
 * colors, radii and text are the recipe's, through the `--tp-heatmap-*` properties.
 */
export const heatmapStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    min-block-size: 0;
  }

  .root {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-inline-size: 0;
    min-block-size: 0;
  }

  /* The plot: row labels beside the cells, column labels above them. Unless the grid scrolls, all
     three share one grid, the strips and the cells as subgrids, so labels follow the cell tracks
     whatever size the cells stretch to. */
  .plot {
    display: grid;
    flex: 0 1 auto;
    grid-template-columns: max-content repeat(var(--_columns), minmax(var(--_cell), 1fr));
    grid-template-rows: auto repeat(var(--_rows), auto);
    gap: var(--_gap);
    min-inline-size: 0;
    min-block-size: 0;

    /* Cells that do not fit are cut off, but the rings of edge cells stay whole. */
    overflow: clip;
    overflow-clip-margin: calc(var(--tp-ring-width, 2px) + var(--tp-ring-offset, 2px) + 1px);
  }

  /* The minimum cell size, measured to know when stretched cells no longer fit. */
  .probe {
    position: absolute;
    inline-size: var(--_cell);
    block-size: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .corner {
    grid-column: 1;
    grid-row: 1;
  }

  .column-labels {
    display: grid;
    grid-column: 2 / -1;
    grid-row: 1;
    grid-template-columns: subgrid;
    min-inline-size: 0;
  }

  .row-labels {
    display: grid;
    grid-column: 1;
    grid-row: 2 / -1;
    grid-template-rows: subgrid;
  }

  .cells {
    display: grid;
    grid-column: 2 / -1;
    grid-row: 2 / -1;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    position: relative;
  }

  .row {
    display: contents;
  }

  /* Scroll (fit="scroll", or stretched cells that no longer fit): the cells scroll in their own
     Scroll area, whose edges carry the shadows; the label strips stay outside it and follow its
     scroll position. */
  [data-scroll] .plot {
    flex: 1 1 auto;
    grid-template-columns: max-content minmax(0, max-content);
    grid-template-rows: auto minmax(0, max-content);
    place-content: start;
  }

  [data-scroll] .column-labels,
  [data-scroll] .row-labels {
    overflow: hidden;
  }

  [data-scroll] .column-labels {
    grid-column: 2;
    grid-template-columns: none;
  }

  [data-scroll] .row-labels {
    grid-row: 2;
    grid-template-rows: none;
  }

  [data-scroll] .track {
    display: grid;
    gap: var(--_gap);
    inline-size: max-content;
    will-change: transform;
  }

  [data-scroll] .column-labels .track {
    grid-template-columns: repeat(var(--_columns), var(--_cell));
  }

  [data-scroll] .row-labels .track {
    grid-template-rows: repeat(var(--_rows), var(--_cell));
    inline-size: auto;
  }

  [data-scroll] .scroller {
    grid-column: 2;
    grid-row: 2;
    min-inline-size: 0;
    min-block-size: 0;
  }

  [data-scroll] .cells {
    grid-template-columns: repeat(var(--_columns), var(--_cell));
    grid-template-rows: repeat(var(--_rows), var(--_cell));
    gap: var(--_gap);
    inline-size: max-content;
  }

  :host([fit='trim']) .plot {
    grid-template-columns: max-content repeat(var(--_columns), var(--_cell));
    justify-content: start;
  }

  .column-label,
  .row-label {
    min-inline-size: 0;
    white-space: nowrap;
  }

  .row-label {
    display: flex;
    align-items: center;
  }

  .column-label {
    overflow: hidden;
    align-self: end;
  }

  /* A label of its own column sits centered over the cell. */
  .column-label[data-fit] {
    overflow: visible;
    justify-self: center;
    text-align: center;
  }

  .column-label[data-clipped] {
    visibility: hidden;
  }

  /* A label shows its short form while every short label fits its cell, its narrow form
     otherwise; the hidden form stays laid out so its width keeps being measured. */
  .label-narrow,
  [data-narrow] .label-short {
    position: absolute;
    visibility: hidden;
  }

  [data-narrow] .label-narrow {
    position: static;
    visibility: visible;
  }

  .cell {
    display: block;
    aspect-ratio: 1;
    min-inline-size: 0;
    box-sizing: border-box;
    grid-row: var(--_row);
    outline-offset: 1px;
  }

  /* Loading cells pulse like Skeleton placeholders; reduced motion holds them still. */
  :host([loading]) .cell {
    animation: ${ambientCss('pulse', 'placeholder', 'var(--tp-easing-standard)')};
    animation-play-state: var(--tp-motion-play-state, running);
  }

  @media (prefers-reduced-motion: reduce) {
    :host([loading]) .cell {
      animation: none;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: var(--tp-opacity-disabled);
    }
  }

  .plot[data-no-column-labels] {
    row-gap: 0;
  }

  .plot[data-no-row-labels] {
    column-gap: 0;
  }

  .plot[data-no-column-labels] :is(.cells, .row-labels) {
    row-gap: var(--_gap);
  }

  .plot[data-no-row-labels] :is(.cells, .column-labels) {
    column-gap: var(--_gap);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    min-inline-size: 0;
  }

  .footer[hidden] {
    display: none;
  }

  .legend {
    display: inline-flex;
    align-items: center;
    margin-inline-start: auto;
  }

  .legend-cell {
    display: block;
    inline-size: var(--_legend-cell);
    block-size: var(--_legend-cell);
  }

  .error {
    color: inherit;
  }
`;
