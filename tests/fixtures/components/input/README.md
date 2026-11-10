# Input checks (Chrome DevTools MCP)

Open `/tests/fixtures/components/input/` on the Vite server (`npm run dev`); append `?built` after
`npm run build` to load the built package. `window.reveal(id)` returns a revealable Input's state
(editor type, Toggle name, pressed state, padding and boxes), `window.hints()` the keyboard hints of
each native editor and `window.submits` the values of each submitted form.

## Reveal

1. `#password` shows a Toggle inside the editor's box at the inline end, named "Show password",
   unpressed, with the eye icon; the editor reserves its room (`paddingEnd`) and the boxes do not
   overlap the text area. Type a long value: it never runs under the Toggle.
2. Press the Toggle: the editor type becomes `text`, `aria-pressed="true"`, the icon is the
   crossed eye, the name stays "Show password", the value and selection are unchanged. Press
   again to hide.
3. Reveal, then press Sign in with both fields filled: the value is hidden again and the values
   are submitted once. Reveal, then press Reset: hidden again.
4. `#grouped` inside an Input group keeps its Toggle at the end of the group's editor.
5. `#disabled` has a disabled Toggle and stays hidden; `#readonly` can reveal its value;
   `#localized` is named "Mostrar contraseña"; `#text` renders no Toggle.
6. Tab order on `#password`: editor, Toggle, then the next control. Space or Enter on the Toggle
   switches it.

## Keyboard hints

`hints()` reports `enterkeyhint="next"` on `#email`, `"go"` on `#password`, `inputmode="decimal"`
and `enterkeyhint="done"` on `#amount`, `inputmode="numeric"` on `#override` (its host property
wins) and `enterkeyhint="send"` on the `#notes` Text area.

Check both themes and a 400px viewport.
