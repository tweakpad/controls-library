import { describe, it, expect } from 'vitest';
import { createPlotScheduler } from '../../../../src/widgets/plot/scheduler.js';
import { createPlotSampler } from '../../../../src/widgets/plot/sampler.js';
import { createPlotStream } from '../../../../src/widgets/plot/stream.js';
class Owner extends EventTarget {
  time = 0;
  next = 0;
  document = Object.assign(new EventTarget(), { hidden: false });
  performance = { now: () => this.time };
  frames = new Map<number, (t: number) => void>();
  timers = new Map<number, { at: number; run: () => void }>();
  requestAnimationFrame = (run: (t: number) => void) => {
    const id = ++this.next;
    this.frames.set(id, run);
    return id;
  };
  cancelAnimationFrame = (id: number) => {
    this.frames.delete(id);
  };
  setTimeout = (run: () => void, delay: number) => {
    const id = ++this.next;
    this.timers.set(id, { at: this.time + delay, run });
    return id;
  };
  clearTimeout = (id: number) => {
    this.timers.delete(id);
  };
  flush(time: number) {
    this.time = time;
    for (const [id, timer] of [...this.timers])
      if (timer.at <= time) {
        this.timers.delete(id);
        timer.run();
      }
    const frames = [...this.frames.values()];
    this.frames.clear();
    for (const run of frames) run(time);
  }
  get view() {
    return this as unknown as Window;
  }
}
describe('Plot scheduling', () => {
  it('coalesces dirtiness, sleeps until deadlines and cancels clean/disposed jobs', () => {
    const owner = new Owner(),
      s = createPlotScheduler({ owner: owner.view });
    let paints = 0;
    const h = s.register({ minimumInterval: 100, paint: () => paints++ });
    h.invalidate();
    h.invalidate();
    expect(owner.frames.size).toBe(1);
    owner.flush(0);
    expect(paints).toBe(1);
    expect(owner.frames.size + owner.timers.size).toBe(0);
    h.invalidate();
    expect(owner.frames.size).toBe(0);
    owner.flush(90);
    expect(paints).toBe(1);
    owner.flush(100);
    expect(paints).toBe(2);
    h.invalidate();
    h.dispose();
    expect(owner.frames.size + owner.timers.size).toBe(0);
    s.dispose();
  });
  it('rotates due jobs fairly and preserves dirty work through hidden/suspended states', () => {
    const owner = new Owner(),
      s = createPlotScheduler({ owner: owner.view, maxPlotsPerFrame: 1 });
    const paints: number[] = [];
    const handles = [0, 1, 2].map((n) =>
      s.register({ minimumInterval: 0, paint: () => paints.push(n) }),
    );
    handles.forEach((h) => h.invalidate());
    owner.flush(0);
    owner.flush(16);
    owner.flush(32);
    expect(paints).toEqual([0, 1, 2]);
    owner.document.hidden = true;
    owner.document.dispatchEvent(new Event('visibilitychange'));
    handles[0]!.invalidate();
    expect(owner.frames.size).toBe(0);
    owner.document.hidden = false;
    owner.document.dispatchEvent(new Event('visibilitychange'));
    owner.flush(48);
    expect(paints).toEqual([0, 1, 2, 0]);
    s.dispose();
  });
  it('samples only when started and skips missed deadlines without catch-up', () => {
    const owner = new Owner(),
      stream = createPlotStream({ seriesIds: ['a'] });
    let reads = 0;
    const sampler = createPlotSampler(stream, {
      owner: owner.view,
      interval: 100,
      read: (now) => {
        reads++;
        return [{ series: 'a', points: [[now, reads]] }];
      },
    });
    owner.flush(1000);
    expect(reads).toBe(0);
    sampler.start();
    owner.flush(5000);
    expect(reads).toBe(1);
    expect(owner.timers.size).toBe(1);
    sampler.pause();
    owner.flush(6000);
    expect(reads).toBe(1);
    sampler.resume();
    owner.flush(6100);
    expect(reads).toBe(2);
    sampler.dispose();
    expect(owner.timers.size).toBe(0);
  });
});
