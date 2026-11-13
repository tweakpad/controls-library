import type { ReactiveControllerHost } from 'lit';

/**
 * Chooses between a set of labels' regular form and their narrow form: the narrow form shows
 * once any regular label is wider than the content box of its cell. The labels stay laid out
 * (hidden) while narrow so their widths keep being measured; the owner renders both forms and
 * shows one from `narrow`. Calendar weekday headers and heatmap axis labels share it.
 */
export class LabelFit {
  /** Whether a regular label overflows its cell, so the narrow labels show. */
  narrow = false;
  #observer: ResizeObserver | undefined;
  #targets: readonly HTMLElement[] = [];

  constructor(private readonly host: ReactiveControllerHost & Element) {}

  /**
   * Observes `labels` (their regular forms) and `cell`, the box one label must fit; observing the
   * same elements again keeps the current measurement.
   */
  observe(cell: HTMLElement | null | undefined, labels: readonly HTMLElement[]): void {
    const targets = cell && labels.length ? [cell, ...labels] : [];
    if (
      targets.length === this.#targets.length &&
      targets.every((target, index) => target === this.#targets[index])
    )
      return;
    this.#observer?.disconnect();
    this.#targets = targets;
    if (!targets.length) {
      this.#set(false);
      return;
    }
    this.#observer ??= new (this.host.ownerDocument.defaultView ?? window).ResizeObserver(
      this.#measure,
    );
    for (const target of targets) this.#observer.observe(target);
  }

  /** Stops measuring; the next `observe` starts again. */
  disconnect(): void {
    this.#observer?.disconnect();
    this.#targets = [];
  }

  /** Layout widths, which a scaling entrance transform leaves untouched. */
  readonly #measure = (): void => {
    const [cell, ...labels] = this.#targets;
    if (!cell || !cell.isConnected) return;
    const style = getComputedStyle(cell);
    const available =
      cell.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
    this.#set(available > 0 && labels.some((label) => label.offsetWidth > available));
  };

  #set(narrow: boolean): void {
    if (narrow === this.narrow) return;
    this.narrow = narrow;
    this.host.requestUpdate();
  }
}
