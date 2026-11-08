import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { parseDoc } from '../dist/docs/index.js';

// Build first. These are markup/layout probes; preview scripts run only with ?interactive.
const cases = [];
for (const file of readdirSync('docs', { recursive: true }).filter((file) =>
  file.endsWith('.mdx'),
)) {
  const page = parseDoc(readFileSync(`docs/${file}`, 'utf8'), file.replace('.mdx', ''));
  for (const preview of page.previews)
    if (/<tp-(card|dialog|alert-dialog|drawer|form)\b/u.test(preview.code))
      cases.push({ file, title: preview.title, code: preview.code, script: preview.script });
}
mkdirSync('tmp/component-verification/surface-footer', { recursive: true });
writeFileSync('tmp/component-verification/surface-footer/cases.json', JSON.stringify(cases));
console.log(`surface-footer: ${cases.length} published markup probes indexed`);
