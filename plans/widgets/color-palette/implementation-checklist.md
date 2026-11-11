# Component implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Color palette, `tp-color-palette` (internal constituent `tp-color-palette-list`); companion entry `@tweakpad/ui/color-palette` and sub-entries `@tweakpad/ui/color-palette/collections/<id>`
- Requested work / claim: new widget (user request 2026-11-11): swatch collections of hundreds of colors in a gapless grid, gradients and combinations, condensed and expanded forms, JSON collection documents with attribution, built-in default and reduced collections, other collections loaded on demand; revision (user 2026-11-11): no search, mode Tabs instead of toggle buttons, no expand, condensed/normal is the library density mode, highlight is one 1px line in the fill's contrast color; then (user 2026-11-11): "1 inner px black border and 1 outter white border. This is only for select, it has no hover nor focus. Remove the check at the middle"; then (user 2026-11-11): a custom menu with Display (Grid, List, Auto groups = hue + lightness, Collection groups) and Size (Small, Medium, Large); list rows show the square then the name, or "H: {v} S: {} L: {}" without a name; one cell size for grid and list; then (user 2026-11-11): "separate the options inside Group By: Auto, Collection, None"; then: "The small, medium, large should not modify the container box it should just reflow everything inside the container. Codensed and default are the only ones that should make such mods."; then: "for default mode make the small: 24px compact: 16px, then 32px:24px then 42px:32px"; then: "for the list, make 3x the width, keep the height as the cell proportion"; then: the scroll area was off-center with a top border from hand-built styling ("why are you not using our components"), "just use scroll area"; "Take out the sticky behavior of the groups" and remove the search capability, not only the field; then: "change grid tab label with Colors, we then be replacing gradients and combinations with Palettes, we limit palettes to max of 12 stops, we add a toggle for the palette to toggle between hard stops or gradient modes" (toggle in the view options Display section; one `palettes` field in collection JSON; weights set widths and stop positions)
- Scope source: user: "we must consider condensed and expanded forms on this swatch navigation. It must be practical and accesible to use"; "this must keep its intended usage which is inside a floating panel"; plan approved 2026-11-11; revision: "remove the search, then use proper tabs instead of manual buttons, remove the fullscreen icon button and the functionality. The condensed and normal are modes in the library not something you toggle like this. The focus/hover should be a 1px solid white/black depending on color, no accent color nor internal border."
- In-scope changes and existing gaps: the widget, its companion model and collections, the color picker's swatches view (recorded in `plans/widgets/color-picker/`), a shared VirtualList/Select repair; the real collection list is pending from the user (CSS named colors is the placeholder import)
- Repository baseline / unrelated changes: development at ca72307d with the session's earlier uncommitted work preserved
- Live project / document IDs and revisions: Spec Blocks project prj_c5a403a0…, UI Widgets Specification doc_0d98facc…, section `uwg-pal-sec`; Component Library `cinp-q8`; committed 0e88bd9a (0.59.1), a789ad8c (0.60.0), 8aacb903 (0.60.1); revision 24c48ecb (0.60.2), 27c9bde6 (0.61.0), b0998f49 (0.61.1, selected-cell mark), 50846f3b (0.61.2), 2557dd31 (0.62.0, layout and size lanes, menu), 286c97a4 (0.62.1, Group by), 22204601 (0.62.2, fixed box), c9864b14 (0.62.3, cell sizes), 14d0763b (0.62.4, list color 3 cells), c22ecf15 (0.62.5, Scroll area, no sticky labels, no query), 06a69f46 (0.62.6, list without Select), a064f7ec (0.62.7, None resets the order), f087d2f0 (0.62.8), 71c3bab1 (0.63.0, colors and palettes modes, palettes document, paletteStyle), 6154300f (0.63.1), 9ca902d9 (0.64.0, generated palettes removed)
- Owning contracts / dependencies / vocabulary: Widgets Color palette (`uwg-pal-*`), §6.1 Color picker swatches rows, §17.12 `cinp-q8` gapless grid edge; Foundation §19.24 virtual list window and the choice collection; Foundation virtual list
- Local reference evidence: no palette browser exists under `../specification/external/`; the list composes the Foundation virtual list window (as Tree view does) and choice collection (as Select and Menu do); no component's internals are reused or modified
- Tool readiness: Spec Blocks MCP and Chrome DevTools MCP available
- Browser / server / build under test: Chrome via DevTools MCP; Vite dev server (source) on port 5191; static Storybook build
- Evidence directory: `tmp/component-verification/color-palette/`
- Durable verification fixtures / served URLs: `tests/fixtures/widgets/color-palette/`, `tests/fixtures/widgets/color-picker/`, `tests/fixtures/frameworks/{react,vue}/` lane row
- Evidence availability to the next agent: local only

