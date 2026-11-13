// The layers a stack declares as `tp-layer` children: reading them as records, and writing the
// stack's records back into them so the markup always shows the current stack.
import type { IconDefinition } from '../../icons/types.js';
import type { Layer, LayerState, LayerStateValue } from './types.js';

const LAYER = 'tp-layer';
const STATE = 'tp-layer-state';
const VALUE = 'tp-layer-state-value';
const ICON = 'tp-icon';
/** A layer's own permissions and their attributes. */
const FLAGS = [
  ['canRename', 'can-rename'],
  ['canRemove', 'can-remove'],
] as const;

type IconElement = HTMLElement & { icon?: IconDefinition };

const childrenOf = (element: Element, tag: string): HTMLElement[] =>
  [...element.children].filter((child): child is HTMLElement => child.localName === tag);

const iconOf = (element: Element): IconDefinition | undefined =>
  (childrenOf(element, ICON)[0] as IconElement | undefined)?.icon;

/** Whether an element declares any layer. */
export function declaresLayers(host: Element): boolean {
  return childrenOf(host, LAYER).length > 0;
}

/**
 * The records the `tp-layer` children declare. A layer without an `id` gets one from `createId`,
 * written to its element so the next read finds the same layer.
 */
export function readLayers(host: Element, createId: () => string): Layer[] {
  const read = (element: HTMLElement): Layer => {
    if (!element.id) element.id = createId();
    const layer: Layer = { id: element.id, label: element.getAttribute('label') ?? '' };
    const icon = iconOf(element);
    if (icon) layer.icon = icon;
    const members = childrenOf(element, LAYER);
    if (members.length || element.hasAttribute('group')) layer.children = members.map(read);
    const states = childrenOf(element, STATE).map(readState);
    if (states.length) layer.states = states;
    for (const [flag, attribute] of FLAGS) {
      const value = element.getAttribute(attribute);
      if (value !== null) layer[flag] = value !== 'false';
    }
    const data = (element as HTMLElement & { data?: unknown }).data;
    if (data !== undefined) layer.data = data;
    return layer;
  };
  return childrenOf(host, LAYER).map(read);
}

function readState(element: HTMLElement): LayerState {
  const state: LayerState = {
    name: element.getAttribute('name') ?? '',
    label: element.getAttribute('label') ?? '',
    value: element.getAttribute('value') ?? '',
    values: childrenOf(element, VALUE).map(readValue),
  };
  if (element.getAttribute('scope') === 'selection') state.scope = 'selection';
  return state;
}

function readValue(element: HTMLElement): LayerStateValue {
  const value: LayerStateValue = { value: element.getAttribute('value') ?? '' };
  const label = element.getAttribute('label');
  if (label) value.label = label;
  const icon = iconOf(element);
  if (icon) value.icon = icon;
  if (element.getAttribute('display') === 'hover') value.display = 'hover';
  if (element.hasAttribute('dims')) value.dims = true;
  return value;
}

/** Whether two stacks declare the same layers, states, icons and data. */
export function sameLayers(a: readonly Layer[], b: readonly Layer[]): boolean {
  const sameValue = (x: LayerStateValue, y: LayerStateValue): boolean =>
    x.value === y.value &&
    (x.label ?? '') === (y.label ?? '') &&
    x.icon === y.icon &&
    (x.display ?? 'always') === (y.display ?? 'always') &&
    Boolean(x.dims) === Boolean(y.dims);
  const sameState = (x: LayerState, y: LayerState): boolean =>
    x.name === y.name &&
    x.label === y.label &&
    x.value === y.value &&
    (x.scope ?? 'layer') === (y.scope ?? 'layer') &&
    x.values.length === y.values.length &&
    x.values.every((value, index) => sameValue(value, y.values[index]!));
  const same = (x: Layer, y: Layer): boolean =>
    x.id === y.id &&
    x.canRename === y.canRename &&
    x.canRemove === y.canRemove &&
    x.label === y.label &&
    x.icon === y.icon &&
    x.data === y.data &&
    Array.isArray(x.children) === Array.isArray(y.children) &&
    sameLayers(x.children ?? [], y.children ?? []) &&
    (x.states ?? []).length === (y.states ?? []).length &&
    (x.states ?? []).every((state, index) => sameState(state, y.states![index]!));
  return a.length === b.length && a.every((layer, index) => same(layer, b[index]!));
}

