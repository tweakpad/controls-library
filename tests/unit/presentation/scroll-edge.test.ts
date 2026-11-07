import { describe, expect, it } from 'vitest';
import { scrollEdgeMask } from '../../../src/presentation/recipes/shared/scroll-edge.js';

describe('content scroll masks', () => {
  it('covers a viewport left of an RTL content border box, without a border-box-sized opaque layer', () => {
    const mask = scrollEdgeMask(
      { left: -100, top: 80, width: 320, height: 160 },
      { left: 24, right: 24, top: 24, bottom: 24 },
      [],
      'none',
    );
    expect(mask.position).toBe('-100px 80px,-100px 80px');
    expect(mask.size).toBe('320px 160px,320px 160px');
    expect(mask.composite).toBe('intersect,add');
    expect(mask.image).not.toContain('linear-gradient(#000,#000)');
  });
  it('adds opaque sticky/focus islands over the edge product and intersects an authored mask', () => {
    const mask = scrollEdgeMask(
      { left: 0, top: 0, width: 100, height: 80 },
      { left: 0, right: 24, top: 0, bottom: 20 },
      [{ left: 0, top: 0, width: 100, height: 20 }],
      'url("authored.svg")',
    );
    expect(mask.size).toBe('100px 20px,100px 80px,100px 80px,auto');
    expect(mask.composite).toBe('add,intersect,intersect,add');
    expect(mask.image).toContain('url("authored.svg")');
  });
});