## Capability and interface mapping

| ID   | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status  | Evidence / gap   |
| ---- | ------------------------------------- | -------------- | ----------------------------- | ------------------------------ | ------------- | ------------ | ------- | ---------------- |
| C-01 | Collection document, parser, issues | `uwg-pal-req-def-1` | none | `foundation/color-palette/{types,parse,schema}.ts` | ### Collections | V-01 | passed | unit tests |
| C-02 | Companion entry, built-in default and reduced, per-collection sub-entries | `uwg-pal-req-def-2` | emoji companion | `vite.config.ts` collection entries, `package.json` exports | ### Collections | V-01, V-09 | passed | build emits `dist/color-palette/collections/css-named.js` |
| C-03 | Grouping (collection, hue, none) and sort in OKLCH | `uwg-pal-req-def-3` | none | `groupSwatches`, `sortByColor`, `hueFamily` | ### Grouping and sorting | V-01, V-03 | passed | unit tests; fixture `#collections` |
| C-04 | Collection palettes (2–12 colors, normalized weights); generated palettes removed for now | `uwg-pal-req-def-1`, `-def-4` | none | `resolveColorCollection` palettes | ### Palettes | V-01, V-19, V-20 | passed | unit tests; fixture `#stops`, `#blend` |
| C-05 | Presets and generated sets listed apart, weights normalized | `uwg-pal-req-def-5` | none | `buildListModel` headings | ### Gradients | V-04 | passed | labels "Collection" / "Generated" |
| C-06 | Listbox over the Foundation virtual window and choice collection, in a Scroll area | `uwg-pal-req-ana-1`, `-ana-2` | Tree view (`VirtualList`), Select and Menu (`ChoiceCollectionController`) | `PaletteList` in `list.ts`, rendered by `TpColorPalette` | Usage | V-02, V-05, V-16 | passed | 75–100 of 600 options mounted |
| C-07 | Lanes and properties (value, collection, mode, layout, grouping, sort, sortDirection, size) | `uwg-pal-req-prop-1..3` | emoji lanes | `Lane<T>` with `ControllableState` | Usage | V-06 | passed | events and metadata recorded |
| C-08 | Events and containment | `uwg-pal-req-evt-1`, `-evt-2` | emoji | `#propose`, `#relay`, `containNestedEvents` | Usage | V-06 | passed | `leaked` empty |
| C-09 | Keyboard and pointer: listbox focus, grid arrows, typeahead, Enter and Space | `uwg-pal-req-key-*` | Select grid | Select `listFocus` keyboard model | ### Keyboard | V-02 | passed | real keys |
| C-10 | Accessibility names, `aria-activedescendant` on the listbox | `uwg-pal-req-a11y-1`, `-a11y-2` | emoji | `optionName`, label text with origin | ### Keyboard | V-07 | passed | snapshot names "Red 100, #ffe8e4" |
| C-11 | Gapless cells, one boundary edge; the chosen cell has a white outer and black inner line, no check mark; hover and keyboard highlight draw nothing | `uwg-pal-req-pres-1`, `-pres-2`, `cinp-q8` | color picker swatch | `recipes/color-palette.ts` | Usage | V-03, V-08 | passed | cells 36×36, border 0 |
| C-12 | Proportion blocks, bars, fluid cells, cells follow the region density, mode Tabs, list layout (square + name or HSL), size lane shared by grid and list | `uwg-pal-req-pres-3`, `-pres-4` | emoji picker category Tabs | styles, cqi cells, `tp-tabs` underline without panels | ### List, ### Size and density, ### In a popover | V-04, V-08, V-10 | passed | compact instance smaller with the control heights; list squares 32/36/44 px for sm/default/lg, the same as grid cells |

