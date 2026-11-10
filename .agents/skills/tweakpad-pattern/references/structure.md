# Pattern page structure

## Source

`docs/patterns/<slug>.mdx`, read by `parsePattern` (`src/docs/pattern.ts`), which shares the body
grammar of component pages (`readBody` in `src/docs/parse.ts`).

```mdx
---
title: Auth
description: One sentence: what the pattern covers and what it guarantees.
category: Authentication
components:
  - card
  - button
---

## Sign in

One or two sentences on what this flow does.

<Preview width="3" title="Sign in" align="stretch" code={`…markup…`} script={`…script…`} />

### Set a new password

<Preview … />
```

- Frontmatter keys are exactly `title`, `description`, `category`, `components`. Write
  `components` as a block list; a long inline list is wrapped by formatters and stops parsing.
- `components` equals, as a set, the pages that document the elements the markup uses (a page
  owns its `tag` and its `parts`). The docs build and `tests/unit/patterns` fail otherwise.
- The body: `##` flows and `###` steps, prose, `<Preview>`, `<Code>`, `<Keys>`. No module
  statements, no hero before the first heading.
- Previews: `code` is the copyable markup, `script` its behavior; scripts import only from the
  specifiers the preview runtime allows (`@tweakpad/ui`, `@tweakpad/ui/icons/<name>`…). The
  pattern's own entry is never imported in a script: the renderings show it as the import line.
- Links use the app's real routes (`/sign-up`); the preview runtimes keep them from navigating
  the documentation page.

## Renderings

| Part | Storybook (`Patterns/<Title>`) | Website (`/patterns/<slug>`) |
| ---- | ------------------------------ | ---------------------------- |
| Header | `Title`, description | page header |
| Built with | chips linking to each component's Docs page | chips linking to `/docs/<page>` |
| Import line | `Source` block with `import '@tweakpad/ui/patterns/<slug>';` | `Code.astro` |
| Flows | `DocContent` with standalone previews (framed preview, source below) | `Content` with `Preview`, `Code`, `Keys` |

The Storybook page is an MDX docs-only entry (`src/stories/patterns/<slug>.mdx`) with no story;
its previews render without Storybook's Canvas, which needs a story.
