/** Helpers the flow engine modules share. Internal: the flow entry does not export this module. */
import type { FlowSize } from './types.js';

/** The default clock of time-sliced work, in milliseconds. */
export const defaultNow = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

/** Whether two optional sizes are the same object or have the same width and height. */
export function sizesEqual(a: FlowSize | undefined, b: FlowSize | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.width === b.width && a.height === b.height;
}