| Issue | Concrete missing/conflicting contract | Affected dependencies | Proposed resolution | Authority / resolution evidence | Status |
| ----- | ------------------------------------- | --------------------- | ------------------- | ------------------------------- | ------ |
| S-1 | No palette widget in the Widgets specification | color picker swatches, Color input edge | new section `uwg-pal-sec`, picker and `cinp-q8` amendments | Spec Blocks 0.60.0 | passed |
| S-2 | Condensed/expanded was a widget lane; the user wants the library density mode | presentation axes | `swatchDensity`, `expanded` and `query` lanes removed; cells follow the region density | Spec Blocks 0.60.2, 0.61.0 | passed |

## Architecture and reuse

- Component folder and responsibility boundaries: `src/widgets/color-palette/` (element, list, model, toolbar view, strings, styles); `src/foundation/color-palette/` (DOM-free model and collections); `src/foundation/color/palette.ts` (sorting, hue families, nearest color, ramp paint)
- Supported exports / registration / constituent API impact: `@tweakpad/ui/widgets`, `@tweakpad/ui/register/widgets`, `@tweakpad/ui/color-palette`, `@tweakpad/ui/color-palette/collections/*`
- Framework bindings: `npm run cem` regenerated React and Vue bindings and tag types; ledger row `tp-color-palette`; `tp-color-picker` lost `schemes`, gained `collections`
- Public vocabulary / tokens / parts / presentation review: parts `color-palette-*` with descriptions; private variables only; no density lane: the theme `density` drives the cell size

### Family dependency map

| Responsibility | Reference dependency path / symbol         | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| -------------- | ------------------------------------------ | --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Collection, keyboard, virtual window | Foundation virtual list window and choice collection | `src/foundation/virtual-list.ts` (`VirtualList`, as Tree view uses it), `src/foundation/choice-collection.ts` (`ChoiceCollectionController`, as Select and Menu use it) | composed in `src/widgets/color-palette/list.ts` (`PaletteList`); no core component change: Select is not used for the list (user 2026-11-11: core changes reverted; ask before touching core components) | palette; V-02, V-05, V-16 |
| Scheme generation | color picker schemes | `src/widgets/color-picker/color/scheme.ts` | moved to `src/foundation/color/scheme.ts` with `withHue` exported | palette generated sets; V-01 |
| Contrast mark color | color picker | `color/contrast.ts` | moved to `src/foundation/color/contrast.ts` | picker, palette; V-08 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations        | Scenario IDs |
| -------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------- | -------------------------------------- | ------------ |
| Labels, groups, empty state | Select recipes | `selectAppearance` (`select-group`, `select-label`, `select-empty-state`) | `recipes/select.ts` | reused for the palette's own parts; no list border or focus ring, no row edges, labels not sticky, no palette background | V-02, V-16 |
| Scrolling | Scroll area | `tp-scroll-area` | `recipes/scroll-area.ts` | wraps the list (`axis="y"`); the list does not scroll itself | V-15 |
| Mode switch | Tabs underline | `tp-tabs` | `recipes/tabs.ts` | without panels, as the emoji picker's category bar | V-06 |
| Swatch cells | color picker swatch fill | `swatchFill`, `floatEdge` | `recipes/shared/swatch.ts`, `edges.ts` | gapless, row shadow as the group edge | V-03 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| ------------------ | ----------- | ------------------------------- | ----------------------------------- | --------------------------------------------- |
| Toolbar | modes, view options (Display: Grid, List; Group by: Auto, Collection, None; Size), collection | Tabs, Button, Menu with labeled radio groups, Separator, Select | V-06, V-10 | none |
| Attribution | credit link | native `a` | V-07 | no Link component exists |
| Docs ### In a popover | floating panel | Popover, Button | V-08 | none |

