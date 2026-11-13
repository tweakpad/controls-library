import { describe, expect, it } from 'vitest';
import {
  LayerIndex,
  activeAfterRemoval,
  activeAfterSelection,
  copyLayer,
  defaultCreateId,
  dropLocation,
  groupLayers,
  insertLayers,
  moveLayers,
  dimmedIds,
  isEnabled,
  nextValue,
  placeCopies,
  removeLayers,
  stepLocation,
  topmostIds,
  ungroupLayers,
  updateLayers,
  withState,
} from '../../../../src/widgets/layers/model.js';
import type { Layer, LayerState } from '../../../../src/widgets/layers/types.js';

const visibility = (value: string): LayerState => ({
  name: 'visibility',
  label: 'Visibility',
  value,
  values: [{ value: 'visible' }, { value: 'hidden', dims: true }, { value: 'solo' }],
});
const stack: Layer[] = [
  { id: 'title', label: 'Title' },
  {
    id: 'scene',
    label: 'Scene',
    children: [
      { id: 'sun', label: 'Sun' },
      { id: 'fog', label: 'Fog', states: [visibility('hidden')] },
      { id: 'trees', label: 'Trees' },
    ],
  },
  { id: 'background', label: 'Background' },
];
const index = new LayerIndex(stack);
const names = (layers: readonly Layer[]): unknown =>
  layers.map((layer) => (layer.children ? [layer.id, names(layer.children)] : layer.id));

describe('LayerIndex', () => {
  it('orders the stack depth first, top first', () => {
    expect(index.order).toEqual(['title', 'scene', 'sun', 'fog', 'trees', 'background']);
    expect(index.get('fog')).toMatchObject({ parentId: 'scene', index: 1, depth: 1 });
    expect(index.ancestors('fog')).toEqual(['scene']);
    expect(index.isInside('trees', 'scene')).toBe(true);
  });

  it('keeps the selection in stack order without layers inside a listed group', () => {
    expect(topmostIds(index, ['background', 'sun', 'scene', 'missing'])).toEqual([
      'scene',
      'background',
    ]);
  });
});

describe('states', () => {
  it('dims a layer whose current value dims, and everything inside a dimmed group', () => {
    expect([...dimmedIds(index)]).toEqual(['fog']);
    const scene = updateLayers(stack, ['scene'], (l) => ({ ...l, states: [visibility('hidden')] }));
    expect([...dimmedIds(new LayerIndex(scene))]).toEqual(['scene', 'sun', 'fog', 'trees']);
  });

  it('steps through any number of values and sets only states a layer has', () => {
    expect(nextValue(visibility('visible'))).toBe('hidden');
    expect(nextValue(visibility('solo'))).toBe('visible');
    const fog = index.get('fog')!.layer;
    expect(withState(fog, 'visibility', 'solo').states![0]!.value).toBe('solo');
    expect(withState(fog, 'locked', 'locked')).toBe(fog);
  });

  it('keeps every layer enabled unless its enabled state is false', () => {
    const title = index.get('title')!.layer;
    expect(isEnabled(title)).toBe(true);
    const frozen = withState(title, 'enabled', 'false');
    expect(isEnabled(frozen)).toBe(false);
    expect(isEnabled(withState(frozen, 'enabled', 'true'))).toBe(true);
  });
});

