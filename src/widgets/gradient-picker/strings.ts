/** The words the gradient picker announces and shows; every entry can be replaced. */
export interface GradientPickerStrings {
  /** The name of the group when the element has no `label`. */
  readonly label: string;
  /** A stop's name: `{index}` and `{count}` are its place and the number of stops. */
  readonly stop: string;
  /** A midpoint's name: `{from}` and `{to}` are the places of its two stops. */
  readonly midpoint: string;
  /** A field anchor's name: `{index}` and `{count}` are its place and the number of anchors. */
  readonly anchor: string;
  /** The horizontal input of a field anchor, after its name. */
  readonly horizontal: string;
  /** The vertical input of a field anchor, after its name. */
  readonly vertical: string;
  /** The delete Button's name. */
  readonly remove: string;
}

export const DEFAULT_STRINGS: GradientPickerStrings = {
  label: 'Gradient',
  stop: 'Stop {index} of {count}',
  midpoint: 'Midpoint between stops {from} and {to}',
  anchor: 'Anchor {index} of {count}',
  horizontal: 'horizontal',
  vertical: 'vertical',
  remove: 'Remove stop',
};

export function resolveStrings(
  strings: Partial<GradientPickerStrings> | undefined,
): GradientPickerStrings {
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
