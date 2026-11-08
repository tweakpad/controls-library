/** Run in the target docs page through Chrome DevTools MCP; never a browser driver. */
export async function reviewTextEditorDocs() {
  const editors = [...document.querySelectorAll('tp-text-editor')];
  const deadline = performance.now() + 20000;
  while (editors.some((editor) => editor.getAttribute('data-status') !== 'ready') && performance.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 50));
  const failures = [];
  if (editors.length !== 13) failures.push(`Expected 13 editors, found ${editors.length}`);
  const states = editors.map((editor) => {
    const bounds = editor.getBoundingClientRect();
    const frame = editor.closest('.tp-docs-example-preview, .preview__canvas');
    const canvas = frame?.getBoundingClientRect();
    const status = editor.getAttribute('data-status');
    if (status !== 'ready') failures.push(`${editor.label}: ${status}`);
    if (!canvas || bounds.left < canvas.left - 2 || bounds.right > canvas.right + 2)
      failures.push(`${editor.label}: outer overflow`);
    return { id: editor.id, label: editor.label, status, features: editor.features.map((feature) => feature.name), width: Math.round(bounds.width) };
  });
  const markdown = document.querySelector('#text-editor-markdown');
  if (document.querySelector('#text-editor-markdown-output').code !== markdown.getContent('markdown')) failures.push('Markdown output differs');
  const embed = document.querySelector('#text-editor-custom-blocks').shadowRoot.querySelector('iframe');
  if (!embed?.title || !embed.hasAttribute('sandbox')) failures.push('Missing sandboxed titled embed');
  if (!document.querySelector('#text-editor-tables').getContent('html').includes('<table')) failures.push('Missing table content');
  if (document.querySelector('#text-editor-core').features.length) failures.push('Core unexpectedly loads features');
  return { viewport: innerWidth, editors: states, failures };
}
