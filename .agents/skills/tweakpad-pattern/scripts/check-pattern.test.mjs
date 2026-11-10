import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkPattern, frontmatter, previewSources, tableRows } from './check-pattern.mjs';

const table = (heading, headers, rows) =>
  `## ${heading}\n\n| ${headers.join(' | ')} |\n| ${headers.map(() => '--').join(' | ')} |\n${rows
    .map((row) => `| ${row.join(' | ')} |`)
    .join('\n')}\n\n`;

function record({ ux = 'applied', verification = 'passed', evidence = '`autocomplete="username"`' } = {}) {
  return (
    '# Demo pattern record\n\n' +
    table('Delivery', ['Field', 'Value'], [['Pattern', 'Demo']]) +
    table(
      'UX standards',
      ['ID', 'Guidance', 'Source', 'Retrieved', 'Rule', 'Applied in', 'Evidence in page', 'Status'],
      [['U-01', 'Sign-in guidance', 'https://example.org/sign-in', '2026-11-10', 'Username autocomplete', 'Sign in', evidence, ux]],
    ) +
    table(
      'Flow coverage',
      ['Flow', 'Screen', 'Empty', 'Invalid', 'Server error', 'Pending', 'Success / next'],
      [['Sign in', 'Sign in', 'errors', 'format', 'alert', 'spinner', 'app']],
    ) +
    table('Composition map', ['Region', 'Element', 'Page'], [['Frame', '`tp-card`', 'components/card']]) +
    table('Component gaps', ['Gap', 'Resolution', 'Status'], [['none', 'none', 'not applicable']]) +
    table('Verification', ['ID', 'Scenario', 'Expected', 'Actual', 'Evidence', 'Status'], [
      ['V-01', 'renders', 'no undefined', 'none', 'evaluate', verification],
    ])
  );
}

const page = () => `---
title: Demo
description: A demo.
category: Demo
components:
  - card
  - input
---

## Sign in

Signs in.

<Preview title="Sign in" code={\`<tp-card><tp-input autocomplete="username"></tp-input></tp-card>\`} script={\`const x = \\\`a\\\`;\`} />
`;

const entry = (classes) =>
  `${classes.map(([name, folder]) => `import { ${name} } from '../components/${folder}/${folder}.js';`).join('\n')}
import { defineElement } from '../foundation/define.js';

${classes.map(([name]) => `defineElement(${name}.tagName, ${name});`).join('\n')}
`;

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'pattern-check-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const complete = (overrides = {}) => ({
  'plans/patterns/demo/record.md': record(),
  'docs/patterns/demo.mdx': page(),
  'src/patterns/demo.ts': entry([
    ['TpCard', 'card'],
    ['TpInput', 'input'],
  ]),
  'src/components/card/card.ts': "export class TpCard { static tagName = 'tp-card'; }",
  'src/components/input/input.ts': "export class TpInput { static tagName = 'tp-input'; }",
  'src/stories/patterns/demo.mdx': '<PatternPage id="demo" />',
  ...overrides,
});

test('reads tables, previews and frontmatter', () => {
  assert.deepEqual(tableRows('## A\n\n| x | y |\n| - | - |\n| 1 | 2 |\n', 'A'), [['1', '2']]);
  assert.deepEqual(previewSources(page()), [
    '<tp-card><tp-input autocomplete="username"></tp-input></tp-card>',
    'const x = `a`;',
  ]);
  assert.deepEqual(frontmatter(page()).components, ['card', 'input']);
});

test('a complete pattern passes every stage', () => {
  const root = project(complete());
  for (const stage of ['research', 'implement', 'complete'])
    assert.deepEqual(checkPattern('demo', stage, root), [], stage);
});

test('research needs the record and sourced rows, not the page', () => {
  const root = project({ 'plans/patterns/demo/record.md': record() });
  assert.deepEqual(checkPattern('demo', 'research', root), []);
  assert.match(checkPattern('demo', 'implement', root).join('\n'), /docs\/patterns\/demo\.mdx is missing/);
  assert.match(checkPattern('demo', 'research', project({})).join('\n'), /record\.md is missing/);
});

test('evidence must occur in the page', () => {
  const root = project(complete({ 'plans/patterns/demo/record.md': record({ evidence: '`autocomplete="email"`' }) }));
  assert.match(checkPattern('demo', 'implement', root).join('\n'), /evidence .* does not occur/);
});

test('the entry defines exactly the markup tags', () => {
  const root = project(complete({ 'src/patterns/demo.ts': entry([['TpCard', 'card']]) }));
  assert.match(checkPattern('demo', 'implement', root).join('\n'), /defines \[tp-card\] but the markup uses \[tp-card, tp-input\]/);
});

test('complete refuses pending research and verification', () => {
  const root = project(complete({ 'plans/patterns/demo/record.md': record({ ux: 'pending', verification: 'pending' }) }));
  assert.deepEqual(checkPattern('demo', 'implement', root), []);
  const problems = checkPattern('demo', 'complete', root).join('\n');
  assert.match(problems, /U-01 is pending/);
  assert.match(problems, /V-01 is pending/);
});

test('template placeholders and bad sources fail research', () => {
  const template = record()
    .replace('https://example.org/sign-in', '<https://…>')
    .replace('2026-11-10', 'last week');
  const problems = checkPattern('demo', 'research', project({ 'plans/patterns/demo/record.md': template })).join('\n');
  assert.match(problems, /placeholders/);
  assert.match(problems, /https URL/);
  assert.match(problems, /YYYY-MM-DD/);
});
