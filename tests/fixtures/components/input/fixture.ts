const params = new URLSearchParams(location.search);
const built = params.has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel=stylesheet]')!.href = '/dist/styles.css';

const api = await import(/* @vite-ignore */ built ? '/dist/index.js' : '/src/index.ts');
// Fields and controls first: a Form reaches its Fields as soon as it is defined.
for (const element of [
  api.TpField,
  api.TpInput,
  api.TpInputGroup,
  api.TpTextArea,
  api.TpButton,
  api.TpForm,
])
  api.defineElement(element.tagName, element);

// An explicit host property wins over the forwarded attribute.
const override = document.querySelector<HTMLElement & { hostProperties: object }>('#override')!;
override.hostProperties = { inputmode: 'numeric' };

const submits: unknown[] = [];
const form = document.querySelector<HTMLElement & { onFormSubmit: unknown }>('#reveal-form')!;
form.onFormSubmit = (values: unknown) => submits.push(values);

type Revealable = HTMLElement & { revealed: boolean; inputElement: HTMLInputElement | null };
/** The editor and Toggle state of a revealable Input, by id. */
const reveal = (id: string) => {
  const input = document.querySelector<Revealable>(`#${id}`)!;
  const toggle = input.shadowRoot?.querySelector<HTMLElement>('[part~="input-reveal"]') ?? null;
  const control = toggle?.shadowRoot?.querySelector('button') ?? null;
  const editor = input.inputElement;
  return {
    revealed: input.revealed,
    editorType: editor?.type ?? null,
    toggle: !!toggle,
    name: control?.getAttribute('aria-label') ?? toggle?.getAttribute('aria-label') ?? null,
    pressed: control?.getAttribute('aria-pressed') ?? null,
    disabled: control ? (control as HTMLButtonElement).disabled : null,
    tabbable: control ? control.tabIndex >= 0 : null,
    paddingEnd: editor ? getComputedStyle(editor).paddingInlineEnd : null,
    editorWidth: editor ? Math.round(editor.getBoundingClientRect().width) : null,
    toggleBox: toggle
      ? (({ left, right, top, bottom }) => ({ left, right, top, bottom }))(
          toggle.getBoundingClientRect(),
        )
      : null,
    editorBox: editor
      ? (({ left, right, top, bottom }) => ({ left, right, top, bottom }))(
          editor.getBoundingClientRect(),
        )
      : null,
  };
};
/** The keyboard hints each native editor carries. */
const hints = () =>
  Object.fromEntries(
    ['email', 'password', 'amount', 'override', 'notes'].map((id) => {
      const editor = document.querySelector<Revealable>(`#${id}`)!.inputElement;
      return [
        id,
        {
          inputmode: editor?.getAttribute('inputmode') ?? null,
          enterkeyhint: editor?.getAttribute('enterkeyhint') ?? null,
          autocomplete: editor?.getAttribute('autocomplete') ?? editor?.autocomplete ?? null,
        },
      ];
    }),
  );

Object.assign(window, { reveal, hints, submits });
