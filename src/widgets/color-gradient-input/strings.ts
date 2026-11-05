/** The words the gradient input announces and shows; every entry can be replaced. */
export interface ColorGradientInputStrings {
  /** The name of the group when the element has no `label`. */
  readonly label: string;
  /** A stop's name: `{index}` and `{count}` are its place and the number of stops. */
  readonly stop: string;
  /** A midpoint's name: `{from}` and `{to}` are the places of its two stops. */
  readonly midpoint: string;
  /** The delete Button's name. */
  readonly remove: string;
}

export const DEFAULT_STRINGS: ColorGradientInputStrings = {
  label: 'Gradient',
  stop: 'Stop {index} of {count}',
  midpoint: 'Midpoint between stops {from} and {to}',
  remove: 'Remove stop',
};

export function resolveStrings(
  strings: Partial<ColorGradientInputStrings> | undefined,
): ColorGradientInputStrings {
  return { ...DEFAULT_STRINGS, ...strings };
}

/** Fills `{name}` placeholders. */
export function format(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
