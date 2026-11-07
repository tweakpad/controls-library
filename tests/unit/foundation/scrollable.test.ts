import { describe, expect, it } from 'vitest';
import { Scrollable } from '../../../src/foundation/scrollable.js';

class Base {
  static properties = { label: { type: String } };
  label = 'retained';
}

describe('scoped scrollable contract', () => {
  it('adds the default and metadata without mutating the base or its other consumers', () => {
    const Mixed = Scrollable(Base as unknown as Parameters<typeof Scrollable>[0]);
    class ScrollOwner extends Mixed {}
    class OrdinaryControl extends Base {}
    const owner = new ScrollOwner();
    expect(owner.scrollEdgeFade).toBe(false);
    expect(owner).toHaveProperty('label', 'retained');
    owner.scrollEdgeFade = true;
    expect(owner.scrollEdgeFade).toBe(true);
    expect(new ScrollOwner().scrollEdgeFade).toBe(false);
    expect(new OrdinaryControl()).not.toHaveProperty('scrollEdgeFade');
    expect(Base.properties).not.toHaveProperty('scrollEdgeFade');
    expect(Mixed.properties.scrollEdgeFade).toMatchObject({
      type: Boolean,
      attribute: 'scroll-edge-fade',
      reflect: true,
    });
  });
});
