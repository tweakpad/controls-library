# Auth pattern entry check (Chrome DevTools MCP)

Open `/tests/fixtures/patterns/auth/` on the Vite server (`npm run dev`). The page holds every
screen of the Auth pattern and imports only `src/patterns/auth.ts`. Once `html[data-ready]` is
set, `window.undefinedElements` must be `[]`: the entry defines every element the markup uses
without the main `register` module.