## Verification scenarios

| ID   | Capability IDs / evidence category | Setup and input     | Expected result     | Actual result | Tool/command and evidence  | Status  | Justification / gap |
| ---- | ---------------------------------- | ------------------- | ------------------- | ------------- | -------------------------- | ------- | ------------------- |
| V-01 | C-01, C-02, C-03, C-04; unit | `tests/unit/foundation/color/palette.test.ts`, `tests/unit/foundation/color-palette/model.test.ts` | pass | pass | vitest | passed | Observed values recorded in Actual result |
| V-02 | C-06, C-09; real input | `?only=default`: click Grid tab, Tab, Tab (listbox), Down, Right, Enter; Home, Space; `g` | focus highlights the chosen color, highlight moves by row and column, Enter and Space pick, letters jump | focus on `.select-list` highlighted Blue 500; Indigo 600 then Red 100 picked with reason `keyboard`; `g` → Gray 100; `aria-activedescendant` follows | DevTools press_key | passed | Observed values recorded in Actual result |
| V-03 | C-03, C-11; visual | fixture grid in dark and light | gapless cells, one group edge | cells 36×36, border 0, row shadow edge | `first/overview2.png`, `first/light.png` | passed | Observed values recorded in Actual result |
| V-04 | C-04, C-05, C-12; visual | `#gradients`, `#combinations` | presets then Generated, bars, proportion blocks | as expected | `first/generated.png`, `first/sets.png` | passed | Observed values recorded in Actual result |
| V-05 | C-06; performance | `#large` 600 colors | bounded window, no change-in-update warning | 58 options mounted; no warning after the Select repair | DevTools evaluate | passed | Observed values recorded in Actual result |
| V-06 | C-07, C-08; events | picks and toolbar toggles | lane events on the host only | `leaked` empty; metadata carries swatch and collection | `colorPaletteAPI.events` | passed | Observed values recorded in Actual result |
| V-07 | C-10; accessibility | snapshot and axe | named listbox and options | names "Red 100, #ffe8e4"; listbox focusable with `aria-activedescendant`; axe on the full fixture: only the page's `page-has-heading-one` (fixture page without h1) | DevTools snapshot, axe | passed | Observed values recorded in Actual result |
| V-08 | C-11, C-12; visual | chosen cell, hovered cell, compact instance, combinations, picker swatches view, dark and light | chosen: white outer and black inner line, no check; hovered: nothing | Blue 500 `rgb(255,255,255) 0 0 0 1px inset, rgb(0,0,0) 0 0 0 2px inset`, `::after` none; hovered Indigo 600 unmarked; picker shows the palette's underline Tabs under its enclosed view Tabs | DevTools screenshots | passed | Observed values recorded in Actual result |
| V-10 | C-07, C-12; real input | `?only=collections`: open View options, List; Collection groups; Large; pick firebrick | menu shows Display (Grid, List, Auto groups, Collection groups) and Size (Small, Medium, Large); grouping and sort change together | `tp-grouping-change` collection + `tp-sort-change` collection (item-press), size `lg`; list rows square + name, unnamed "H: 0 S: 100 L: 50"; firebrick's square marked, row unmarked, no row edge | DevTools click, screenshots | passed | Observed values recorded in Actual result |
| V-11 | C-07; real input | `?only=default`: View options, Group by None, then Auto | Group by is its own labeled section; None flattens the grid; Auto changes grouping and sort together | menu Display (Grid, List), Group by (Auto, Collection, None), Size; events `tp-grouping-change` none, then `tp-grouping-change` hue + `tp-sort-change` lightness; `leaked` empty | DevTools click, screenshot | passed | Observed values recorded in Actual result |
| V-12 | C-12; layout | `?only=default`: sizes sm, default, lg in grid and list, then `density="compact"` | the box keeps its size across sizes; cells reflow; only density resizes it | default density 346×310 at every size and layout, cells 32/36/44 with 9/9/7 per row (groups of 9); compact 260×233, cells 24/27/33 | DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-13 | C-12; layout | `?only=default`, grouping none: sizes sm, default, lg in grid and list, default and compact density | cells 24/32/42 px default and 16/24/32 px compact; per-row count measured from the rendered cell | default 310×282 at every size, cells 24/32/42, 12/9/6 per row; compact 233×236, cells 16/24/32, 13/9/6 per row; list squares match | DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-14 | C-12; visual | `?only=default`, layout list, sizes sm, default, lg | list color three cells wide, one cell tall | 72×24, 96×32, 126×42 | DevTools evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-15 | C-06, C-09; real input, layout | fixture: `#default`, `#large`; Grid tab, Tab, Tab, Tab, Down, Right, `r`, Enter | list in a Scroll area, centered, no top border; no query capability; virtual window follows the Scroll area; labels scroll | insets 8/8 px (toolbar 8); list `searchable` false, no input, no query root, no status; `#large` 3080 px scroll, 75→100 options mounted; End reveals the last color; Rose 100 picked with reason `keyboard`; second Tab stops on the Scroll area viewport (focusable while scrolling, as upstream); emoji picker search unchanged; color picker swatch checks pass | DevTools press_key, evaluate, screenshots | passed | Observed values recorded in Actual result |
| V-16 | C-06, C-09, C-10; real input, layout, accessibility | fixture all instances; `?only=default`: Grid tab, Tab ×3, Down, Right, End, Home, `r`, Enter, Right, Space; hover Red 700, click Orange 100; `#rtl` Home, Left | listbox over Foundation controllers in the Scroll area; same behavior as before without Select | listbox → named groups → options in the a11y tree; focus highlights Blue 500, Down/Right → Indigo 600, End → Black (in view), `r` → Red 200, Enter/Space pick with reason `keyboard`, click picks with `item-press`, hover draws nothing; `#large` 75–100 of 600 options mounted with the viewport always covered; list rows 96×32; sets rows fill 288 px; disabled list renders with tabindex -1; RTL Left moves forward; axe only `page-has-heading-one`; no console warnings; color picker swatch checks pass; `src/components` and `virtual-list.ts` unchanged | DevTools press_key, click, hover, evaluate, axe, screenshot | passed | Observed values recorded in Actual result |
| V-17 | C-06; scroll stability | list and grid layouts on `#default`, `#large`, `#collections` (sm): `scrollTop += 8` to the end, then a smooth `scrollBy(150)` | each step lands 8 px further; the smooth scroll ends at the requested offset | before: 41 of 150 list steps jumped 40–136 px (anchoring on reused rows; 0 with anchoring off); after `overflow-anchor: none` on the list: 0 wrong steps in all five runs, smooth scrolls end at 350 | DevTools evaluate | passed | Observed values recorded in Actual result |
| V-18 | C-07; real input | `?only=default`: View options → None, Auto, None | each Group by choice shows the same order whatever came before | None after Auto: grouping none, sort collection, mounted options in collection order (0…107, sequential); previously None kept the lightness sort from Auto and the grid looked scrambled | DevTools click, evaluate, screenshot | passed | Observed values recorded in Actual result |
| V-19 | C-04, C-05, C-07, C-12; real input, visual | fixture `#stops`, `#blend`, `?only=stops` menu, `?only=rtl` palettes gradient; Home, Down, Left, Enter | tabs Colors and Palettes; Palettes menu Display Hard stops/Gradient and Size; palettes ≤ 12 stops; weights size options and place blend stops; blend continuous across options; RTL mirrored | tabs `Colors`,`Palettes`; menu `Hard stops` (checked), `Gradient`, sizes; Gradient click → `tp-palette-style-change` gradient, 27 of 27 options `data-paint=blend`, row 288 px of three 96 px options; Harbor 60/30/10 widths; screenshots show continuous blends with the selected segment marked; RTL starts at the inline start (`to left`); keyboard picks Teal 500 with metadata set Lagoon/collection; unit tests: 12-stop cap and issue, weight normalization, blend sizes/offsets (166.667/333.333/1000 %, 0/85.714/100 %, RTL 100/14.286/0 %) | DevTools click, press_key, evaluate, screenshots; vitest | passed | Observed values recorded in Actual result |
| V-20 | C-04, C-05; real input, visual | fixture `#stops`, `#blend` after removing generated palettes (user 2026-11-11: "lets remove auto generated colors for now") | Palettes lists only the collection's palettes, no origin headings; the list no longer depends on the value | groups and labels Ember, Lagoon, Dusk, Harbor, Orchard, Clay in both styles; 0 headings; a new value keeps the same 6 groups; no console warnings; generation code, rule strings, origin field and the helpers only it used (`colorRampPaint`, `nearestColorIndex`, `oklabCoords`, exported `withHue`) removed with their tests | DevTools evaluate, screenshot; vitest | passed | Observed values recorded in Actual result |
| V-09 | C-02; docs, bindings, suite | `check-docs.mjs widgets/color-palette`, vitest, typecheck, lint, build, React and Vue lane and smoke | pass | 6334 tests (list layout model tests added); lane passed; smoke 206/206 | node, DevTools | passed | Observed values recorded in Actual result |

