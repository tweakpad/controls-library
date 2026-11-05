/* Color gradient input fixture bootstrap. Driven only through Chrome DevTools MCP (see README.md). */
const built = new URLSearchParams(location.search).has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]')!.href = '/dist/styles.css';
await import(/* @vite-ignore */ built ? '/dist/register.js' : '/src/register.ts');
await import(/* @vite-ignore */ built ? '/dist/register/widgets.js' : '/src/register/widgets.ts');
const checks = await import('./api.ts');

await customElements.whenDefined('tp-color-gradient-input');
for (const element of document.querySelectorAll<HTMLElement & { updateComplete: Promise<unknown> }>(
  'tp-color-gradient-input',
))
  await element.updateComplete;
Object.assign(window, { colorGradientInputAPI: checks });
document.documentElement.dataset.fixtureReady = '';