describe('edits', () => {
  it('inserts into a group and removes at any depth, keeping untouched identities', () => {
    const added = insertLayers(stack, [{ id: 'rain', label: 'Rain' }], 'scene', 1);
    expect(names(added)).toEqual([
      'title',
      ['scene', ['sun', 'rain', 'fog', 'trees']],
      'background',
    ]);
    expect(added[0]).toBe(stack[0]);
    expect(names(removeLayers(stack, ['fog', 'title']))).toEqual([
      ['scene', ['sun', 'trees']],
      'background',
    ]);
  });

  it('moves several layers as a block, counting the index among the layers that stay', () => {
    const moved = moveLayers(index, ['background', 'sun'], 'scene', 2);
    expect(names(moved!)).toEqual(['title', ['scene', ['fog', 'trees', 'sun', 'background']]]);
    expect(moveLayers(index, ['scene'], 'scene', 0)).toBeNull();
    expect(moveLayers(index, ['title'], 'sun', 0)).toBeNull();
  });

  it('turns a drag of one selected layer into a target for the whole selection', () => {
    // Fog dragged to the top level, before Background; Sun moves with it.
    const target = dropLocation(
      index,
      { itemId: 'fog', fromParentId: 'scene', fromIndex: 1, toParentId: null, toIndex: 2 },
      ['sun', 'fog'],
    );
    expect(target).toEqual({ parentId: null, index: 2 });
    expect(names(moveLayers(index, ['sun', 'fog'], target.parentId, target.index)!)).toEqual([
      'title',
      ['scene', ['trees']],
      'sun',
      'fog',
      'background',
    ]);
  });

  it('steps the selection one place within its parent', () => {
    expect(stepLocation(index, ['fog'], -1)).toEqual({ parentId: 'scene', index: 0 });
    expect(stepLocation(index, ['sun'], -1)).toBeNull();
    expect(stepLocation(index, ['fog', 'trees'], 1)).toBeNull();
    expect(stepLocation(index, ['sun', 'trees'], 1)).toEqual({ parentId: 'scene', index: 1 });
    expect(stepLocation(index, ['sun', 'title'], 1)).toBeNull();
  });

  it('groups layers where the first of them was, and ungroups in place', () => {
    const grouped = groupLayers(index, ['background', 'title'], { id: 'g', label: 'Group' });
    expect(names(grouped!)).toEqual([
      ['g', ['title', 'background']],
      ['scene', ['sun', 'fog', 'trees']],
    ]);
    expect(names(ungroupLayers(index, ['scene'])!)).toEqual([
      'title',
      'sun',
      'fog',
      'trees',
      'background',
    ]);
  });

  it('copies a group with fresh ids and places each copy above its source', () => {
    const taken = new Set(index.ids);
    const copy = copyLayer(index.get('scene')!.layer, defaultCreateId, taken, 'copy');
    expect(copy.id).toBe('scene-copy');
    expect(copy.label).toBe('Scene copy');
    expect(copy.children!.map((child) => [child.id, child.label])).toEqual([
      ['sun-copy', 'Sun'],
      ['fog-copy', 'Fog'],
      ['trees-copy', 'Trees'],
    ]);
    expect(defaultCreateId(index.get('sun')!.layer, new Set(['sun-copy']))).toBe('sun-copy-2');
    expect(defaultCreateId(null, new Set(['group-1']))).toBe('group-2');
    expect((names(placeCopies(stack, new Map([['title', copy]]))) as unknown[])[0]).toEqual([
      'scene-copy',
      ['sun-copy', 'fog-copy', 'trees-copy'],
    ]);
  });
});

describe('the active layer', () => {
  it('follows the acted-on layer, else stays, else moves to the nearest selected layer', () => {
    expect(activeAfterSelection(index, ['sun', 'fog'], 'sun', 'fog')).toBe('fog');
    expect(activeAfterSelection(index, ['sun', 'fog'], 'sun', null)).toBe('sun');
    // Command-press removes the active Fog: Trees and Sun are as near; the one above wins.
    expect(activeAfterSelection(index, ['sun', 'trees'], 'fog', 'fog')).toBe('sun');
    expect(activeAfterSelection(index, ['background'], 'fog', 'fog')).toBe('background');
    expect(activeAfterSelection(index, [], 'fog', 'fog')).toBeNull();
    expect(activeAfterSelection(index, ['trees', 'title'], null, null)).toBe('title');
  });

  it('moves to the layer that takes the removed one place, else above, else its group', () => {
    expect(activeAfterRemoval(index, ['fog'], 'fog')).toBe('trees');
    expect(activeAfterRemoval(index, ['trees'], 'trees')).toBe('fog');
    expect(activeAfterRemoval(index, ['sun', 'fog', 'trees'], 'fog')).toBe('scene');
    expect(activeAfterRemoval(index, ['scene'], 'fog')).toBe('background');
    expect(activeAfterRemoval(index, ['title'], 'fog')).toBe('fog');
    expect(activeAfterRemoval(new LayerIndex([stack[0]!]), ['title'], 'title')).toBeNull();
  });
});
