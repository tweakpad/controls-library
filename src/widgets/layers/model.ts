// The parts of a layer stack that need no DOM: indexing the records, the edits each change makes,
// how several layers move to one drop target, and how the active layer follows the selection.
import type { TreeMove } from '../../foundation/tree/projection.js';
import type { Layer, LayerState, LayerStateValue, LayersCreateId } from './types.js';

export interface LayerEntry<D = unknown> {
  readonly layer: Layer<D>;
  readonly parentId: string | null;
  /** Index among its siblings; 0 is the top. */
  readonly index: number;
  readonly depth: number;
  /** Position in the depth-first order of the whole stack. */
  readonly order: number;
}

/** A read-only index of a stack: entries by id and the depth-first order, top first. */
export class LayerIndex<D = unknown> {
  readonly #entries = new Map<string, LayerEntry<D>>();
  readonly order: readonly string[];

  constructor(readonly layers: readonly Layer<D>[]) {
    const order: string[] = [];
    const visit = (list: readonly Layer<D>[], parentId: string | null, depth: number): void =>
      list.forEach((layer, index) => {
        if (this.#entries.has(layer.id)) return;
        this.#entries.set(layer.id, { layer, parentId, index, depth, order: order.length });
        order.push(layer.id);
        if (layer.children) visit(layer.children, layer.id, depth + 1);
      });
    visit(layers, null, 0);
    this.order = order;
  }

  get(id: string): LayerEntry<D> | undefined {
    return this.#entries.get(id);
  }

  has(id: string): boolean {
    return this.#entries.has(id);
  }

  get ids(): ReadonlySet<string> {
    return new Set(this.#entries.keys());
  }

  /** The children of a group, or the top-level layers for null. */
  children(parentId: string | null): readonly Layer<D>[] {
    if (parentId === null) return this.layers;
    return this.#entries.get(parentId)?.layer.children ?? [];
  }

  /** Ancestor ids, nearest first. */
  ancestors(id: string): string[] {
    const result: string[] = [];
    let parent = this.#entries.get(id)?.parentId ?? null;
    while (parent !== null) {
      result.push(parent);
      parent = this.#entries.get(parent)?.parentId ?? null;
    }
    return result;
  }

  /** Whether `id` is inside the group `ancestorId`, at any depth. */
  isInside(id: string, ancestorId: string): boolean {
    return this.ancestors(id).includes(ancestorId);
  }
}

export function isGroup(layer: Layer): boolean {
  return Array.isArray(layer.children);
}

/** The built-in state every layer has; a layer is enabled unless this state's value is `'false'`. */
export const ENABLED_STATE = 'enabled';

/** A layer's state by name. */
export function layerState(layer: Layer, name: string): LayerState | undefined {
  return layer.states?.find((state) => state.name === name);
}

/** The declared value a state currently has, or undefined when its value is not among them. */
export function currentValue(state: LayerState): LayerStateValue | undefined {
  return state.values.find((entry) => entry.value === state.value);
}

/** The value a press on a state's control proposes: the next one, wrapping around. */
export function nextValue(state: LayerState): string | undefined {
  if (!state.values.length) return undefined;
  const index = state.values.findIndex((entry) => entry.value === state.value);
  return state.values[(index + 1) % state.values.length]!.value;
}

export function isEnabled(layer: Layer): boolean {
  return layerState(layer, ENABLED_STATE)?.value !== 'false';
}

/** Ids dimmed by a current state value that dims, on the layer itself or on a group around it. */
export function dimmedIds<D>(index: LayerIndex<D>): Set<string> {
  const dimmed = new Set<string>();
  for (const id of index.order) {
    const entry = index.get(id)!;
    if (
      (entry.parentId !== null && dimmed.has(entry.parentId)) ||
      entry.layer.states?.some((state) => currentValue(state)?.dims)
    )
      dimmed.add(id);
  }
  return dimmed;
}

/** Existing ids, once each, in stack order, without the ones inside another listed group. */
export function topmostIds<D>(index: LayerIndex<D>, ids: Iterable<string>): string[] {
  const wanted = new Set([...ids].filter((id) => index.has(id)));
  return index.order.filter(
    (id) => wanted.has(id) && !index.ancestors(id).some((ancestor) => wanted.has(ancestor)),
  );
}

/** Existing ids, once each, in stack order. */
export function orderedIds<D>(index: LayerIndex<D>, ids: Iterable<string>): string[] {
  const wanted = new Set(ids);
  return index.order.filter((id) => wanted.has(id));
}

// ── Edits ──────────────────────────────────────────────────────────────────────

/**
 * Rebuilds the stack with each layer passed through `map`; a layer `map` returns unchanged keeps
 * its identity, and so do groups whose children all keep theirs.
 */
function rebuild<D>(
  layers: readonly Layer<D>[],
  map: (layer: Layer<D>, parentId: string | null) => Layer<D> | readonly Layer<D>[] | null,
  parentId: string | null = null,
): Layer<D>[] {
  const result: Layer<D>[] = [];
  for (const layer of layers) {
    let current = layer;
    if (layer.children) {
      const children = rebuild(layer.children, map, layer.id);
      const same =
        children.length === layer.children.length &&
        children.every((child, index) => child === layer.children![index]);
      if (!same) current = { ...layer, children };
    }
    const mapped = map(current, parentId);
    if (mapped === null) continue;
    if (Array.isArray(mapped)) result.push(...(mapped as readonly Layer<D>[]));
    else result.push(mapped as Layer<D>);
  }
  return result;
}

/** Inserts layers into a parent's children at an index (clamped), returning the new stack. */
export function insertLayers<D>(
  layers: readonly Layer<D>[],
  added: readonly Layer<D>[],
  parentId: string | null,
  index: number,
): Layer<D>[] {
  const place = (children: readonly Layer<D>[]): Layer<D>[] => {
    const next = children.slice();
    next.splice(Math.max(0, Math.min(index, next.length)), 0, ...added);
    return next;
  };
  if (parentId === null) return place(layers);
  return rebuild(layers, (layer) =>
    layer.id === parentId ? { ...layer, children: place(layer.children ?? []) } : layer,
  );
}

export function removeLayers<D>(layers: readonly Layer<D>[], ids: Iterable<string>): Layer<D>[] {
  const removed = new Set(ids);
  return rebuild(layers, (layer) => (removed.has(layer.id) ? null : layer));
}

/** Layers in a parent after the moved ones leave it; a move's index counts among these. */
export function remainingSiblings<D>(
  index: LayerIndex<D>,
  parentId: string | null,
  moved: Iterable<string>,
): Layer<D>[] {
  const set = new Set(moved);
  return index.children(parentId).filter((layer) => !set.has(layer.id));
}

/**
 * Moves layers, keeping their stack order, into a parent at an index counted among the parent's
 * layers that stay. Returns null when the target is one of the moved layers or inside one.
 */
export function moveLayers<D>(
  index: LayerIndex<D>,
  ids: readonly string[],
  parentId: string | null,
  at: number,
): Layer<D>[] | null {
  const moving = topmostIds(index, ids);
  if (!moving.length) return null;
  if (parentId !== null) {
    const parent = index.get(parentId);
    if (!parent || !isGroup(parent.layer)) return null;
    if (moving.some((id) => id === parentId || index.isInside(parentId, id))) return null;
  }
  const layers = moving.map((id) => index.get(id)!.layer);
  return insertLayers(removeLayers(index.layers, moving), layers, parentId, at);
}

/**
 * The target of moving several layers where a drag dropped one of them: before the layer the
 * dropped one now precedes, skipping layers that move too, in the dropped layer's new parent.
 */
export function dropLocation<D>(
  index: LayerIndex<D>,
  move: TreeMove,
  ids: readonly string[],
): { parentId: string | null; index: number } {
  const siblings = index.children(move.toParentId).filter((layer) => layer.id !== move.itemId);
  const moving = new Set(ids);
  const before = siblings.slice(move.toIndex).find((layer) => !moving.has(layer.id));
  const remaining = siblings.filter((layer) => !moving.has(layer.id));
  return {
    parentId: move.toParentId,
    index: before ? remaining.indexOf(before) : remaining.length,
  };
}

/**
 * Where the selection goes when it moves one place up (-1) or down (1) within its parent, as a
 * block; null when its layers have different parents or it cannot move further.
 */
export function stepLocation<D>(
  index: LayerIndex<D>,
  ids: readonly string[],
  delta: -1 | 1,
): { parentId: string | null; index: number } | null {
  const moving = topmostIds(index, ids);
  if (!moving.length) return null;
  const parentId = index.get(moving[0]!)!.parentId;
  if (moving.some((id) => index.get(id)!.parentId !== parentId)) return null;
  const siblings = index.children(parentId);
  const set = new Set(moving);
  const remainingBefore = (id: string): number =>
    siblings.slice(0, index.get(id)!.index).filter((layer) => !set.has(layer.id)).length;
  // The block passes the nearest layer that stays: up from its last layer, down from its first.
  const target =
    delta < 0 ? remainingBefore(moving[moving.length - 1]!) - 1 : remainingBefore(moving[0]!) + 1;
  if (target < 0 || target > siblings.length - moving.length) return null;
  return { parentId, index: target };
}

/** Renames a layer, or sets a state of several. */
export function updateLayers<D>(
  layers: readonly Layer<D>[],
  ids: Iterable<string>,
  update: (layer: Layer<D>) => Layer<D>,
): Layer<D>[] {
  const targets = new Set(ids);
  return rebuild(layers, (layer) => (targets.has(layer.id) ? update(layer) : layer));
}

/**
 * The layer with a state set to a value. Setting `enabled` on a layer without that state adds it;
 * any other state the layer does not have is left alone.
 */
export function withState<D>(layer: Layer<D>, name: string, value: string): Layer<D> {
  const states = layer.states ?? [];
  if (!states.some((state) => state.name === name)) {
    if (name !== ENABLED_STATE) return layer;
    return {
      ...layer,
      states: [
        ...states,
        { name, label: name, value, values: [{ value: 'true' }, { value: 'false' }] },
      ],
    };
  }
  return {
    ...layer,
    states: states.map((state) => (state.name === name ? { ...state, value } : state)),
  };
}

/** Wraps layers in a group placed where the first of them was, in their stack order. */
export function groupLayers<D>(
  index: LayerIndex<D>,
  ids: readonly string[],
  group: Layer<D>,
): Layer<D>[] | null {
  const moving = topmostIds(index, ids);
  if (!moving.length) return null;
  const first = index.get(moving[0]!)!;
  const children = moving.map((id) => index.get(id)!.layer);
  const at = remainingSiblings(index, first.parentId, moving).filter(
    (layer) => index.get(layer.id)!.index < first.index,
  ).length;
  return insertLayers(
    removeLayers(index.layers, moving),
    [{ ...group, children: [...(group.children ?? []), ...children] }],
    first.parentId,
    at,
  );
}

/** Replaces each listed group by its children, in its place. */
export function ungroupLayers<D>(index: LayerIndex<D>, ids: readonly string[]): Layer<D>[] | null {
  const groups = new Set(ids.filter((id) => index.get(id) && isGroup(index.get(id)!.layer)));
  if (!groups.size) return null;
  return rebuild(index.layers, (layer) => (groups.has(layer.id) ? (layer.children ?? []) : layer));
}

/** The default ids: `<id>-copy`, `<id>-copy-2`… for a copy, `group-1`, `group-2`… for a group. */
export const defaultCreateId: LayersCreateId = (source, taken) => {
  const base = source ? `${source.id}-copy` : 'group';
  let n = 1;
  let id = source ? base : `${base}-${n}`;
  while (taken.has(id)) id = `${base}-${++n}`;
  return id;
};

/** Deep copies with fresh ids for the layer and everything inside it. */
export function copyLayer<D>(
  layer: Layer<D>,
  createId: LayersCreateId<D>,
  taken: { has(id: string): boolean; add(id: string): unknown },
  suffix: string,
  top = true,
): Layer<D> {
  const id = createId(layer, taken);
  taken.add(id);
  return {
    ...layer,
    id,
    label: top && suffix ? `${layer.label} ${suffix}` : layer.label,
    ...(layer.children
      ? {
          children: layer.children.map((child) => copyLayer(child, createId, taken, suffix, false)),
        }
      : {}),
  };
}

/** Inserts each copy right above its source. */
export function placeCopies<D>(
  layers: readonly Layer<D>[],
  copies: ReadonlyMap<string, Layer<D>>,
): Layer<D>[] {
  return rebuild(layers, (layer) => {
    const copy = copies.get(layer.id);
    return copy ? [copy, layer] : layer;
  });
}

// ── Selection and the active layer ────────────────────────────────────────────

/** The selected layer nearest to `id` in stack order, preferring the one above on a tie. */
function nearest<D>(
  index: LayerIndex<D>,
  id: string | null,
  among: readonly string[],
): string | null {
  const ordered = orderedIds(index, among);
  if (!ordered.length) return null;
  const from = id === null ? undefined : index.get(id)?.order;
  if (from === undefined) return ordered[0]!;
  let best = ordered[0]!;
  let distance = Infinity;
  for (const candidate of ordered) {
    const gap = Math.abs(index.get(candidate)!.order - from);
    if (gap < distance) {
      best = candidate;
      distance = gap;
    }
  }
  return best;
}

/**
 * The active layer after a selection change: the layer the press or key acted on when it is
 * selected, else the active layer when it stays selected, else the selected layer nearest to it.
 */
export function activeAfterSelection<D>(
  index: LayerIndex<D>,
  value: readonly string[],
  active: string | null,
  item: string | null,
): string | null {
  if (!value.length) return null;
  if (item !== null && value.includes(item)) return item;
  if (active !== null && value.includes(active)) return active;
  return nearest(index, item ?? active, value);
}

/**
 * The layer that becomes active when the active layer is removed: the one that takes its place,
 * else the one above it, else its group; null when nothing is left.
 */
export function activeAfterRemoval<D>(
  index: LayerIndex<D>,
  removed: readonly string[],
  active: string | null,
): string | null {
  if (active === null || !index.has(active)) return null;
  const gone = new Set(removed);
  let id = active;
  // The removed layer whose place matters is the outermost removed group around the active one.
  for (const ancestor of index.ancestors(active)) if (gone.has(ancestor)) id = ancestor;
  if (!gone.has(id)) return active;
  let entry = index.get(id)!;
  for (;;) {
    const siblings = index.children(entry.parentId);
    const below = siblings.slice(entry.index + 1).find((layer) => !gone.has(layer.id));
    if (below) return below.id;
    const above = siblings
      .slice(0, entry.index)
      .reverse()
      .find((layer) => !gone.has(layer.id));
    if (above) return above.id;
    if (entry.parentId === null) return null;
    if (!gone.has(entry.parentId)) return entry.parentId;
    entry = index.get(entry.parentId)!;
  }
}

/** Drops ids that are not in the stack, keeping the order given. */
export function existingIds<D>(index: LayerIndex<D>, ids: readonly string[]): string[] {
  return [...new Set(ids)].filter((id) => index.has(id));
}
