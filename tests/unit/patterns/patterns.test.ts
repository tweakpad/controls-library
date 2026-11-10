/**
 * Guards of the Patterns section: every pattern page under `docs/patterns` has its registration
 * entry `src/patterns/<slug>.ts`, the entry defines exactly the elements the page's markup uses
 * (and imports nothing but those components), the page lists exactly the component pages that
 * document them, and its sections are flows with a preview each.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDoc, DOC_FOLDERS } from '../../../src/docs/parse.js';
import { parsePattern, patternTags } from '../../../src/docs/pattern.js';
import { importSpecifiers } from '../source-imports.test.js';

const root = new URL('../../../', import.meta.url).pathname;
const read = (file: string) => readFileSync(join(root, file), 'utf8');
const list = (dir: string, extension: string) =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir))
        .filter((file) => file.endsWith(extension))
        .map((file) => file.slice(0, -extension.length))
        .sort()
    : [];

const slugs = list('docs/patterns', '.mdx');
const patterns = slugs.map((slug) =>
  parsePattern(read(`docs/patterns/${slug}.mdx`), `patterns/${slug}`),
);
/** Every documentation page, to find the one that documents a tag. */
const pages = DOC_FOLDERS.flatMap((folder) =>
  list(`docs/${folder}`, '.mdx').map((slug) =>
    parseDoc(read(`docs/${folder}/${slug}.mdx`), `${folder}/${slug}`),
  ),
);

/** The tags an entry defines: each imported class's `static tagName`. */
function definedTags(slug: string): string[] {
  const source = read(`src/patterns/${slug}.ts`);
  const classes = new Map(
    [...source.matchAll(/^import \{ (Tp\w+) \} from '([^']+)';$/gmu)].map((match) => [
      match[1]!,
      match[2]!,
    ]),
  );
  return [...source.matchAll(/^defineElement\((Tp\w+)\.tagName, (Tp\w+)\);$/gmu)]
    .map((match) => {
      expect(match[1], slug).toBe(match[2]);
      const module = classes.get(match[1]!);
      expect(module, `${slug}: ${match[1]} is not imported`).toBeDefined();
      const file = join('src/patterns', module!).replace(/\.js$/u, '.ts');
      const tag = /static tagName = '(tp-[a-z0-9-]+)'/u.exec(read(file))?.[1];
      expect(tag, `${file} declares a tagName`).toBeDefined();
      return tag!;
    })
    .sort();
}

describe('patterns', () => {
  it('pairs every pattern page with its registration entry', () => {
    expect(slugs.length).toBeGreaterThan(0);
    expect(list('src/patterns', '.ts')).toEqual(slugs);
    for (const slug of slugs)
      expect(read('src/stories/patterns/' + slug + '.mdx'), slug).toContain(
        `<PatternPage id="${slug}" />`,
      );
  });

  it('defines exactly the elements its markup uses, from components only', () => {
    for (const pattern of patterns) {
      const source = read(`src/patterns/${pattern.slug}.ts`);
      for (const specifier of importSpecifiers(source))
        expect(specifier, pattern.slug).toMatch(
          /^\.\.\/(?:foundation\/define|components\/[a-z0-9-]+\/[a-z0-9-]+)\.js$/u,
        );
      expect(definedTags(pattern.slug), pattern.slug).toEqual(pattern.tags);
    }
  });

  it('lists exactly the component pages that document the elements it uses', () => {
    for (const pattern of patterns) {
      const owners = new Set(
        pattern.tags.map((tag) => {
          const owner = pages.find((page) => page.tag === tag || page.parts.includes(tag));
          expect(owner, `${pattern.slug}: no page documents ${tag}`).toBeDefined();
          return owner!.slug;
        }),
      );
      expect([...pattern.components].sort(), pattern.slug).toEqual([...owners].sort());
      expect(new Set(pattern.components).size, pattern.slug).toBe(pattern.components.length);
    }
  });

  it('is a sequence of flows, each with a preview, and copyable markup with unique ids', () => {
    for (const pattern of patterns) {
      expect(pattern.entry).toBe(`@tweakpad/ui/patterns/${pattern.slug}`);
      expect(pattern.moduleStatements, pattern.slug).toEqual([]);
      expect(pattern.headings[0]?.depth, `${pattern.slug} starts with a flow`).toBe(2);
      expect(pattern.headings.every((heading) => heading.depth === 2 || heading.depth === 3)).toBe(
        true,
      );
      for (const heading of pattern.headings)
        expect(
          pattern.previews.some((preview) => preview.afterHeading === heading.slug),
          `${pattern.slug}: ${heading.text} has a preview`,
        ).toBe(true);
      expect(pattern.headings.some((heading) => /^(usage|keyboard|api)/iu.test(heading.text))).toBe(
        false,
      );
      const ids = pattern.previews.flatMap((preview) =>
        [...preview.code.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]!),
      );
      expect(new Set(ids).size, `${pattern.slug}: duplicate ids`).toBe(ids.length);
      // Native controls are the components' job.
      for (const preview of pattern.previews)
        expect(preview.code, `${pattern.slug}: ${preview.title}`).not.toMatch(
          /<(?:input|button|select|textarea|form)[\s>]/u,
        );
    }
  });

  it('reads the tags of markup', () => {
    expect(
      patternTags('<tp-card><tp-button></tp-button><tp-button></tp-button></tp-card>'),
    ).toEqual(['tp-button', 'tp-card']);
  });

  it('publishes every pattern through its own entry and keeps it out of the main entries', () => {
    const manifest = JSON.parse(read('package.json')) as {
      exports: Record<string, unknown>;
      sideEffects: string[];
      files: string[];
    };
    expect(manifest.exports['./patterns/*']).toEqual({
      types: './dist/patterns/*.d.ts',
      import: './dist/patterns/*.js',
      default: './dist/patterns/*.js',
    });
    expect(manifest.sideEffects).toContain('./dist/patterns/*.js');
    expect(manifest.sideEffects).toContain('./src/patterns/*.ts');
    expect(manifest.files).toContain('docs/patterns/*.mdx');
    for (const entry of ['src/index.ts', 'src/register.ts'])
      expect(read(entry), entry).not.toMatch(/patterns\//u);
  });
});
