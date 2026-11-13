// Native `<label>` association for form controls: one observer per tree, which wakes its
// controls only for changes that can alter which labels they have or what those labels say.

type Notify = () => void;
interface Registry {
  readonly observer: MutationObserver;
  readonly subscribers: Set<Notify>;
}
const registries = new WeakMap<Node, Registry>();

const isLabel = (node: Node): boolean =>
  node.nodeType === 1 &&
  ((node as Element).localName === 'label' || !!(node as Element).querySelector('label'));

/** Whether a mutation can change a native label's association or text in its tree. */
export function affectsNativeLabels(record: MutationRecord): boolean {
  if (record.type === 'attributes') return true;
  const parent =
    record.target.nodeType === 1 ? (record.target as Element) : record.target.parentElement;
  if (parent?.closest('label')) return true;
  if (record.type !== 'childList') return false;
  for (const node of record.addedNodes) if (isLabel(node)) return true;
  for (const node of record.removedNodes) if (isLabel(node)) return true;
  return false;
}

/**
 * Calls `notify` when a label in `root` may have changed: a `for` or `id` attribute, a label added
 * or removed, or a change inside a label. Every control in a tree shares one observer, and text or
 * structure changes outside labels wake none of them.
 */
export function observeNativeLabels(root: Node, notify: Notify): () => void {
  const view = (root.ownerDocument ?? (root as Document)).defaultView;
  if (!view?.MutationObserver) return () => {};
  let registry = registries.get(root);
  if (!registry) {
    const subscribers = new Set<Notify>();
    const observer = new view.MutationObserver((records) => {
      if (!records.some(affectsNativeLabels)) return;
      for (const subscriber of [...subscribers]) subscriber();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['for', 'id'],
    });
    registries.set(root, (registry = { observer, subscribers }));
  }
  const current = registry;
  current.subscribers.add(notify);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    current.subscribers.delete(notify);
    if (current.subscribers.size) return;
    current.observer.disconnect();
    registries.delete(root);
  };
}
