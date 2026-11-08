import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseDoc } from '../dist/docs/index.js';
import postcss from 'postcss';

const output = 'plans/use-case-styles';
const files = (root) =>
  readdirSync(root, { recursive: true })
    .filter((p) => /\.(mdx?|[cm]?[jt]sx?|css)$/u.test(p))
    .map((p) => `${root}/${p}`)
    .sort();
const line = (source, offset) => source.slice(0, offset).split('\n').length;
function balanced(source, start) {
  let depth = 0,
    quote = '',
    escaped = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if ('"\'`'.includes(c)) {
      quote = c;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  return source.length;
}
function valueEnd(source, start) {
  if (source.startsWith('${', start)) return balanced(source, start + 1);
  const quote = source[start];
  if (!'"\'`'.includes(quote)) return source.slice(start).search(/[\s>]/u) + start;
  for (let i = start + 1; i < source.length; i++) {
    if (source[i] === '\\') {
      i++;
      continue;
    }
    if (source.startsWith('${', i)) {
      i = balanced(source, i + 1) - 1;
      continue;
    }
    if (source[i] === quote) return i + 1;
  }
  return source.length;
}
function category(property, target) {
  if (property.startsWith('--')) return 'token override — presentation/configuration review';
  if (
    /^(color|background.*|border.*|box-shadow|font.*|line-height|letter-spacing|text-shadow|fill|stroke.*|opacity|filter|appearance|accent-color)$/u.test(
      property,
    )
  )
    return target.startsWith('tp-')
      ? 'component presentation override — review required'
      : 'content appearance — review required';
  if (/^(display|visibility|overflow.*|clip.*|mask.*)$/u.test(property) && target.startsWith('tp-'))
    return 'component structure/visibility — review required';
  if (
    /^(?:display|overflow.*|visibility|.*size|width|height|min-width|max-width|min-height|max-height|aspect-ratio|flex.*|grid.*|gap|row-gap|column-gap|align.*|justify.*|place.*|margin.*|position|inset.*|top|left|right|bottom|transform|translate|rotate|z-index)$/u.test(
      property,
    )
  )
    return 'layout/geometry — minimize';
  if (/^padding/u.test(property))
    return target.startsWith('tp-')
      ? 'component spacing — review required'
      : 'layout spacing — minimize';
  return 'manual review';
}
const records = [],
  units = [],
  coverage = [];
for (const file of [...files('docs'), ...files('src/stories')]) {
  const source = readFileSync(file, 'utf8');
  let page,
    previews = [];
  if (file.startsWith('docs/') && file.endsWith('.mdx')) {
    page = parseDoc(source, file.slice(5, -4));
    previews = page.previews;
    for (const p of previews) units.push({ file, owner: page.id, name: p.title, line: p.line });
  }
  const owner =
    page?.id ??
    /libraryDocs\(['"]([^'"]+)/u.exec(source)?.[1] ??
    `compositions/${file.slice(12).replace(/\.[^.]+$/u, '')}`;
  function context(offset) {
    const n = line(source, offset);
    const preview = previews.filter((p) => p.line <= n).at(-1);
    if (preview) return preview.title;
    const prefix = source.slice(0, offset);
    return (
      [
        ...prefix.matchAll(
          /(?:export\s+const\s+(\w+)|\btitle:\s*['"]([^'"\n]+)|\bexample\(\s*['"]([^'"\n]+)|^###?\s+(.+))/gmu,
        ),
      ]
        .at(-1)
        ?.slice(1)
        .find(Boolean) ?? '(file/setup/shared helper)'
    );
  }
  const startCount = records.length;
  const ranges = [];
  for (const m of source.matchAll(/(?<![\w.-])\.?style\s*=/gu)) {
    let start = m.index + m[0].length;
    while (/\s/u.test(source[start] ?? '')) start++;
    const end = valueEnd(source, start);
    const before = source.slice(0, m.index);
    const open = before.lastIndexOf('<');
    let tag = /^<([a-z][\w:-]*)\b/iu.exec(source.slice(open))?.[1];
    if (!tag || open < before.lastIndexOf('>')) {
      if (
        /\b(?:const|let|var)\s*$/u.test(before) ||
        /getComputedStyle/u.test(source.slice(start, end))
      )
        continue;
      const candidates = [...before.matchAll(/<([a-z][\w:-]*)\b/giu)];
      tag = candidates.at(-1)?.[1] ?? '(attribute fragment; resolve call sites)';
    }
    const raw = source.slice(start, end);
    const dynamic = raw.includes('${') || !/^['"]/u.test(raw);
    let declarations = [];
    if (!dynamic) {
      try {
        postcss.parse(`a{${raw.slice(1, -1)}}`).walkDecls((d) =>
          declarations.push({
            property: d.prop,
            value: d.value,
            important: d.important,
            category: category(d.prop, tag),
          }),
        );
      } catch {
        declarations = [{ property: '(parse required)', value: raw, category: 'manual review' }];
      }
    }
    records.push({
      file,
      owner,
      useCase: context(m.index),
      line: line(source, m.index),
      kind: dynamic ? 'dynamic style binding' : 'style attribute',
      target: tag,
      raw,
      declarations,
    });
    ranges.push([m.index, end]);
  }
  const patterns = [
    [
      'JS style write',
      /[\w.$!?[\]"'()-]+\.style(?:\.[\w]+\s*(?:=|\+=)|\.(?:setProperty|removeProperty)\s*\()/gu,
    ],
    [
      'presentation hook',
      /\b(?:partPresentation|partContracts|styleHook|hostProperties)\s*(?:=|:)/gu,
    ],
    ['styleMap', /\bstyleMap\s*\(/gu],
    ['style option', /(?<![\w.-])style\s*:/gu],
    ['tagged stylesheet', /\bcss`/gu],
    ['embedded stylesheet', /<style\b[^>]*>/gu],
    ['stylesheet import', /import\s+(?:[^;\n]*?from\s+)?['"][^'"\n]+\.css(?:\?[^'"]*)?['"]/gu],
  ];
  for (const [kind, pattern] of patterns)
    for (const m of source.matchAll(pattern)) {
      if (ranges.some(([a, b]) => m.index >= a && m.index < b)) continue;
      let end = source.indexOf('\n', m.index);
      if (end < 0) end = source.length;
      if (kind === 'tagged stylesheet') end = valueEnd(source, m.index + m[0].length - 1);
      else if (kind === 'embedded stylesheet') {
        const close = source.indexOf('</style>', m.index);
        if (close >= 0) end = close + 8;
      } else {
        const brace = source.indexOf('{', m.index + m[0].length);
        if (brace >= 0 && brace <= end) end = balanced(source, brace);
        else {
          const semi = source.indexOf(';', m.index);
          if (semi >= 0 && semi < end) end = semi + 1;
        }
      }
      records.push({
        file,
        owner,
        useCase: context(m.index),
        line: line(source, m.index),
        kind,
        target: 'resolve from expression',
        raw: source.slice(m.index, end),
        declarations: [],
      });
    }
  if (file.endsWith('.css'))
    records.push({
      file,
      owner,
      useCase: '(external demo stylesheet)',
      line: 1,
      kind: 'external stylesheet',
      target: 'selectors in source',
      raw: source,
      declarations: [],
    });
  coverage.push({ file, owner, previews: previews.length, records: records.length - startCount });
}
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const esc = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', '<br>');
const link = (r) => `[${r.file}:${r.line}](../../${r.file}#L${r.line})`;
const staticRecords = records.filter((r) => r.kind === 'style attribute');
const properties = new Map();
for (const r of staticRecords)
  for (const d of r.declarations) {
    const entries = properties.get(d.property) ?? [];
    entries.push({ ...r, declaration: d });
    properties.set(d.property, entries);
  }
const ranking = [...properties].sort(
  ([a, rowsA], [b, rowsB]) => rowsB.length - rowsA.length || a.localeCompare(b),
);
const declarationCount = ranking.reduce((n, [, rows]) => n + rows.length, 0);
const pages = coverage.filter((r) => r.file.startsWith('docs/') && r.file.endsWith('.mdx'));
let result = `# Use-case styles: results ranked by property usage

Baseline commit: ${revision}. Inventory of the current working-tree sources; uncommitted changes are included.
Regenerate this single report with \`node scripts/audit-use-case-styles.mjs\` using the existing built docs parser.

## Scope and counting

${coverage.length} source files, ${pages.length} published MDX pages, ${units.length} previews, ${records.length} styling sites.
${staticRecords.length} static inline attributes contain **${declarationCount} CSS declarations across ${ranking.length} properties**.

The ranking counts authored declarations in static inline attributes, not rendered instances or defects.
Documentation and story copies count separately because each snippet needs review. Repeated declarations in one attribute count separately too.
Dynamic expressions, JavaScript writes, hooks and stylesheets are included in full below but excluded from this property ranking: their resolved values and execution counts cannot be inferred reliably from source.
Equal counts are ordered alphabetically. Property spellings are preserved: logical/physical properties and shorthands/longhands are not merged.

Scope: docs MDX Preview/Code source, supplemental Markdown guides, and all src/stories source including legacy examples, shared helpers, workspace and external demo CSS.
Excluded: component implementation CSS, generated bindings, tests/fixtures, frozen documentation snapshots and website/Storybook chrome.

A **TOTAL VIOLATION** requires evidence that ordinary use-case styling supplies the component's own presentation, anatomy or normal feature behavior.
Token references do not excuse it. Explicit customization demonstrations, native content appearance and genuinely necessary layout must be distinguished.
Flags below are review candidates, not confirmed dependency defects. Never hide the same styling in a stylesheet to reduce inline counts.

## Property priority list

| Rank | CSS property | Occurrences | Docs declarations | Story declarations | Source files | Unique values |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
`;
ranking.forEach(([property, rows], i) => {
  result += `| ${i + 1} | [${esc(property)}](#property-${i + 1}) | ${rows.length} | ${rows.filter((r) => r.file.startsWith('docs/')).length} | ${rows.filter((r) => r.file.startsWith('src/stories/')).length} | ${new Set(rows.map((r) => r.file)).size} | ${new Set(rows.map((r) => r.declaration.value)).size} |\n`;
});
result +=
  '\n## Exact occurrences by property\n\nEach row retains the target element, use-case label, exact value and source location. Start at the top and work down.\n';
ranking.forEach(([property, rows], i) => {
  const values = new Map();
  for (const r of rows) {
    const value = r.declaration.value + (r.declaration.important ? ' !important' : '');
    values.set(value, (values.get(value) ?? 0) + 1);
  }
  result += `\n<a id="property-${i + 1}"></a>\n\n### ${i + 1}. ${esc(property)} — ${rows.length} occurrences\n\n`;
  result +=
    '| Value | Occurrences |\n| --- | ---: |\n' +
    [...values]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([v, n]) => `| ${esc(v)} | ${n} |`)
      .join('\n') +
    '\n\n';
  result +=
    '| Component/page or composition owner | Use case | Target | Exact value | Triage | Source |\n| --- | --- | --- | --- | --- | --- |\n';
  result +=
    rows
      .map(
        (r) =>
          `| ${esc(r.owner)} | ${esc(r.useCase)} | ${esc(r.target)} | ${esc(r.declaration.value + (r.declaration.important ? ' !important' : ''))} | ${esc(r.declaration.category)} | ${link(r)} |`,
      )
      .join('\n') + '\n';
});
const supplemental = records.filter((r) => r.kind !== 'style attribute');
result += `\n## Dynamic styles, hooks and demo stylesheets — ${supplemental.length} source sites\n\nThese sites are not in the ranked static declaration totals. Hooks nested in an assignment can appear at both boundaries; they are not separate runtime effects.\n\n`;
for (const r of supplemental)
  result += `### ${esc(r.owner)} / ${esc(r.useCase)}\n\n**${r.kind}** · target: ${esc(r.target)} · ${link(r)}\n\n~~~~~text\n${r.raw}\n~~~~~\n\n`;
result +=
  '\n## Component-by-component coverage\n\nEvery published preview is listed, including zero-match use cases. Counts are styling sites, not CSS declaration counts. Zero matches are not a component conformance pass.\n\n';
for (const p of pages) {
  result += `### ${p.owner}\n\nSource: ${p.file}\n\n| Use case | Source line | Styling sites |\n| --- | ---: | ---: |\n`;
  result +=
    units
      .filter((u) => u.file === p.file)
      .map(
        (u) =>
          `| ${esc(u.name)} | ${u.line} | ${records.filter((r) => r.file === p.file && r.useCase === u.name).length} |`,
      )
      .join('\n') + '\n\n';
}
result +=
  '\n## Complete source coverage\n\nShared helpers and imported styling are listed at their source; names in story/helper files are nearest source labels, not proven runtime reachability.\n\n| Source | Styling sites |\n| --- | ---: |\n' +
  coverage.map((c) => `| ${c.file} | ${c.records} |`).join('\n') +
  '\n';
result += `
## Review procedure and limits

For each occurrence: remove redundancy; retain only with a concrete necessary purpose; replace using an existing library API/composition; or repair the component/shared owner.
Trace nested components individually. Confirm presentation dependencies with source ownership and rendered removal checks before declaring a TOTAL VIOLATION.

Priority starting points beyond frequency alone: Plot's ordinary examples hide plot-label through partPresentation; Scroll Area's hero supplies border/radius framing; Aspect Ratio repeats host overflow despite internal clipping. These need ownership decisions. Avatar's custom-shape example explicitly demonstrates customization, whereas Tabs' max width and centering are composition geometry. None is automatically a missing-default-paint defect.

Extraction handles quoted attributes and balanced template bindings. Static declarations are parsed with PostCSS. JavaScript records preserve mutation/hook expressions or their source line; dynamic expressions and imported helper/class reachability require follow-up. Stylesheet source is preserved in full and not mislabeled as inline declarations.
No builds, browser runs, servers or example execution were performed to produce this report.
`;
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/RESULTS.md`, result);
console.log(
  JSON.stringify(
    {
      file: `${output}/RESULTS.md`,
      properties: ranking.length,
      declarations: declarationCount,
      staticAttributes: staticRecords.length,
      supplementalSites: supplemental.length,
      top: ranking.slice(0, 10).map(([property, rows]) => ({ property, count: rows.length })),
    },
    null,
    2,
  ),
);
