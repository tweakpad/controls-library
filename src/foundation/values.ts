/**
 * Small value helpers shared across the library: type guards, rounding and a no-op callback. The
 * module has no imports and does nothing when imported, so every entry, companion and adapter can
 * use it.
 */

/** A number that is neither NaN nor infinite. */
export const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** A finite number above zero. */
export const positive = (value: unknown): value is number => finite(value) && value > 0;

/** `value` rounded to `decimals` decimal places; halves round toward positive infinity. */
export const roundTo = (value: number, decimals: number): number =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/** A non-null object that is not an array. */
export const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Anything that holds properties: a non-null object, an array or a function. */
export const isObjectLike = (value: unknown): value is Readonly<Record<string, unknown>> =>
  (typeof value === 'object' || typeof value === 'function') && value !== null;

/** A callback that does nothing, such as the handler of a rejection nobody needs. */
export const ignore = (): void => undefined;
