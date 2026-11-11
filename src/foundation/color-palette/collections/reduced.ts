import type { ColorCollection } from '../types.js';

/**
 * The built-in reduced collection: nine hues in a light and a strong step and six neutrals.
 */
export const reducedColorCollection: ColorCollection = {
  id: 'reduced',
  name: 'Reduced',
  groups: [
    { id: 'light', name: 'Light' },
    { id: 'strong', name: 'Strong' },
    { id: 'neutral', name: 'Neutral' },
  ],
  colors: [
    { value: '#ffa39b', name: 'Light red', group: 'light' },
    { value: '#fdb081', name: 'Light orange', group: 'light' },
    { value: '#d9c473', name: 'Light yellow', group: 'light' },
    { value: '#93d7a5', name: 'Light green', group: 'light' },
    { value: '#8cd4c8', name: 'Light teal', group: 'light' },
    { value: '#96c6ff', name: 'Light blue', group: 'light' },
    { value: '#b5bcff', name: 'Light indigo', group: 'light' },
    { value: '#d3b0ff', name: 'Light violet', group: 'light' },
    { value: '#ffa2ba', name: 'Light rose', group: 'light' },
    { value: '#cc272f', name: 'Red', group: 'strong' },
    { value: '#b84c00', name: 'Orange', group: 'strong' },
    { value: '#8a6f00', name: 'Yellow', group: 'strong' },
    { value: '#008a41', name: 'Green', group: 'strong' },
    { value: '#008777', name: 'Teal', group: 'strong' },
    { value: '#1e6dd8', name: 'Blue', group: 'strong' },
    { value: '#615cdc', name: 'Indigo', group: 'strong' },
    { value: '#8949d0', name: 'Violet', group: 'strong' },
    { value: '#c42c63', name: 'Rose', group: 'strong' },
    { value: '#ffffff', name: 'White', group: 'neutral' },
    { value: '#d9dee6', name: 'Light gray', group: 'neutral' },
    { value: '#a3a8af', name: 'Silver', group: 'neutral' },
    { value: '#6d7279', name: 'Gray', group: 'neutral' },
    { value: '#3c4046', name: 'Charcoal', group: 'neutral' },
    { value: '#000000', name: 'Black', group: 'neutral' },
  ],
};
