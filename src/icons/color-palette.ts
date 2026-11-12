import { emptyStateIcons } from './empty-state.js';
import type { IconDefinition } from './types.js';

/** View options: three sliders (original artwork). */
export const viewOptionsIcon: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: [
    { d: 'M3 6h9M16 6h5M3 12h3M10 12h11M3 18h11M18 18h3', strokeWidth: 2 },
    { d: 'M14 4v4M8 10v4M16 16v4', strokeWidth: 2 },
  ],
};

/** The color collections: books and a leaning one on a shelf. */
export const collectionsIcon: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: [{ d: 'm16 6 4 14M12 6v14M8 8v12M4 4v16', strokeWidth: 2 }],
};

/** A collection without colors or palettes: a painter's palette with three wells (original artwork). */
export const paletteIcon: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: [
    {
      d: 'M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.7-1.7H17a4 4 0 0 0 4-4c0-4.5-4-8.2-9-8.2Z',
      strokeWidth: 2,
    },
    { d: 'M7.5 11.5h.01M9.5 7.5h.01M14.5 7.5h.01', strokeWidth: 3 },
  ],
};

/** A new favorite: the empty-state heart filled, without its outline. */
export const favoriteHeartIcon: IconDefinition = {
  viewBox: emptyStateIcons.heart.viewBox,
  paths: emptyStateIcons.heart.paths.map((path) => ({
    d: path.d,
    fill: 'currentColor',
    stroke: 'none',
  })),
};
