---
name: tweakpad-pattern
description: 'Build, change or review a Tweakpad pattern: a real-case template (sign in, settings, checkout…) composed only from library components, documented on one page in docs/patterns/<slug>.mdx that Storybook (Patterns section) and tweakpad.com render, shipped with a registration entry @tweakpad/ui/patterns/<slug>, and grounded in established UX practice recorded in plans/patterns/<slug>/record.md. Enforces the research gate, flow and state coverage, component reuse, the entry/markup agreement and browser verification.'
---

# Tweakpad patterns

**Patterns are not toys but real case templates that consider real use cases.** A pattern is the
screen a product team would ship: complete flows, every state a user meets (empty, invalid,
server error, pending, success and the next step), real copy and real wiring, composed only from
library components. When the industry has settled how a screen works, the pattern follows that
standard and does not invent a "cool composition". Sign in is highly standardized; a dashboard
card leaves more room. The research gate decides which, per pattern, and records why.

A pattern adds no elements and no API. It ships two things:

- **Copyable markup and script** on its page, one preview per screen.
- **A registration entry**, `@tweakpad/ui/patterns/<slug>`, that defines exactly the elements the
  markup uses. `import '@tweakpad/ui/patterns/auth';` and paste the markup.

When a pattern needs behavior a component lacks (a password reveal, a keyboard hint), the gap is
closed in the component through the tweakpad-component skill and a specification amendment, never
with a local part or a script workaround in the pattern.

## Where things live

| What | Where |
| ---- | ----- |
| The page (authored) | `docs/patterns/<slug>.mdx` |
| Registration entry | `src/patterns/<slug>.ts` → `dist/patterns/<slug>.js`, export `./patterns/*` |
| Record (research, flows, gaps, verification) | `plans/patterns/<slug>/record.md`, from `assets/pattern-record.md` |
| Storybook rendering | `src/stories/patterns/<slug>.mdx` (`<Meta title="Patterns/<Title>" />` + `<PatternPage id="<slug>" />`), `.storybook/docs-pattern.mdx` |
| Parser and index | `parsePattern` (`src/docs/pattern.ts`), `dist/docs.json` `patterns` (`scripts/docs/build.mjs`) |
| Website rendering | `src/pages/patterns/[slug].astro` (site repo), from the installed package |
| Entry-only browser check | `tests/fixtures/patterns/<slug>/` |
| Guards | `tests/unit/patterns/patterns.test.ts`, `scripts/check-pattern.mjs` |

## Page structure

Read [structure.md](references/structure.md). In short:

1. Frontmatter: exactly `title`, `description`, `category` and `components` (a block list of
   the component page slugs it is built with, in display order).
2. No hero, no Usage, no Keyboard, no API. The renderings add the header, the "Built with"
   chips and the import line.
3. Each `##` is a flow (Sign in, Create account…) with one sentence or two of prose and at least
   one Preview; a `###` is a step of that flow reached separately (Set a new password).
4. Each Preview is one screen: a Card or the product surface it lives in, with its script.
   Steps inside one flow switch screens in that flow's script (`hidden`).
5. Ids are unique across the page and prefixed by the pattern (`auth-sign-in-…`).

## Gates

Work through them in order. A gate passes on evidence in the record, not on intention.

### 1. UX standards research (before any markup)

- Find the established guidance for the pattern's screens: platform guidance (web.dev, Chrome,
  Apple, Material, Fluent), usability research (NN/g, Baymard), government design systems
  (GOV.UK and similar), security guidance (OWASP, NIST) and WCAG. Read the sources; a search
  summary is not a source. [ux-standards.md](references/ux-standards.md) lists the baseline per
  domain.
- Every rule the pattern follows is a row of the record's UX standards table: source URL,
  retrieval date, the rule, where it applies and an **evidence** substring that must appear in the
  page's markup or script. `check-pattern.mjs` fails a row whose evidence is missing.
- Third-party marks (sign-in providers, payment networks) follow their owners' brand guidelines,
  read from the owners' pages; ship only official artwork with a notice, and record each rule.
- When no standard exists, record that and the reasoning for the composition.

### 2. Flows and states

Fill the record's flow coverage table: for every screen, what empty, invalid, server error,
pending and success or next step look like. Copy never reveals what the server must keep private
(whether an account exists, which credential was wrong). Pending states keep the submitter
focusable. Errors are announced and move focus where the user acts next.

### 3. Composition reuse

Use library components for every region; record the composition map. No native substitutes
(`<input>`, `<button>`, `<form>`), no local card, panel or spacing styles beyond token layout on
the composition (`inline-size`, `flex`). A missing capability is a component gap: list it,
close it through the component skill and the spec, or record why it stays open.

### 4. Entry

`src/patterns/<slug>.ts` imports `../foundation/define.js` and component classes only and defines
exactly the tags the markup uses, Fields and controls before a Form. `tests/unit/patterns` and
the docs build check it; the entry-only fixture proves it in Chrome.

### 5. Accessibility

Names and roles in the accessibility tree, label wiring, `autocomplete`, announced errors, focus
after errors and step changes, Enter submits, paste and autofill allowed, keyboard only, both
themes, compact density, a 320px viewport.

### 6. Browser verification

Run the scenarios of [verification.md](references/verification.md) with Chrome DevTools MCP on
the Storybook page and the entry-only fixture. Real clicks, typing and keys for the main paths;
scripted checks are recorded as API checks, not as input. Record each as a V-row.

Run the checker at each boundary:

```sh
node .agents/skills/tweakpad-pattern/scripts/check-pattern.mjs <slug> --stage research
node .agents/skills/tweakpad-pattern/scripts/check-pattern.mjs <slug> --stage implement
node .agents/skills/tweakpad-pattern/scripts/check-pattern.mjs <slug> --stage complete
```

## Writing

- Pages are standalone: no citations, guideline names or design rationale on the page. The record
  holds the sources.
- Original sample content: an invented product, people and data. Provider names appear only on
  their own sign-in buttons.
- Prose states what each flow does in one or two sentences; the previews carry the rest.
- Scripts stand in for requests with a timer and say so in a comment; they never navigate the
  docs page (a stand-in that would succeed refuses instead).

## Never

- Never invent a novel layout for a standardized screen.
- Never add a pattern element, property or event; patterns are markup.
- Never add a widget or a companion module to a pattern entry, or a pattern to the main entries.
- Never reproduce a component's look locally to cover a gap.
- Never ship a third-party mark that is not the owner's official artwork.
- Never run Prettier over `docs/**/*.mdx`; it flattens script indentation.
