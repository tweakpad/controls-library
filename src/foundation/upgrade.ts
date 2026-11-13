// Owners that work through their members' API must not touch a member before its definition has
// upgraded it: until then it is a plain element, without the member's properties or methods.
// Elements are defined one by one when registration is per component, so a member can upgrade
// after its owner's first updates.

/** Whether `element` is a built-in element, or a custom element its definition has upgraded. */
export function isUpgraded(element: Element): boolean {
  const name = element.localName;
  if (!name?.includes('-')) return true;
  const registry = element.ownerDocument?.defaultView?.customElements;
  // Without a registry, nothing can upgrade the element later.
  if (!registry) return true;
  const definition = registry.get(name);
  return !!definition && element instanceof definition;
}

const waiting = new WeakMap<object, Set<string>>();

/**
 * The members of `elements` that are upgraded. For the others, `resync` runs once their
 * definitions exist, so the owner reads its members again; asking again for a tag that is still
 * pending adds nothing.
 */
export function upgradedMembers<T extends Element>(elements: Iterable<T>, resync: () => void): T[] {
  const upgraded: T[] = [];
  for (const element of elements) {
    if (isUpgraded(element)) {
      upgraded.push(element);
      continue;
    }
    const registry = element.ownerDocument!.defaultView!.customElements;
    let tags = waiting.get(resync);
    if (!tags) waiting.set(resync, (tags = new Set()));
    const name = element.localName;
    if (tags.has(name)) continue;
    tags.add(name);
    void registry.whenDefined(name).then(() => {
      tags.delete(name);
      resync();
    });
  }
  return upgraded;
}
