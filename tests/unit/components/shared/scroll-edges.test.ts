import { describe, expect, it, vi } from 'vitest';
import { NativeScrollEdges } from '../../../../src/components/shared/scroll-edges.js';

describe('scroll-edge opt-in', () => {
  it('does not access the document or measure viewports while disabled', () => {
    const viewports = vi.fn(() => []);
    const host = {
      addController: vi.fn(),
      hasAttribute: () => false,
      get ownerDocument(): Document {
        throw new Error('Disabled fades must not allocate document resources');
      },
    } as unknown as ConstructorParameters<typeof NativeScrollEdges>[0];
    const edges = new NativeScrollEdges(host, { viewports });
    edges.hostConnected();
    edges.hostUpdated();
    edges.invalidateContent();
    edges.schedule();
    expect(viewports).not.toHaveBeenCalled();
  });

  it('only starts connection work when the opt-in attribute is present', () => {
    let enabled = false;
    const documentRead = vi.fn(() => ({ defaultView: null }));
    const host = {
      addController: vi.fn(),
      hasAttribute: () => enabled,
      get ownerDocument() {
        return documentRead();
      },
    } as unknown as ConstructorParameters<typeof NativeScrollEdges>[0];
    const edges = new NativeScrollEdges(host, { viewports: () => [] });
    edges.hostConnected();
    expect(documentRead).not.toHaveBeenCalled();
    enabled = true;
    edges.hostUpdated();
    expect(documentRead).toHaveBeenCalledOnce();
  });
});
