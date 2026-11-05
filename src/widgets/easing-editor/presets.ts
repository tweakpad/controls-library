import { EASING_DIRECTIONS } from '../../foundation/easing/types.js';
import type { EasingEditorStrings, EasingPreset, EasingPresetGroup } from './types.js';

const DIRECTION_NAME: Readonly<Record<string, keyof EasingEditorStrings>> = {
  in: 'directionIn',
  out: 'directionOut',
  'in-out': 'directionInOut',
  'out-in': 'directionOutIn',
};

const FAMILIES: ReadonlyArray<readonly [string, keyof EasingEditorStrings]> = [
  ['sine', 'familySine'],
  ['power', 'familyPower'],
  ['expo', 'familyExpo'],
  ['circ', 'familyCirc'],
  ['back', 'familyBack'],
  ['elastic', 'familyElastic'],
  ['bounce', 'familyBounce'],
];

const FAMILY_GROUP_IDS: ReadonlySet<string> = new Set(FAMILIES.map(([family]) => family));
const EASE_DIRECTION_IDS: ReadonlySet<string> = new Set(['ease-in', 'ease-out', 'ease-in-out']);

/**
 * The full name of a built-in preset, for places away from its group (the graph badge): the
 * family presets and the CSS ease directions are named by their direction alone in the grid.
 */
export function builtinPresetTitle(
  group: EasingPresetGroup,
  preset: EasingPreset,
  strings: EasingEditorStrings,
): string {
  if (FAMILY_GROUP_IDS.has(group.id)) return `${group.label} ${preset.label}`;
  if (EASE_DIRECTION_IDS.has(preset.id)) return `${strings.presetEase} ${preset.label}`;
  return preset.label;
}

/**
 * The built-in preset table (Widgets 6.2 Properties): basic CSS easings, four springs and one
 * group per classic easing family with the four directions. Labels come from the strings so a locale
 * can rename them; ids are stable.
 */
export function builtinPresetGroups(strings: EasingEditorStrings): readonly EasingPresetGroup[] {
  const families = FAMILIES.map(([family, name]) => ({
    id: family,
    label: strings[name],
    presets: EASING_DIRECTIONS.map((direction) => ({
      id: `${family}-${direction}`,
      // The group already names the family: each preset is named by its direction alone.
      label: strings[DIRECTION_NAME[direction]!],
      value: `${family}(${direction})`,
    })),
  }));
  return [
    {
      id: 'basic',
      label: strings.presetBasic,
      presets: [
        { id: 'linear', label: strings.presetLinear, value: 'linear' },
        { id: 'ease', label: strings.presetEase, value: 'ease' },
        { id: 'ease-in', label: strings.presetEaseIn, value: 'ease-in' },
        { id: 'ease-out', label: strings.presetEaseOut, value: 'ease-out' },
        { id: 'ease-in-out', label: strings.presetEaseInOut, value: 'ease-in-out' },
        { id: 'steps', label: strings.presetSteps, value: 'steps(4, jump-end)' },
      ],
    },
    {
      id: 'spring',
      label: strings.presetSpring,
      presets: [
        { id: 'spring-default', label: strings.presetSpringDefault, value: 'spring(1 100 10)' },
        { id: 'spring-snappy', label: strings.presetSpringSnappy, value: 'spring(1 300 20)' },
        { id: 'spring-bouncy', label: strings.presetSpringBouncy, value: 'spring(1 200 8)' },
        { id: 'spring-strong', label: strings.presetSpringStrong, value: 'spring(1.5 400 25)' },
      ],
    },
    ...families,
  ];
}
