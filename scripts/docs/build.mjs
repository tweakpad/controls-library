// The documentation index, `dist/docs.json`: every page under `docs/components`,
// `docs/motion/<group>` and `docs/widgets` parsed, related to the pages it renders and is rendered
// by, plus the token catalog. Runs at the end of `npm run build`, after the library
// (`dist/docs/index.js`) and the Custom Elements Manifest exist, and fails the build on anything
// the renderings would show wrong: a page for an element the catalog does not list, a constituent
// tag the manifest does not declare, or a documented element whose public API has an undescribed
// row.
//
// Pattern pages (`docs/patterns/<slug>.mdx`) are indexed beside them: each pattern's `components`
// must be exactly the pages that document the elements its markup uses, and its entry module
// `src/patterns/<slug>.ts` must exist.
//
// `scripts/docs/pending.json` lists the tags whose pages are not written yet: they need no page
// and their API descriptions are not checked. A page for a pending tag takes it off the list.
// With `--check`, nothing is written.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '../..');
const check = process.argv.includes('--check');
const fail = (problems) => {
  for (const problem of problems) console.error(`docs: ${problem}`);
  process.exit(1);
};

const built = join(root, 'dist/docs/index.js');
if (!existsSync(built)) fail(['dist/docs/index.js is missing: run `npm run build` first']);
const manifestPath = join(root, 'dist/custom-elements.json');
if (!existsSync(manifestPath)) fail(['dist/custom-elements.json is missing: run `npm run cem`']);

const {
  parseDoc,
  parsePattern,
  elementApi,
  manifestTags,
  relatedPages,
  tokenCatalog,
  undescribedApi,
} = await import(pathToFileURL(built).href);
const { catalogEntries, catalogFolder } = await import(
  pathToFileURL(join(root, 'dist/catalog.js')).href
);
const { widgetEntries } = await import(pathToFileURL(join(root, 'dist/widgets/catalog.js')).href);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const pending = new Set(
  JSON.parse(readFileSync(join(root, 'scripts/docs/pending.json'), 'utf8')).tags,
);

const problems = [];
const pages = [];
const entries = [
  ...catalogEntries.map((entry) => ({ ...entry, folder: catalogFolder(entry) })),
  ...widgetEntries.map((entry) => ({ ...entry, folder: 'widgets' })),
];
const entryByTag = new Map(entries.map((entry) => [entry.tagName, entry]));
const tags = new Set(manifestTags(manifest));

const folders = ['components', 'motion/text', 'motion/surface', 'widgets'];
for (const folder of folders) {
  const directory = join(root, 'docs', folder);
  if (!existsSync(directory)) continue;
  for (const file of readdirSync(directory).sort()) {
    if (!file.endsWith('.mdx')) continue;
    const id = `${folder}/${file.slice(0, -'.mdx'.length)}`;
    const path = `docs/${folder}/${file}`;
    let page;
    try {
      page = parseDoc(readFileSync(join(directory, file), 'utf8'), id);
    } catch (error) {
      problems.push(error.message);
      continue;
    }
    const entry = entryByTag.get(page.tag);
    if (!entry) problems.push(`${path}: ${page.tag} is not a catalog entry`);
    else {
      if (entry.folder !== folder)
        problems.push(`${path}: ${page.tag} belongs under docs/${entry.folder}`);
    }
    if (!tags.has(page.tag)) problems.push(`${path}: the manifest does not declare ${page.tag}`);
    for (const part of page.parts) {
      if (!tags.has(part)) problems.push(`${path}: the manifest does not declare part ${part}`);
    }
    if (pending.has(page.tag))
      problems.push(`${path}: ${page.tag} has a page; remove it from scripts/docs/pending.json`);
    pages.push({ ...page, file: path });
  }
}
for (const entry of entries)
  if (!pending.has(entry.tagName) && !pages.some((page) => page.tag === entry.tagName))
    problems.push(
      `${entry.tagName} has no page under docs/${entry.folder} and is not listed in scripts/docs/pending.json`,
    );
for (const tag of pending)
  if (!entryByTag.has(tag))
    problems.push(`scripts/docs/pending.json lists ${tag}, which is not a catalog entry`);

// Every documented element, and each of its constituent tags, carries a description on every API row.
for (const page of pages)
  for (const tag of [page.tag, ...page.parts]) {
    const api = elementApi(manifest, tag);
    if (!api) continue;
    const missing = undescribedApi(api);
    if (missing.length)
      problems.push(`${page.file}: ${tag} lacks a description for ${missing.join(', ')}`);
  }

// Patterns: the page that documents each element a pattern uses is one of its components.
const patterns = [];
const patternDirectory = join(root, 'docs/patterns');
const ownerOf = (tag) => pages.find((page) => page.tag === tag || page.parts.includes(tag));
if (existsSync(patternDirectory))
  for (const file of readdirSync(patternDirectory).sort()) {
    if (!file.endsWith('.mdx')) continue;
    const slug = file.slice(0, -'.mdx'.length);
    const path = `docs/patterns/${file}`;
    let pattern;
    try {
      pattern = parsePattern(
        readFileSync(join(patternDirectory, file), 'utf8'),
        `patterns/${slug}`,
      );
    } catch (error) {
      problems.push(error.message);
      continue;
    }
    if (!existsSync(join(root, 'src/patterns', `${slug}.ts`)))
      problems.push(`${path}: its entry src/patterns/${slug}.ts is missing`);
    const owners = new Map();
    for (const tag of pattern.tags) {
      const owner = ownerOf(tag);
      if (!owner) problems.push(`${path}: no documentation page documents ${tag}`);
      else owners.set(owner.slug, owner.id);
    }
    const listed = new Set(pattern.components);
    for (const slug of owners.keys())
      if (!listed.has(slug)) problems.push(`${path}: components must list ${slug}`);
    for (const slug of listed)
      if (!owners.has(slug))
        problems.push(`${path}: components lists ${slug}, which it does not use`);
    patterns.push({
      ...pattern,
      file: path,
      components: pattern.components.map((slug) => owners.get(slug) ?? slug),
    });
  }

if (problems.length) fail(problems);

// Catalog order within each folder: components, then Motion, then widgets.
const order = new Map(
  entries.map((entry, index) => [entry.tagName, folders.indexOf(entry.folder) * 1000 + index]),
);
pages.sort((a, b) => order.get(a.tag) - order.get(b.tag));
const related = relatedPages(manifest, pages);
const index = {
  version,
  pages: pages.map((page) => ({ ...page, related: related.get(page.id) })),
  tokens: tokenCatalog(),
  patterns: patterns.sort((a, b) => a.title.localeCompare(b.title)),
};
console.log(
  `docs: ${pages.length} page${pages.length === 1 ? '' : 's'} indexed, ${patterns.length} pattern${patterns.length === 1 ? '' : 's'}, ${pending.size} tag${pending.size === 1 ? '' : 's'} pending`,
);
if (!check) writeFileSync(join(root, 'dist/docs.json'), `${JSON.stringify(index)}\n`);
