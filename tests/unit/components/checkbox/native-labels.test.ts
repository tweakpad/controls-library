import { describe, expect, it } from 'vitest';
import { affectsNativeLabels } from '../../../../src/components/checkbox/native-labels.js';

const element = (localName: string, inLabel = false, containsLabel = false) =>
  ({
    nodeType: 1,
    localName,
    closest: (selector: string) =>
      selector === 'label' && (inLabel || localName === 'label') ? {} : null,
    querySelector: (selector: string) => (selector === 'label' && containsLabel ? {} : null),
  }) as unknown as Element;
const text = (parent: Element) => ({ nodeType: 3, parentElement: parent }) as unknown as Node;
const record = (init: Partial<MutationRecord>) =>
  ({ addedNodes: [], removedNodes: [], ...init }) as unknown as MutationRecord;

describe('native label observation', () => {
  it('ignores text and structure changes outside labels', () => {
    const counter = element('span');
    expect(affectsNativeLabels(record({ type: 'characterData', target: text(counter) }))).toBe(
      false,
    );
    expect(
      affectsNativeLabels(
        record({ type: 'childList', target: counter, addedNodes: [element('div')] as never }),
      ),
    ).toBe(false);
  });

  it('wakes controls for changes inside a label, labels added or removed, and for or id', () => {
    const inside = element('span', true);
    expect(affectsNativeLabels(record({ type: 'characterData', target: text(inside) }))).toBe(true);
    expect(affectsNativeLabels(record({ type: 'childList', target: element('label') }))).toBe(true);
    const host = element('div');
    expect(
      affectsNativeLabels(
        record({ type: 'childList', target: host, addedNodes: [element('label')] as never }),
      ),
    ).toBe(true);
    expect(
      affectsNativeLabels(
        record({
          type: 'childList',
          target: host,
          removedNodes: [element('section', false, true)] as never,
        }),
      ),
    ).toBe(true);
    expect(
      affectsNativeLabels(record({ type: 'attributes', attributeName: 'for', target: host })),
    ).toBe(true);
  });
});
