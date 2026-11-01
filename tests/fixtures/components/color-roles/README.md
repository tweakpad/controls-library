# Color roles tuner

Served by the Vite dev server (`npm run dev`) and opened in Chrome. Append `?built` to load the
built package.

`http://localhost:5173/tests/fixtures/components/color-roles/`

- The side panel edits the library's color roles as the preview resolves them, for the theme and
  the appearance (`default` or `flat`) the preview shows. The theme switcher and the Appearance
  toggle set both; each text role shows its contrast on its surface, and the control fill shows its
  contrast on the page.
- Groups:
  - Solid fills: each role and its foreground.
  - Status tints: `<role>-subtle`, `<role>-subtle-foreground` and `<role>-border`.
  - Surfaces and lines: background, card, muted, `control`, `control-strong`, `border`, `edge`,
    `input` and `ring`.
- Roles derived from another are restated on the preview, so a tuned role carries into them. For
  example, a new `destructive` changes its tint, text tone and edge.
- The preview shows every component that paints these roles, in the chosen appearance.
- "Result" is the tuning as CSS: values edited in the default appearance on `:root`, values edited
  in the flat appearance under `[appearance='flat']`, each as `light-dark(light, dark)`. The tuning
  stays in this browser until "Reset to library values".
- `colorRolesAPI` exposes `overrides()`, `appearance()`, `scheme()`, `role(name, scheme?)`,
  `ratio(text, fill)` and `css()`.
