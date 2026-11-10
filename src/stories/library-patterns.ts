import type { ComponentType } from 'react';
import { parsePattern, patternId, type ParsedPattern } from '../docs/pattern.js';
import { libraryDocPages } from './library-docs.js';

/**
 * The library's pattern pages (`docs/patterns/*.mdx`) as Storybook renders them: each page
 * compiled by Storybook's MDX plugin and read by the pattern parser, with the Docs page of every
 * component it is built with.
 */
const compiled = import.meta.glob<{ default: ComponentType<{ components?: object }> }>(
  '../../docs/patterns/*.mdx',
  { eager: true },
);
const sources = import.meta.glob<string>('../../docs/patterns/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export interface PatternComponent {
  readonly title: string;
  /** The component's Docs page in this Storybook. */
  readonly href: string;
}

export interface LibraryPattern {
  readonly page: ParsedPattern;
  readonly Content: ComponentType<{ components?: object }>;
  readonly components: readonly PatternComponent[];
}

/** The sidebar section of a documentation folder. */
const SECTIONS: Readonly<Record<string, string>> = {
  components: 'Components',
  'motion/text': 'Motion/Text',
  'motion/surface': 'Motion/Surface',
  widgets: 'Widgets',
};

/** Storybook's id of a title, as it builds story and Docs ids. */
const storyId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const byId = new Map<string, LibraryPattern>();
for (const [file, source] of Object.entries(sources)) {
  const id = patternId(file);
  const page = parsePattern(source, id);
  const components = page.components.map((slug) => {
    const owner = libraryDocPages.find((doc) => doc.page.slug === slug)?.page;
    if (!owner) throw new Error(`${id}: no documentation page ${slug}`);
    const title = `${SECTIONS[owner.folder]}/${owner.title}`;
    return { title: owner.title, href: `./?path=/docs/${storyId(title)}--docs` };
  });
  byId.set(id, { page, Content: compiled[file]!.default, components });
}

/** The pattern page `slug` (`auth`). */
export function libraryPattern(slug: string): LibraryPattern {
  const pattern = byId.get(`patterns/${slug}`);
  if (!pattern) throw new Error(`no pattern page docs/patterns/${slug}.mdx`);
  return pattern;
}
