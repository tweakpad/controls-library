import { css } from 'lit';
import { rangeHandleStyles } from '../../components/shared/control-styles.js';

/** Structure only: layout, geometry, hit targets and hidden inputs. Appearance is the recipe. */
export const colorPickerStyles = css`
  :host {
    display: block;
    min-inline-size: 0;
  }

  :host([picker='popup']) {
    display: inline-block;
  }

  /* Nested controls and surfaces dim themselves exactly once. */
  :host([data-disabled]) {
    cursor: auto;
    opacity: 1;
  }

  .root {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  .label {
    display: block;
  }

  .panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--_tp-color-picker-space, var(--tp-space-3));
    min-inline-size: 0;
  }

  .view {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--_tp-color-picker-space, var(--tp-space-3));
    min-inline-size: 0;
  }

  .view[hidden] {
    display: none;
  }

  tp-tabs.views {
    min-inline-size: 0;
  }

  .controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    min-inline-size: 0;
  }

  .sliders {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  .channels {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--tp-space-2);
    min-inline-size: 0;
  }

  .fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  .fields-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tp-space-2);
    min-inline-size: 0;
  }

  .fields-row > :is(.eyedropper, .palette-toggle, .preview) {
    flex: none;
  }

  /* The format Select takes the rest of the first row. */
  .format-row > tp-select {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /*
   * The color editors and alpha are one Field group that takes the rest of the row, never
   * narrower than the width that shows every editor's digits (the widget sets
   * --_tp-color-picker-group-min from the format's editors and alpha); below it, the row wraps.
   */
  .fields-row > .channels {
    flex: 1 1 calc(var(--tp-spacing) * var(--_tp-color-picker-group-min, 48));
    min-inline-size: calc(var(--tp-spacing) * var(--_tp-color-picker-group-min, 48));
  }

  .channels > .field {
    min-inline-size: 0;
  }

  .field tp-input {
    inline-size: 100%;
  }

  .channel-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    min-inline-size: 0;
  }

  /* The alpha row under the surface has no visible label, so its field centers on the Slider. */
  .alpha-row {
    align-items: center;
  }

  .channel-row .field {
    flex: none;
    inline-size: calc(var(--tp-spacing) * 20);
  }

  /*
   * The popup's editors share one line: they shrink down to the width that still shows their
   * digits (the widget sets --_tp-color-picker-group-min from the format's editors), and the
   * popup widens for formats that need more (--_tp-color-picker-popup-min on the panel).
   */
  .popup-panel .fields-row {
    flex-wrap: nowrap;
  }

  tp-slider {
    inline-size: 100%;
    min-inline-size: 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    min-inline-size: 0;
  }

  /*
   * Harmony palette ring: the wheel sits in the middle 72 % of a square box and the segments
   * (Copy buttons clipped to arcs) cover the box; only the arcs take pointer input.
   */
  .ring-box {
    position: relative;
    inline-size: min(100%, calc(var(--_tp-color-picker-area) / 0.72));
    aspect-ratio: 1;
    margin-inline: auto;
    min-inline-size: 0;
  }

  .ring-box > tp-color-picker-wheel {
    position: absolute;
    inset: 14%;
  }

  .palette {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .toolbar tp-select {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  /*
   * The body under the first row: the views and fields, and while open the Color palette over
   * them, filling the body's box exactly. The covered content keeps its size, so the picker never
   * moves, but it is hidden and inert.
   */
  .body {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  .body-content {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--_tp-color-picker-space, var(--tp-space-3));
    min-inline-size: 0;
  }

  .body[data-palette] > .body-content {
    visibility: hidden;
  }

  .palette-layer {
    position: absolute;
    inset: 0;
    display: flex;
    min-inline-size: 0;
    min-block-size: 0;
  }

  .heading {
    font-size: var(--tp-text-xs);
    color: var(--tp-muted-foreground);
  }

  /* The recent strip is as wide as its cells, so its one edge wraps them. */
  tp-toggle-group.swatches {
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  /* A flat region draws the strip's cells gapless and square (its edges are transparent). */
  @container style(--tp-edge: transparent) {
    tp-toggle-group.swatches {
      --_tp-color-picker-flat: 1;
    }
  }

  /* The fill is slotted into the Toggle and positioned against it (flat-tree containing block): a
     rounded chip inset by half the gap, or, in a flat region, the whole gapless cell. */
  .swatch {
    position: absolute;
    inset: calc(var(--tp-space-1) / 2 * (1 - var(--_tp-color-picker-flat, 0)));
    border-radius: calc(var(--tp-radius-sm) * (1 - var(--_tp-color-picker-flat, 0)));
    pointer-events: none;
  }

  /* An empty footer leaves no row, so the root's gap does not follow the trigger or panel. */
  .footer[hidden] {
    display: none !important;
  }

  .popup-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  /* Popup header: the Select takes the remaining width; the actions keep their size. */
  .header {
    display: flex;
    align-items: center;
    gap: var(--tp-space-2);
    min-inline-size: 0;
  }

  .header > tp-select {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  .header > tp-button-group,
  .header > tp-copy-button,
  .header > tp-button {
    flex: none;
  }

  .recent {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-inline-size: 0;
  }

  /* Each segment covers the ring box; its copy mark shows while hovered, focused or copied. */
  .palette tp-copy-button {
    --_tp-color-picker-mark: 0;

    position: absolute;
    inset: 0;
    display: block;
  }

  .palette tp-copy-button:is(:hover, :focus-within, [data-copied]) {
    --_tp-color-picker-mark: 1;
  }

  .preview {
    display: block;
    flex: none;
  }
`;

/** Shared structure of the render surfaces (area, wheel, triangle). */
export const colorSurfaceStyles = css`
  :host {
    display: block;
    min-inline-size: 0;
  }

  .surface {
    position: relative;
    touch-action: none;
    user-select: none;
  }

  .surface[data-disabled] {
    cursor: not-allowed;
  }

  .thumb,
  .handle {
    position: absolute;
    top: 0;
    left: 0;
    translate: -50% -50%;
    touch-action: none;
  }

  /* Editable handles paint above the derived ones that may share or overlap their position. */
  .handle[data-editable] {
    z-index: 1;
  }

  ${rangeHandleStyles('.thumb, .handle')}

  svg.line {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    pointer-events: none;
    overflow: visible;
  }

  /* Ring box: a square the size of the area; the ring paint is a masked layer inside it. */
  .ring-box {
    aspect-ratio: 1;
    inline-size: min(100%, var(--_tp-color-picker-area, calc(var(--tp-spacing) * 40)));
    margin-inline: auto;
  }

  .ring {
    position: absolute;
    inset: 0;
    mask-image: radial-gradient(
      circle closest-side,
      transparent calc(100% - var(--_tp-color-picker-ring, 20px) - 0.5px),
      #000 calc(100% - var(--_tp-color-picker-ring, 20px) + 0.5px)
    );
  }

  .triangle {
    position: absolute;
    inset: var(--_tp-color-picker-ring, 20px);
  }

  canvas {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
`;
