import type { PropertyDeclarations } from 'lit';
import type { TpElement } from './element.js';

/** Shared configuration of interfaces that own native scroll areas. */
export interface ScrollableInterface {
  /** Enables scroll-edge content fades. Off by default. */
  scrollEdgeFade: boolean;
}

// TypeScript requires an unrestricted argument list for a generic mixin constructor.
type ElementConstructor = (abstract new (...args: any[]) => TpElement) & {
  properties: PropertyDeclarations;
};
type ScrollableConstructor = abstract new (...args: any[]) => ScrollableInterface;

/** Adds the scrollable contract only to classes that own scrollable interfaces. */
export function Scrollable<T extends ElementConstructor>(Base: T): T & ScrollableConstructor {
  abstract class ScrollableElement extends Base implements ScrollableInterface {
    static override properties: PropertyDeclarations = {
      scrollEdgeFade: { type: Boolean, attribute: 'scroll-edge-fade', reflect: true },
    };

    /** Enables fades on this interface's native scroll areas. Off by default. */
    scrollEdgeFade = false;
  }
  return ScrollableElement;
}
