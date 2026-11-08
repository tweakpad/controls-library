import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import { parseDoc } from '../../../src/docs/parse.js';
import { previewImports, rewritePreviewImports } from '../../../src/docs/preview-runtime.js';
import * as features from '../../../src/widgets/text-editor/features/index.js';
import { announcement } from '../../../src/stories/widgets/text-editor-samples.js';
import { infoIcon } from '../../../src/icons/info.js';
import { globeIcon } from '../../../src/icons/globe.js';
import * as companion from '../../../src/foundation/text-editor/index.js';
import { BASE_CAPABILITIES } from '../../../src/foundation/text-editor/capabilities.js';
import {
  resolveTextEditorTooling,
  type TextEditorResolutionInput,
} from '../../../src/widgets/text-editor/text-editor.js';

const source = readFileSync(
  new URL('../../../docs/widgets/text-editor.mdx', import.meta.url),
  'utf8',
);
const page = parseDoc(source, 'widgets/text-editor');
const expected: Record<string, string[]> = {
  'Text editor': [],
  'Classic editor': ['links'],
  'Node editor': ['blocks', 'suggestions', 'selection-toolbar'],
  'Custom nodes': ['blocks', 'suggestions', 'selection-toolbar'],
  'Custom blocks': ['blocks', 'suggestions'],
  'Markdown in and out': [],
  'In a form': [],
  'Read-only and disabled': [],
  Tables: ['tables'],
  'Image upload': ['images'],
  'Core editor': [],
  'Selection toolbar': ['selection-toolbar', 'links'],
};

// These are configuration hosts, not DOM or editing-engine substitutes for browser verification.
async function configure(preview: (typeof page.previews)[number]) {
  const engine = {
    capabilities: new Set([...BASE_CAPABILITIES, 'block.table', 'table.merge', 'table.move']),
    supportsNode: () => true,
  };
  const elements: Record<string, unknown>[] = [];
  const visit = (node: DefaultTreeAdapterMap['childNode']) => {
    if ('tagName' in node) {
      const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
      elements.push({
        tag: node.tagName,
        ...attrs,
        features: [],
        nodes: [],
        tools: [],
        layout: null,
        strings: null,
        readOnly: 'readonly' in attrs,
        disabled: 'disabled' in attrs,
        defaultValue: null,
        format: attrs['format'] ?? 'html',
        addEventListener() {},
        ownerDocument: { defaultView: new EventTarget() },
      });
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  };
  parseFragment(preview.code).childNodes.forEach(visit);
  const select = (selector: string) => {
    const id = selector.match(/#([\w-]+)/)?.[1];
    if (selector.endsWith(' tp-text-editor') || selector === 'tp-text-editor')
      return elements.find((element) => element['tag'] === 'tp-text-editor');
    return elements.find((element) => element['id'] === id);
  };
  for (const element of elements) element['querySelector'] = select;
  const modules = (specifier: string) => {
    if (specifier === '@tweakpad/ui/widgets') return features;
    if (specifier === '@tweakpad/ui/text-editor') return companion;
    if (specifier.includes('/adapters/'))
      return { createTiptapEngine: () => engine, createLexicalEngine: () => engine };
    if (specifier.includes('/icons/')) return { infoIcon, globeIcon };
    return {};
  };
  await new Function(
    'document',
    'window',
    'customElements',
    'MutationObserver',
    `return (async () => { ${rewritePreviewImports(preview.script!)} })();`,
  )(
    {
      querySelector: select,
      querySelectorAll: () => elements.filter((e) => e['tag'] === 'tp-text-editor'),
    },
    { __tpPreviewModules: { ready: Promise.resolve(modules) } },
    { whenDefined: async () => {} },
    class {
      observe() {}
      disconnect() {}
    },
  );
  return elements.filter((element) => element['tag'] === 'tp-text-editor');
}

describe('Text editor documentation configurations', () => {
  for (const preview of page.previews) {
    it(`${preview.title}: installs its advertised features with a valid tool layout`, async () => {
      const editors = await configure(preview);
      expect(editors.length).toBeGreaterThan(0);
      expect(preview.width).toBeDefined();
      for (const editor of editors) {
        expect(editor['engine']).toBeDefined();
        const configured = editor['features'] as { name: string }[];
        expect(configured.map((feature) => feature.name)).toEqual(expected[preview.title]);
        const tooling = resolveTextEditorTooling(editor as unknown as TextEditorResolutionInput);
        expect(tooling.diagnostics).toEqual([]);
      }
    });
  }

  it('keeps the hero document and the Controls initial content identical', async () => {
    const editors = await configure(page.hero!);
    expect(editors[0]?.['defaultValue']).toBe(announcement);
  });

  it('keeps the primary form action after reset, aligned to the end', () => {
    const form = page.previews.find((preview) => preview.title === 'In a form')!;
    expect(form.code).toContain('justify="end"');
    expect(form.code.indexOf('type="reset"')).toBeLessThan(form.code.indexOf('type="submit"'));
  });

  it('registers every engine import used by its runnable previews in Storybook', () => {
    const registry = readFileSync(
      new URL('../../../.storybook/preview.ts', import.meta.url),
      'utf8',
    );
    for (const preview of page.previews) {
      for (const specifier of previewImports(preview.script!)) {
        if (
          !specifier.startsWith('@tiptap/') &&
          !specifier.startsWith('@lexical/') &&
          specifier !== 'lexical'
        )
          continue;
        expect(registry, `${preview.title}: ${specifier}`).toContain(`import('${specifier}')`);
      }
    }
  });

  it('keeps the Default story eligible for the shared hero decorator', () => {
    const story = readFileSync(
      new URL('../../../src/stories/widgets/text-editor.stories.ts', import.meta.url),
      'utf8',
    );
    const defaultStory = story.split('export const Default: Story = {')[1]!.split('\n};')[0]!;
    expect(defaultStory).not.toMatch(/^ {2}name:\s*['"]/m);
  });
});
