import type { ColorCollectionLoader } from '../types.js';

/**
 * Every collection shipped with the library as a loader: a palette given the catalog offers them
 * all in its Color collections menu and downloads one only when it becomes active. An
 * application bundler splits each into its own chunk; import a collection directly, from
 * `@tweakpad/ui/color-palette/collections/<id>`, to bundle it with the page instead.
 */
export const colorCollectionCatalog: readonly ColorCollectionLoader[] = [
  { id: 'riso', name: 'Riso inks', load: () => import('./riso/index.js') },
  { id: 'colorbrewer', name: 'ColorBrewer', load: () => import('./colorbrewer/index.js') },
  { id: 'nippon', name: 'Nippon Colors', load: () => import('./nippon/index.js') },
  { id: 'sanzo-wada', name: 'Sanzo Wada', load: () => import('./sanzo-wada/index.js') },
  {
    id: 'wes-anderson',
    name: 'Wes Anderson palettes',
    load: () => import('./wes-anderson/index.js'),
  },
  { id: 'le-corbusier', name: 'Le Corbusier', load: () => import('./le-corbusier/index.js') },
  {
    id: 'werner',
    name: "Werner's Nomenclature of Colours",
    load: () => import('./werner/index.js'),
  },
  { id: 'lospec', name: 'Lospec palettes', load: () => import('./lospec/index.js') },
  {
    id: 'nice-color-palettes',
    name: 'Nice Color Palettes',
    load: () => import('./nice-color-palettes/index.js'),
  },
  { id: 'css-named', name: 'CSS named colors', load: () => import('./css-named/index.js') },
];