## Early integration checkpoint

| ID   | Check                                                                                             | Status  | Evidence / unresolved finding                               |
| ---- | ------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| I-01 | Shared owners are actually used by related consumers; old duplicate behavior is removed/delegated | passed | schemes view removed; scheme and contrast moved to foundation |
| I-02 | Default visual regions match traced source and shared library recipes                             | passed | Select and Command palette recipes (V-02, V-03) |
| I-03 | Independent constituent options work, including placement separately from action behavior         | passed | toolbar hidden, modes subset, options menu only in grid mode (V-06, V-08) |

## Gate record

| Gate                                  | Status  | Required exit evidence / remaining work                                               |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 0. Sources and scope                  | passed | Spec 0.64.0; user request, approved plan and revision requests |
| 1. Capability mapping                 | passed | C-01..C-12 |
| 2. Architecture and composition reuse | passed | Select composition, foundation moves |
| 3. Behavior                           | passed | V-02, V-06 |
| 4. Presentation and customization     | passed | V-03, V-04, V-08 |
| 5. Accessibility                      | passed | V-07 |
| 6. Visual and interaction inspection  | passed | V-03, V-04, V-08, dark and light |
| 7. Documentation and demo reuse       | passed | V-09; Storybook static Docs page read |
| 8. Regression and reconciliation      | passed | full suite, color picker fixture, framework fixtures |

