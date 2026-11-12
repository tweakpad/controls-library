import { parseColorCollection } from './parse.js';
import type { ColorCollection, ColorCollectionEntry, ColorCollectionLoader } from './types.js';

/** Whether an entry is a loader rather than a document. */
export function isColorCollectionLoader(
  entry: ColorCollectionEntry,
): entry is ColorCollectionLoader {
  return (
    typeof (entry as ColorCollectionLoader).load === 'function' &&
    !Array.isArray((entry as ColorCollection).colors)
  );
}

const pending = new WeakMap<ColorCollectionLoader, Promise<ColorCollection>>();
const settled = new WeakMap<ColorCollectionLoader, ColorCollection>();

/** The document a loader has already loaded, or undefined before it has. */
export function loadedColorCollection(loader: ColorCollectionLoader): ColorCollection | undefined {
  return settled.get(loader);
}

/**
 * Loads a collection once per loader: every caller of the same loader object shares one request
 * and its document. A module's default export is unwrapped; a result without a colors list is
 * rejected (a loader of fetched JSON parses it with `parseColorCollection` itself). A failed load
 * is forgotten, so the next call tries again.
 */
export function loadColorCollection(loader: ColorCollectionLoader): Promise<ColorCollection> {
  const cached = pending.get(loader);
  if (cached) return cached;
  const request = Promise.resolve()
    .then(() => loader.load())
    .then((result) => {
      const document = unwrap(result);
      if (!Array.isArray((document as ColorCollection | undefined)?.colors))
        return parseColorCollection(document).collection;
      return document as ColorCollection;
    })
    .then((document) => {
      settled.set(loader, document);
      return document;
    });
  pending.set(loader, request);
  request.catch(() => {
    if (pending.get(loader) === request) pending.delete(loader);
  });
  return request;
}

function unwrap(result: unknown): unknown {
  if (result && typeof result === 'object' && 'default' in result && !('colors' in result))
    return (result as { default: unknown }).default;
  return result;
}
