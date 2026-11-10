import { DocParseError, parseFrontmatter, readBody } from './parse.js';
import type { DocElement, DocHeading, DocPreview } from './parse.js';

/**
 * Pattern pages (`docs/patterns/<slug>.mdx`): real-case templates built from library components.
 * A pattern documents no element of its own, so its page names the components it is built with
 * instead of a tag, and its sections are the flows it covers. The body uses the component page
 * grammar (Preview, Code, Keys and Markdown).
 */

export const PATTERN_FOLDER = 'patterns';

export interface ParsedPattern {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** The group the pattern is listed under, such as `Authentication`. */
  readonly category: string;
  /** Slugs of the component pages the pattern is built with, in display order. */
  readonly components: readonly string[];
  /** The module that registers every element the pattern uses. */
  readonly entry: `@tweakpad/ui/patterns/${string}`;
  readonly headings: readonly DocHeading[];
  /** Every preview in document order; the first is the pattern's main use case. */
  readonly previews: readonly DocPreview[];
  readonly elements: readonly DocElement[];
  readonly moduleStatements: readonly number[];
  readonly prose: string;
  /** Every `tp-` element the previews' markup uses, sorted. */
  readonly tags: readonly string[];
}

/** The page id of a pattern page path, `patterns/auth`. */
export function patternId(file: string): string {
  const match = /(?:^|\/)docs\/patterns\/([^/]+)\.mdx$/.exec(file);
  if (!match) throw new Error(`${file} is not a pattern page path`);
  return `${PATTERN_FOLDER}/${match[1]}`;
}

/** Every `tp-` element markup opens, sorted and once each. */
export function patternTags(code: string): string[] {
  return [...new Set([...code.matchAll(/<(tp-[a-z0-9-]+)/g)].map((match) => match[1]!))].sort();
}

const FIELDS = ['title', 'description', 'category', 'components'];

/** Reads one pattern page. `id` is its page id, `patterns/auth`. */
export function parsePattern(source: string, id: string): ParsedPattern {
  const slug = id.slice(id.lastIndexOf('/') + 1);
  if (id !== `${PATTERN_FOLDER}/${slug}` || !slug) throw new Error(`${id} is not a pattern id`);
  const text = source.replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const frontmatter = parseFrontmatter(lines, id);
  for (const key of Object.keys(frontmatter.fields))
    if (!FIELDS.includes(key)) throw new DocParseError(id, 1, `unknown frontmatter field: ${key}`);
  const field = (name: string): string => {
    const value = frontmatter.fields[name];
    if (typeof value !== 'string' || !value)
      throw new DocParseError(id, 1, `frontmatter needs a ${name}`);
    return value;
  };
  const components = frontmatter.fields.components;
  if (!Array.isArray(components) || components.length === 0)
    throw new DocParseError(id, 1, 'components must be a list of component page slugs');
  const body = readBody(text, lines, frontmatter.end, id);
  return {
    id,
    slug,
    title: field('title'),
    description: field('description'),
    category: field('category'),
    components,
    entry: `@tweakpad/ui/patterns/${slug}`,
    ...body,
    tags: patternTags(body.previews.map((preview) => preview.code).join('\n')),
  };
}
