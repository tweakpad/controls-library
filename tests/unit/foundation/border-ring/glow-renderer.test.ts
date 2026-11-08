import { describe, expect, it } from 'vitest';
import { GlowRenderer } from '../../../../src/foundation/border-ring/glow-renderer.js';

class Owner extends EventTarget {
  devicePixelRatio = 2;
  document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  frames = new Map<number, FrameRequestCallback>();
  next = 0;
  requestAnimationFrame(callback: FrameRequestCallback) {
    const id = ++this.next;
    this.frames.set(id, callback);
    return id;
  }
  cancelAnimationFrame(id: number) {
    this.frames.delete(id);
  }
  flush() {
    const frames = [...this.frames.values()];
    this.frames.clear();
    for (const frame of frames) frame(0);
  }
}

function setup() {
  const owner = new Owner();
  const context = {
    setTransform() {},
    clearRect() {},
    fillRect() {},
    getImageData: () => ({ data: [0, 0, 0, 0] }),
  };
  const document = { defaultView: owner, createElement: () => ({ getContext: () => context }) };
  class Canvas extends EventTarget {
    ownerDocument = document;
    width = 300;
    height = 150;
    offsetWidth = 100;
    getBoundingClientRect() {
      return { width: 100, height: 50 };
    }
    getContext() {
      return context;
    }
  }
  const line = new Canvas();
  const bloom = new Canvas();
  const renderer = new GlowRenderer(
    line as unknown as HTMLCanvasElement,
    bloom as unknown as HTMLCanvasElement,
  );
  renderer.connect();
  const box = {
    width: 100,
    height: 50,
    radii: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ] as const,
  };
  renderer.setGeometry(box, 1, 12, 25);
  const frame = { light() {}, rotation: 0, level: 1 };
  const look = { colors: '', core: '', angle: 0, intensity: 1, fill: 0 };
  const sizes = () => [line.width, line.height, bloom.width, bloom.height];
  return { owner, renderer, box, frame, look, sizes };
}

describe('GlowRenderer backing stores', () => {
  it('allocates only for an eligible drawable frame and releases both canvases', () => {
    const { owner, renderer, box, frame, look, sizes } = setup();
    owner.flush();
    expect(sizes()).toEqual([0, 0, 0, 0]);
    renderer.paint(frame, look);
    expect(sizes()).toEqual([0, 0, 0, 0]);
    renderer.setEligible(true);
    renderer.paint(null, null);
    renderer.paint({ ...frame, level: 0 }, look);
    expect(sizes()).toEqual([0, 0, 0, 0]);
    renderer.paint(frame, look);
    expect(sizes()).toEqual([200, 100, 200, 100]);
    renderer.setEligible(false);
    renderer.setGeometry(box, 2, 20, 40);
    owner.flush();
    renderer.paint(frame, look);
    expect(sizes()).toEqual([0, 0, 0, 0]);
    renderer.setEligible(true);
    renderer.paint(frame, look);
    expect(sizes()).toEqual([200, 100, 200, 100]);
    renderer.paint(null, null);
    expect(sizes()).toEqual([200, 100, 200, 100]);
    renderer.disconnect();
    owner.flush();
    expect(sizes()).toEqual([0, 0, 0, 0]);
  });
});
