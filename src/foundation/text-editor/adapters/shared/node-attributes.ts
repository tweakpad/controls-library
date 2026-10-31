/**
 * The `data-` attributes of a custom node's element, which every engine adapter keeps in step with
 * the node's values as the HTML profile writes them (`customNodeAttributes`).
 */

/**
 * Sets the attributes of an element to the given list and removes the `data-` ones it lacks. A
 * name listed twice keeps its last value; an attribute that already has its value is not written.
 */
export function writeDataAttributes(
  element: HTMLElement,
  attributes: readonly (readonly [string, string])[],
): void {
  const wanted = new Map(attributes);
  for (const name of element.getAttributeNames())
    if (name.startsWith('data-') && !wanted.has(name)) element.removeAttribute(name);
  for (const [name, value] of wanted)
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}
