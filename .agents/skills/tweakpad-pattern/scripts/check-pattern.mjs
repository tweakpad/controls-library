#!/usr/bin/env node
// Checks a pattern's record against its page and entry at a work boundary:
//
//   node .agents/skills/tweakpad-pattern/scripts/check-pattern.mjs <slug> [--stage research|implement|complete] [--no-tests]
//
// research: the record exists with its sections and sourced UX rows.
// implement: also the page, its frontmatter, the entry defining exactly the markup's tags, the
//   Storybook page, every UX row's evidence in the page and a filled flow table.
// complete: also no pending, failed or blocked UX or verification rows; then the pattern and
//   story unit tests run (skip with --no-tests).
//
// The checker reads structure and statuses; it does not prove the rules are right.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SECTIONS = [
  'Delivery',
  'UX standards',
  'Flow coverage',
  'Composition map',
  'Component gaps',
  'Verification',
];
const STATUSES = new Set([
  'pending',
  'applied',
  'passed',
  'failed',
  'blocked',
  'open',
  'done',
  'not applicable',
]);
const STAGES = ['research', 'implement', 'complete'];

/** The rows of the first table under `## heading`, as arrays of trimmed cells. */
export function tableRows(markdown, heading) {
  const start = markdown.search(new RegExp(`^## ${heading}\\s*$`, 'm'));
  if (start < 0) return null;
  const rest = markdown.slice(start).split('\n').slice(1);
  const end = rest.findIndex((line) => /^## /.test(line));
  const lines = (end < 0 ? rest : rest.slice(0, end)).filter((line) => line.startsWith('|'));
  return lines
    .slice(2)
    .map((line) =>
      line
        .slice(1, line.endsWith('|') ? -1 : undefined)
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim()),
    );
}

