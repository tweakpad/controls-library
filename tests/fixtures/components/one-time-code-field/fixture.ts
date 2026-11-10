const built = new URLSearchParams(location.search).has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel=stylesheet]')!.href = '/dist/styles.css';

const api = await import(/* @vite-ignore */ built ? '/dist/index.js' : '/src/index.ts');
for (const element of [api.TpField, api.TpOneTimeCodeField])
  api.defineElement(element.tagName, element);

/** Each slot of a code field, by id: its box, borders, radius and state markers. */
const slots = (id: string) => {
  const field = document.querySelector(`#${id}`)!;
  return [...field.shadowRoot!.querySelectorAll<HTMLElement>('.slot')].map((slot) => {
    const style = getComputedStyle(slot);
    const box = slot.getBoundingClientRect();
    return {
      text: slot.textContent?.trim() ?? '',
      width: Math.round(box.width),
      height: Math.round(box.height),
      left: Math.round(box.left),
      borders: [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth,
      ].join(' '),
      radius: style.borderTopLeftRadius,
      background: style.backgroundColor,
      shadow: style.boxShadow,
      outline: style.outlineStyle,
      active: slot.hasAttribute('data-active'),
    };
  });
};

Object.assign(window, { slots });
document.documentElement.toggleAttribute('data-ready', true);
