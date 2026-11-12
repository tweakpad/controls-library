import { describe, expect, it, vi } from 'vitest';
import {
  colorCollectionCatalog,
  isColorCollectionLoader,
  loadColorCollection,
  loadedColorCollection,
  type ColorCollection,
  type ColorCollectionLoader,
} from '../../../../src/foundation/color-palette/index.js';

const document: ColorCollection = { id: 'brand', name: 'Brand', colors: ['#ff0000', '#00ff00'] };

describe('loadColorCollection', () => {
  it('tells loaders from documents', () => {
    expect(isColorCollectionLoader(document)).toBe(false);
    expect(isColorCollectionLoader({ id: 'brand', load: async () => document })).toBe(true);
  });
  it('unwraps a module default and loads once per loader', async () => {
    const load = vi.fn(async () => ({ default: document }));
    const loader: ColorCollectionLoader = { id: 'brand', load };
    expect(loadedColorCollection(loader)).toBeUndefined();
    const [first, second] = await Promise.all([
      loadColorCollection(loader),
      loadColorCollection(loader),
    ]);
    expect(first).toBe(document);
    expect(second).toBe(document);
    expect(load).toHaveBeenCalledTimes(1);
    expect(loadedColorCollection(loader)).toBe(document);
  });
  it('rejects a result that is not a collection', async () => {
    const loader: ColorCollectionLoader = {
      id: 'fetched',
      load: async () => ({ id: 'fetched' }) as unknown as ColorCollection,
    };
    await expect(loadColorCollection(loader)).rejects.toThrow(TypeError);
  });
  it('forgets a failed load, so the next call tries again', async () => {
    const load = vi
      .fn<ColorCollectionLoader['load']>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(document);
    const loader: ColorCollectionLoader = { id: 'brand', load };
    await expect(loadColorCollection(loader)).rejects.toThrow('offline');
    expect(loadedColorCollection(loader)).toBeUndefined();
    await expect(loadColorCollection(loader)).resolves.toBe(document);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('colorCollectionCatalog', () => {
  it('names each shipped collection as its document does', async () => {
    expect(new Set(colorCollectionCatalog.map((entry) => entry.id)).size).toBe(
      colorCollectionCatalog.length,
    );
    for (const entry of colorCollectionCatalog) {
      const loaded = await loadColorCollection(entry);
      expect([loaded.id, loaded.name]).toEqual([entry.id, entry.name]);
    }
  });
});