/** The markup and script of every Preview, unescaped as the page renders them. */
export function previewSources(page) {
  return [...page.matchAll(/\b(?:code|script)=\{`([\s\S]*?)(?<!\\)`\}/g)].map((match) =>
    match[1].replace(/\\`/g, '`').replace(/\\\$\{/g, '${'),
  );
}

/** Frontmatter keys and the `components` list of a page. */
export function frontmatter(page) {
  const match = /^---\n([\s\S]*?)\n---/.exec(page);
  if (!match) return null;
  const keys = [...match[1].matchAll(/^([A-Za-z][\w-]*):/gm)].map((key) => key[1]);
  const block = /^components:\s*\n((?:\s+-\s.*\n?)+)/m.exec(match[1]);
  const inline = /^components:\s*\[(.*)\]\s*$/m.exec(match[1]);
  const components = block
    ? [...block[1].matchAll(/-\s+(\S+)/g)].map((item) => item[1])
    : inline
      ? inline[1].split(',').map((item) => item.trim()).filter(Boolean)
      : [];
  return { keys, components };
}

/** Problems of the pattern `slug` at `stage`, read from `root`. */
export function checkPattern(slug, stage, root) {
  const problems = [];
  const file = (path) => join(root, path);
  const read = (path) => (existsSync(file(path)) ? readFileSync(file(path), 'utf8') : null);
  if (!STAGES.includes(stage)) return [`unknown stage ${stage}`];

  const recordPath = `plans/patterns/${slug}/record.md`;
  const record = read(recordPath);
  if (!record) return [`${recordPath} is missing (copy assets/pattern-record.md)`];
  for (const section of SECTIONS)
    if (!new RegExp(`^## ${section}\\s*$`, 'm').test(record))
      problems.push(`${recordPath}: missing section "## ${section}"`);
  const placeholder = (cells) => cells.some((cell) => /^<.*>$/.test(cell) || cell.includes('<https://'));

  const ux = tableRows(record, 'UX standards') ?? [];
  if (!ux.length) problems.push(`${recordPath}: the UX standards table has no rows`);
  for (const cells of ux) {
    const [id, guidance, source, retrieved, rule, applied, evidence, status] = cells;
    const where = `${recordPath}: ${id || 'UX row'}`;
    if (cells.length < 8) {
      problems.push(`${where} needs 8 cells`);
      continue;
    }
    if (placeholder(cells)) problems.push(`${where} still holds template placeholders`);
    if (!guidance || !rule || !applied) problems.push(`${where} needs guidance, rule and where it applies`);
    if (!/^https:\/\/\S+$/.test(source)) problems.push(`${where}: source must be an https URL`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(retrieved)) problems.push(`${where}: retrieved must be YYYY-MM-DD`);
    if (!STATUSES.has(status)) problems.push(`${where}: unknown status "${status}"`);
    if (!/^`.+`$/.test(evidence)) problems.push(`${where}: evidence must be a code span`);
  }
  if (stage === 'research') return problems;

  const pagePath = `docs/patterns/${slug}.mdx`;
  const page = read(pagePath);
  if (!page) return [...problems, `${pagePath} is missing`];
  const front = frontmatter(page);
  if (!front) problems.push(`${pagePath}: no frontmatter`);
  else {
    const expected = ['title', 'description', 'category', 'components'];
    if ([...front.keys].sort().join() !== [...expected].sort().join())
      problems.push(`${pagePath}: frontmatter keys must be exactly ${expected.join(', ')}`);
    if (!front.components.length) problems.push(`${pagePath}: components lists no page`);
  }
  const sources = previewSources(page);
  if (!sources.length) problems.push(`${pagePath}: no Preview`);
  const all = sources.join('\n');
  for (const [id, , , , , , evidence] of ux) {
    const text = evidence?.replace(/^`|`$/g, '');
    if (text && !all.includes(text))
      problems.push(`${recordPath}: ${id} evidence ${evidence} does not occur in ${pagePath}`);
  }
  const tags = [...new Set([...all.matchAll(/<(tp-[a-z0-9-]+)/g)].map((match) => match[1]))].sort();

  const entryPath = `src/patterns/${slug}.ts`;
  const entry = read(entryPath);
  if (!entry) problems.push(`${entryPath} is missing`);
  else {
    const modules = new Map(
      [...entry.matchAll(/^import \{ (Tp\w+) \} from '([^']+)';$/gm)].map((match) => [match[1], match[2]]),
    );
    const defined = [...entry.matchAll(/^defineElement\((Tp\w+)\.tagName, \1\);$/gm)]
      .map((match) => {
        const module = modules.get(match[1]);
        const source = module && read(join('src/patterns', module).replace(/\.js$/, '.ts'));
        return source && /static tagName = '(tp-[a-z0-9-]+)'/.exec(source)?.[1];
      })
      .filter(Boolean)
      .sort();
    if (defined.join() !== tags.join())
      problems.push(`${entryPath} defines [${defined.join(', ')}] but the markup uses [${tags.join(', ')}]`);
  }
  const story = read(`src/stories/patterns/${slug}.mdx`);
  if (!story?.includes(`<PatternPage id="${slug}" />`))
    problems.push(`src/stories/patterns/${slug}.mdx must render <PatternPage id="${slug}" />`);

  const flows = tableRows(record, 'Flow coverage') ?? [];
  if (!flows.length) problems.push(`${recordPath}: the flow coverage table has no rows`);
  for (const cells of flows)
    if (cells.length < 7 || cells.some((cell) => !cell) || placeholder(cells))
      problems.push(`${recordPath}: flow ${cells[0]} / ${cells[1]} needs every state described`);
  for (const cells of tableRows(record, 'Composition map') ?? [])
    if (placeholder(cells)) problems.push(`${recordPath}: composition map holds placeholders`);
  if (stage === 'implement') return problems;

  for (const [id, , , , , , , status] of ux)
    if (['pending', 'failed', 'blocked'].includes(status))
      problems.push(`${recordPath}: ${id} is ${status}`);
  const verification = tableRows(record, 'Verification') ?? [];
  if (!verification.length) problems.push(`${recordPath}: no verification rows`);
  for (const cells of verification) {
    const status = cells.at(-1);
    if (!STATUSES.has(status)) problems.push(`${recordPath}: ${cells[0]} has unknown status "${status}"`);
    else if (['pending', 'failed', 'blocked'].includes(status))
      problems.push(`${recordPath}: ${cells[0]} is ${status}`);
  }
  for (const cells of tableRows(record, 'Component gaps') ?? [])
    if (cells.at(-1) === 'pending') problems.push(`${recordPath}: gap "${cells[0]}" is pending`);
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const slug = args.find((arg) => !arg.startsWith('--') && args[args.indexOf(arg) - 1] !== '--stage');
  const stageIndex = args.indexOf('--stage');
  const stage = stageIndex >= 0 ? args[stageIndex + 1] : 'complete';
  if (!slug) {
    console.error('usage: check-pattern.mjs <slug> [--stage research|implement|complete] [--no-tests]');
    process.exit(2);
  }
  const root = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
  const problems = checkPattern(slug, stage, root);
  for (const problem of problems) console.error(`pattern: ${problem}`);
  if (problems.length) {
    console.error(`pattern: ${slug} does not pass --stage ${stage} (${problems.length} problems)`);
    process.exit(1);
  }
  if (stage === 'complete' && !args.includes('--no-tests')) {
    const run = spawnSync('npx', ['vitest', 'run', 'tests/unit/patterns', 'tests/unit/stories'], {
      cwd: root,
      stdio: 'inherit',
    });
    if (run.status !== 0) process.exit(run.status ?? 1);
  }
  console.log(`pattern: ${slug} passes --stage ${stage}`);
}