## Documentation synchronization

- [x] `docs/widgets/color-palette.mdx`; `check-docs.mjs widgets/color-palette` passes; Storybook static Docs page read in Chrome.
- [x] JSDoc for every property, method and event; part descriptions in the family.
- [x] `elementDependencies` lists every rendered library element.
- [x] Fixture `tests/fixtures/widgets/color-palette/` with README.
- [x] Previews reuse Popover, Button and Stack.
- [x] Preview code uses package registration and published entries only.

## Completion / handoff

- Change summary: new Color palette widget, companion model and collections; color picker swatches view composes it
- Actual delivery claim: the widget and its docs, verified in Chrome (dark, light, popover, picker)
- Record checker: `check-gates.mjs --stage verify`
- Non-browser checks: vitest, typecheck, lint, build, framework ledger
- Behavior: V-02, V-06
- Accessibility: V-07 (snapshot and axe; no screen reader run)
- Visual/customization/motion inspection: V-03, V-04, V-08
- Documentation and demo composition reuse: V-09
- Shared-consumer regressions / package boundaries: emoji picker list unchanged and now shares the deferred range request
- Required failures or blocked checks: none
- Older out-of-scope gaps: the emoji picker's inline Select list still fails axe `scrollable-region-focusable` and its disabled state warns change-in-update from Input group (the palette no longer renders the Input and its list takes focus); website rendering not read (site repo not linked)
- Changed source revisions / reopened gates: revision 2026-11-11 (search, swatch density and expand removed; Tabs; contrast-line highlight) reopened gates 1–8, re-verified V-02, V-04, V-06, V-08, V-09
