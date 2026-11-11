import { css } from 'lit';

/** Structure only: layout, extents and hit targets. Appearance is the recipe. */
export const colorPaletteStyles = css`
  :host {
    display: inline-flex;
    flex-direction: column;
    vertical-align: top;
    max-inline-size: 100%;
    min-block-size: 0;
  }

  .root {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-block-size: 0;
    min-inline-size: 0;

    /* The columns of medium cells and the list's insets, whatever the cell size: a size reflows
       the cells inside this box, and a narrower host shrinks the cells instead. */
    inline-size: calc(
      var(--_tp-color-palette-frame) * var(--_tp-color-palette-frame-columns, 9) +
        var(--_tp-color-palette-chrome)
    );
    max-inline-size: 100%;
    container-type: inline-size;
    position: relative;
  }

  /* Measures the cell of the current size and the medium cell, without taking space. */
  .probe {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .probe > span {
    display: block;
    block-size: 0;
  }

  .probe-cell {
    inline-size: var(--_tp-color-palette-unit);
  }

  .probe-frame {
    inline-size: var(--_tp-color-palette-frame);
  }

  /* The toolbar never widens the palette: the grid sets the width. The mode Tabs and the options
     share the first row, the Tabs shrinking before the options; the collection Select takes the
     second. */
  .toolbar {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    flex: none;
    align-items: center;
    contain: inline-size;
    inline-size: 100%;
    min-inline-size: 0;
  }

  .toolbar .modes {
    grid-column: 1;
    justify-self: start;
    max-inline-size: 100%;
    min-inline-size: 0;
  }

  .toolbar .options {
    grid-column: 2;
  }

  .toolbar .collection {
    grid-column: 1 / -1;
    min-inline-size: 0;
  }

  /* The Scroll area holds six rows of medium cells, whatever the size. */
  .scroller {
    flex: none;
    block-size: var(--_tp-color-palette-list);
  }

  /* The listbox: the cells centered between equal insets, as wide as a row of cells. The virtual
     window keeps the visible rows still itself; browser scroll anchoring on its reused rows would
     move the list by whole rows, so the list offers no anchor (Foundation virtual list window). */
  .list {
    box-sizing: border-box;
    overflow-anchor: none;
    inline-size: calc(var(--_tp-color-palette-cell) * var(--_tp-color-palette-columns, 9));
    margin-inline: auto;
  }

  /* Labels and rows are one cell tall, so every row of the virtual window has the same extent. */
  .label {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--tp-space-1);
    block-size: var(--_tp-color-palette-label);
    min-block-size: 0;
  }

  /* Rows are as wide as their cells. */
  .row {
    display: flex;
    inline-size: fit-content;
  }

  .option {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex: none;
    align-items: flex-end;
    justify-content: flex-start;
    inline-size: var(--_tp-color-palette-cell);
    block-size: var(--_tp-color-palette-cell);
    min-block-size: 0;
    padding: 0;
  }

  /* The chosen cell draws above its neighbors. */
  .option[data-selected] {
    z-index: 1;
  }

  /* A palette's options share the list's inline size: equally, or by their share. */
  .root[data-mode='palettes'] .row {
    inline-size: 100%;
  }

  .root[data-mode='palettes'] .option {
    flex: var(--_tp-color-palette-share, 1) 1 0;
    inline-size: auto;
    min-inline-size: 0;
  }

  /* A list row: the full width, one cell tall, its color then its text. */
  .root[data-mode='colors'][data-layout='list'] .row {
    inline-size: 100%;
  }

  .option[data-layout='list'] {
    flex: 1 1 auto;
    align-items: center;
    gap: var(--tp-space-2);
    inline-size: 100%;
    min-inline-size: 0;
  }

  /* A list row's color: three cells wide, one cell tall. */
  .swatch {
    flex: none;
    inline-size: calc(var(--_tp-color-palette-cell) * 3);
    block-size: var(--_tp-color-palette-cell);
  }

  .row-text {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attribution {
    box-sizing: border-box;
    flex: none;
    contain: inline-size;
    inline-size: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
