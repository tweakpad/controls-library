# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Toggle (`tp-toggle`); Toggle Group (`tp-toggle-group`) items through the same recipe.
- Requested work / claim: bounded fix of tweakpad/ui#30: the pressed state reads at a glance on any surface, and hover stays distinct from pressed.
- Scope source: user request 2026-11-01 ("sure lets do it" after the #30 review); paint chosen by the user: violet tint with a primary edge in the default appearance, solid primary in flat.
- In-scope changes and existing gaps: pressed paint of both variants, its hover, the three `pressed*` color roles, their flat values, docs and tuner. Behavior unchanged.
- Repository baseline / unrelated changes: `development` at b69daa2, clean tree.
- Live project / document IDs and revisions: UI Library `prj_c5a403a0-…`, head f826d63; Component Library §16.9 Toggle, §16.10 Toggle group; Foundation §13.6 Toggle. No contract governs pressed paint (presentation is library-owned), so no amendment.
- Owning contracts / dependencies / vocabulary: §16.9 Toggle `pressed` state marker; library color-role set in `src/styles.css`.
- Local reference evidence: `specification/external/ui/apps/v4/registry/styles/style-{nova,luma,vega}.css` `.cn-toggle` paint `aria-pressed:bg-muted` and `hover:bg-muted` alike; `new-york-v4/ui/toggle.tsx` `data-[state=on]:bg-accent text-accent-foreground`, hover `bg-muted`.
- Tool readiness: direct Spec Blocks MCP and Chrome DevTools MCP available.
- Browser / server / build under test: Chrome via DevTools MCP; Vite dev server on sources (port 5191).
- Evidence directory: `tmp/component-verification/toggle/pressed/` (verification page; screenshots in session; local only).
- Durable verification fixtures / served URLs: `tests/fixtures/components/color-roles/` (tuner now edits `pressed`, `pressed-foreground`, `pressed-border`).
- Evidence availability to the next agent: local only.

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | Pressed paint, default appearance: accent fill, accent-foreground content, inset primary edge | §16.9 `pressed` marker | new-york-v4 `data-[state=on]:bg-accent` | `recipes/core/toggle.ts` `&[aria-pressed="true"]` with roles `pressed`, `pressed-foreground`, `pressedEdge.ring` | styling.md Lines and fills | V-01, V-02 | passed | edge 4.97:1 on popover (dark), 4.54:1 (light) |
| C-02 | Pressed paint, flat appearance: primary fill, primary-foreground content, no edge | §16.9 | — | `FLAT_ROLES`, `[appearance='flat']` | styling.md Flat appearance table | V-01, V-02 | passed | fill 4.97 / 4.54:1 |
| C-03 | Hover of an unpressed Toggle stays the neutral `control-strong` layer | §16.9 | style-nova `hover:bg-muted` | `variantPresentation` unchanged | — | V-03 | passed | Moon hover grey, pressed violet |
| C-04 | Hover/focus of a pressed Toggle deepens its own fill, neutral layer hidden | §16.9 | — | `recipes/toggle.ts` `pressedInteraction` | — | V-03 | passed | bg mixed 10% toward `pressed-foreground`, `::before` opacity 0 |
| C-05 | Pressed edge clear of joined seams and of the focus outline | §16.10 joined | — | inset `box-shadow` ring (focus is `outline`) | — | V-04, V-05 | passed | joined "Week" keeps a full ring |
| C-06 | Roles registered and documented as tokens | — | — | `TOKEN_FAMILIES.color`, `token-catalog.ts` pairs, line preview, descriptions | styling.md | V-06 | passed | unit tests |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | Reference preset paints pressed and hover alike (`bg-muted`); library hover layer was stronger than pressed | Toggle, Toggle Group | library-owned pressed roles | user decision 2026-11-01 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: unchanged; paint in `recipes/core/toggle.ts` and `recipes/toggle.ts`.
- Supported exports / registration / constituent API impact: new `pressedEdge` edge kind (internal); three CSS color roles.
- Framework bindings: public element surface unchanged (no property, event or slot change); not regenerated.
- Public vocabulary / tokens / parts / presentation review: `pressed` matches the Toggle state name; triplet shape follows `<role>`, `<role>-foreground`, `<role>-border`.

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Pressed paint | `.cn-toggle` `aria-pressed` | `toggleCoreAppearance` | repaired in place | Toggle, Toggle Group items / V-01, V-04 |
| Edge line | — | `shared/edges.ts` kinds (guarded) | new `pressedEdge` kind; guard regex extended | Toggle / V-06 |
| Appearance roles | — | `FLAT_ROLES`, `[appearance]` rules, `--_tp-*-default` copies | three roles added to each | every appearance region / V-02 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| `toggle` pressed | new-york-v4 / nova | `toggle.tsx` `data-[state=on]:bg-accent`; nova `aria-pressed:bg-muted` | `toggleCoreAppearance` | accent as in new-york plus a primary edge for 3:1 | V-01 |
| `toggle` hover | nova | `hover:bg-muted` | `variantPresentation` control-strong layer | unchanged | V-03 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| verification page | toolbar, card, groups, icons | `tp-toggle`, `tp-toggle-group`, `tp-card`, `tp-separator`, `tp-icon` | V-01…V-05 | toolbar shell and canvas are native layout standing in for a floating panel |
| color-roles tuner | role rows | existing tuner pairs | V-06 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02; visual | verification page, dark: icon, ghost, outline, disabled, groups, card, floating toolbar over a canvas | pressed reads at a glance in both appearances | as expected | DevTools screenshot | passed | Seen in the session screenshot. |
| V-02 | C-01, C-02; visual | same page, light scheme | same | as expected | DevTools screenshot | passed | Seen in the session screenshot. |
| V-03 | C-03, C-04; real input | hover unpressed Moon, then pressed Sun | grey hover on Moon; Sun deepens, layer hidden | as expected | DevTools hover + computed style | passed | Real pointer hover. |
| V-04 | C-05; visual | `spacing = 0` outline groups | pressed member keeps a full ring inside the seams | as expected | DevTools screenshot | passed | Default and flat. |
| V-05 | C-05; keyboard | Tab to the pressed Daylight toggle | `:focus-visible` outline 2px plus the 1px inset ring | as expected | DevTools press_key + computed style | passed | Real key press. |
| V-06 | C-06; regression | `npx vitest run`, typecheck, stylelint, eslint | pass | 6190 passed; clean | commands | passed | Toggle golden updated; diff limited to the pressed rules. |
| V-07 | C-01, C-02; accessibility automation | axe on the verification page, dark and light | no component violations | none after settle; only page-structure rules of the scratch page | injected axe-core | passed | The first light pass sampled mid colour transition; the re-run after settle was clean. |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | Toggle Group items paint through `toggleCoreAppearance`; edge from `shared/edges.ts` |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | V-01, V-02 |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | ghost, outline, icon sizes, disabled, joined and spaced groups, both appearances |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec searched (no pressed-paint contract); scope from #30 and the user's choice. |
| 1. Capability mapping                 | passed | C-01…C-06. |
| 2. Architecture and composition reuse | passed | Edge kind, appearance role lists and recipes extended in place. |
| 3. Behavior                           | not applicable | Paint-only change; no state, event or input path changed. |
| 4. Presentation and customization     | passed | Roles overridable per theme and appearance; tuner edits them (V-06). |
| 5. Accessibility                      | passed | V-05, V-07; ARIA unchanged. |
| 6. Visual and interaction inspection  | passed | V-01…V-05. |
| 7. Documentation and demo reuse       | passed | `docs/styling.md` roles and flat table; Toggle page unchanged. |
| 8. Regression and reconciliation      | passed | V-06. |

## Documentation synchronization

- [x] `docs/components/toggle.mdx` needs no change (no paint prose).
- [x] JSDoc unchanged; no public field changed.
- [x] `elementDependencies` unchanged.
- [x] Verification page kept outside the docs (`tmp/`).
- [x] Previews reuse library components.
- [x] Preview code unchanged.

## Completion / handoff

- Change summary: pressed Toggles paint from new `pressed`, `pressed-foreground` and `pressed-border` roles: accent tint with an inset primary edge by default, solid primary in flat; pressed hover deepens its own fill.
- Actual delivery claim: Toggle and Toggle Group pressed and hover paint.
- Record checker: see the final report.
- Non-browser checks: unit tests, typecheck, stylelint, eslint.
- Behavior: unchanged.
- Accessibility: V-05, V-07; no screen-reader run.
- Visual/customization/motion inspection: V-01…V-04.
- Documentation and demo composition reuse: gate 7.
- Shared-consumer regressions / package boundaries: V-06.
- Required failures or blocked checks: none.
- Older out-of-scope gaps: none recorded.
- Changed source revisions / reopened gates: none.
