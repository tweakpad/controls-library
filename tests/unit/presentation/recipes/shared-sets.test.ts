import { describe, expect, it } from 'vitest';
import type { PresentationFamily } from '../../../../src/presentation/family.js';
import { alertPresentation } from '../../../../src/presentation/families/alert.js';
import { buttonPresentation } from '../../../../src/presentation/families/button.js';
import { checkboxPresentation } from '../../../../src/presentation/families/checkbox.js';
import { codeBlockPresentation } from '../../../../src/presentation/families/code-block.js';
import { colorPickerPresentation } from '../../../../src/presentation/families/color-picker.js';
import { flowPresentation } from '../../../../src/presentation/families/flow.js';
import { inputGroupPresentation } from '../../../../src/presentation/families/input-group.js';
import { mapPresentation } from '../../../../src/presentation/families/map.js';
import { markdownPresentation } from '../../../../src/presentation/families/markdown.js';
import { questionnairePresentation } from '../../../../src/presentation/families/questionnaire.js';
import { radioGroupPresentation } from '../../../../src/presentation/families/radio-group.js';
import { separatorPresentation } from '../../../../src/presentation/families/separator.js';
import { switchPresentation } from '../../../../src/presentation/families/switch.js';
import { tablePresentation } from '../../../../src/presentation/families/table.js';
import { textEditorPresentation } from '../../../../src/presentation/families/text-editor.js';
import { toggleGroupPresentation } from '../../../../src/presentation/families/toggle-group.js';
import { togglePresentation } from '../../../../src/presentation/families/toggle.js';
import { treeViewPresentation } from '../../../../src/presentation/families/tree-view.js';
import { serializeDeclarations } from '../../../../src/presentation/resolver.js';
import type { PresentationDictionary } from '../../../../src/presentation/resolver.js';

// Durable goldens of the generated CSS of every family whose recipe composes, or will compose, a
// shared set (`dcp-binding`): moving declarations into a shared set keeps each family's text byte
// for byte, and an intended change shows as a reviewed golden diff.

/** Each key in dictionary order, then each rule as the generator writes it, `&` for the part. */
function serializeDictionary(dictionary: PresentationDictionary): string[] {
  return Object.entries(dictionary).flatMap(([key, rules]) => [
    `/* ${key} */`,
    ...rules.map((rule) => {
      const selector = rule.selector?.includes('&') ? rule.selector : `&${rule.selector ?? ''}`;
      return `${selector}{${serializeDeclarations(rule.declarations)}}`;
    }),
  ]);
}

function serializeFamily(family: PresentationFamily): string {
  const tag = family.definition.tagName;
  return [
    `/* ${tag} appearance */`,
    ...serializeDictionary(family.appearance),
    '',
    `/* ${tag} structure */`,
    ...serializeDictionary(family.structure),
    '',
  ].join('\n');
}

const families: readonly (readonly [name: string, node: string, family: PresentationFamily])[] = [
  ['markdown', 'dcp-binding', markdownPresentation],
  ['code-block', 'dcp-roles-table-r8', codeBlockPresentation],
  ['separator', 'dcp-roles-table-r12', separatorPresentation],
  ['alert', 'uwg-te-tab-vocabulary-r17', alertPresentation],
  ['checkbox', 'dcp-roles-table-r5', checkboxPresentation],
  ['switch', 'dcp-roles-table-r5', switchPresentation],
  ['tree-view', 'dcp-roles-table-r5', treeViewPresentation],
  ['questionnaire', 'dcp-roles-table-r5', questionnairePresentation],
  ['radio-group', 'dcp-roles-table-r5', radioGroupPresentation],
  ['color-picker', 'uwg-cp-tab-anatomy-r12', colorPickerPresentation],
  ['map', 'uwg-te-tab-anatomy-status', mapPresentation],
  ['flow', 'uwg-te-sel-req-overlay', flowPresentation],
  ['table', 'uwg-te-table-req-document', tablePresentation],
  ['toggle', 'req-cl-145-size', togglePresentation],
  ['toggle-group', 'req-cl-145-size', toggleGroupPresentation],
  ['button', 'ucl16-button-anatomy-r2', buttonPresentation],
  ['input-group', 'ucl17-input-group-q1', inputGroupPresentation],
  ['text-editor', 'uwg-te-req-pres-2', textEditorPresentation],
];

describe('shared presentation set goldens', () => {
  for (const [name, node, family] of families)
    it(`${name} keeps its generated CSS (\`${node}\`)`, async () => {
      expect(family.definition.tagName).toBe(`tp-${name}`);
      await expect(serializeFamily(family)).toMatchFileSnapshot(`./__goldens__/${name}.css`);
    });
});