// ── Writing ────────────────────────────────────────────────────────────────────

function setAttribute(element: Element, name: string, value: string | null): void {
  if (value === null) element.removeAttribute(name);
  else if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

/** Keeps one `tp-icon` child showing `icon`, first among the children, or none. */
function writeIcon(element: Element, icon: IconDefinition | undefined): void {
  const existing = childrenOf(element, ICON);
  for (const extra of existing.slice(1)) extra.remove();
  if (!icon) {
    existing[0]?.remove();
    return;
  }
  const target = (existing[0] ?? element.ownerDocument.createElement(ICON)) as IconElement;
  if (target.icon !== icon) target.icon = icon;
  if (element.firstElementChild !== target) element.prepend(target);
}

/** Places `elements` in order among the parent's children of the same tag, after the others. */
function order(parent: Element, tag: string, elements: readonly Element[]): void {
  const current = childrenOf(parent, tag);
  if (current.length === elements.length && current.every((element, i) => element === elements[i]))
    return;
  for (const element of elements) parent.append(element);
}

function writeValue(element: HTMLElement, value: LayerStateValue): void {
  setAttribute(element, 'value', value.value);
  setAttribute(element, 'label', value.label ?? null);
  setAttribute(element, 'display', value.display === 'hover' ? 'hover' : null);
  setAttribute(element, 'dims', value.dims ? '' : null);
  writeIcon(element, value.icon);
}

function writeState(element: HTMLElement, state: LayerState): void {
  setAttribute(element, 'name', state.name);
  setAttribute(element, 'label', state.label);
  setAttribute(element, 'value', state.value);
  setAttribute(element, 'scope', state.scope === 'selection' ? 'selection' : null);
  const existing = childrenOf(element, VALUE);
  const used = new Set<Element>();
  const values = state.values.map((value) => {
    const target =
      existing.find(
        (candidate) => !used.has(candidate) && candidate.getAttribute('value') === value.value,
      ) ?? element.ownerDocument.createElement(VALUE);
    used.add(target);
    writeValue(target, value);
    return target;
  });
  for (const extra of existing) if (!used.has(extra)) extra.remove();
  order(element, VALUE, values);
}

function writeLayer(element: HTMLElement, layer: Layer, all: Map<string, HTMLElement>): void {
  setAttribute(element, 'label', layer.label);
  setAttribute(
    element,
    'group',
    Array.isArray(layer.children) && layer.children.length === 0 ? '' : null,
  );
  for (const [flag, attribute] of FLAGS)
    setAttribute(element, attribute, layer[flag] === undefined ? null : layer[flag] ? '' : 'false');
  const holder = element as HTMLElement & { data?: unknown };
  if (holder.data !== layer.data) holder.data = layer.data;
  writeIcon(element, layer.icon);
  const existing = childrenOf(element, STATE);
  const used = new Set<Element>();
  const states = (layer.states ?? []).map((state) => {
    const target =
      existing.find(
        (candidate) => !used.has(candidate) && candidate.getAttribute('name') === state.name,
      ) ?? element.ownerDocument.createElement(STATE);
    used.add(target);
    writeState(target, state);
    return target;
  });
  for (const extra of existing) if (!used.has(extra)) extra.remove();
  order(element, STATE, states);
  writeMembers(element, layer.children ?? [], all);
}

function writeMembers(parent: Element, layers: readonly Layer[], all: Map<string, HTMLElement>) {
  const elements = layers.map((layer) => {
    const element = all.get(layer.id) ?? parent.ownerDocument.createElement(LAYER);
    all.delete(layer.id);
    if (element.id !== layer.id) element.id = layer.id;
    writeLayer(element, layer, all);
    return element;
  });
  order(parent, LAYER, elements);
}

/**
 * Mirrors records into the host's `tp-layer` children: a layer keeps its element wherever it
 * moves, new layers get new elements, and the elements of removed layers are removed.
 */
export function writeLayers(host: Element, layers: readonly Layer[]): void {
  const all = new Map<string, HTMLElement>();
  for (const element of host.querySelectorAll<HTMLElement>(LAYER))
    if (element.id && !all.has(element.id)) all.set(element.id, element);
  writeMembers(host, layers, all);
  for (const element of all.values()) element.remove();
}
