import { css } from 'lit';

/** Structure only: layout and visibility. Appearance is the recipe. */
export const layersStyles = css`
  :host {
    display: block;
    min-inline-size: 0;
  }

  .root {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    min-block-size: 0;
  }

  .bar {
    display: flex;
    align-items: center;
    min-inline-size: 0;
  }

  .bar[data-empty],
  .tree[hidden],
  .empty[hidden] {
    display: none;
  }

  .tree {
    display: block;
    min-block-size: 0;
  }

  /* Rows keep a column for the group chevron so labels line up under groups; a stack without
     groups has no chevron to line up with, so its rows start at their edge. */
  .tree[data-flat]::part(indicator) {
    display: none;
  }
`;
