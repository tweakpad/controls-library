const built = new URLSearchParams(location.search).has('built');
if (built) document.querySelector('#theme').href = '/dist/styles.css';
await import(built ? '/dist/register.js' : '/src/register.ts');
await import(built ? '/dist/register/widgets.js' : '/src/register/widgets.ts');
await Promise.all(
  ['tp-native-select', 'tp-input', 'tp-text-area', 'tp-easing-editor'].map((tag) =>
    customElements.whenDefined(tag),
  ),
);
await Promise.all(
  [...document.querySelectorAll('tp-native-select, tp-input, tp-text-area, tp-easing-editor')].map(
    (el) => el.updateComplete,
  ),
);
window.selectionSubmissions = [];
document.querySelector('#form').addEventListener('submit', (event) => {
  event.preventDefault();
  window.selectionSubmissions.push([...new FormData(event.currentTarget)]);
});
window.selectionFixtureReady = true;
