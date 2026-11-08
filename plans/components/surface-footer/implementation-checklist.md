# Shared surface footer implementation and evidence record

## Delivery and source record

- Component(s) / public identity: Card, Dialog, Alert Dialog, Drawer and Form actions.
- Requested work / claim: implement approved shared end-aligned action layout and audit published use cases; no new API.
- Scope source: user screenshot of Tabs/Card Save on left; approved implementation plan.
- Repository baseline / unrelated changes: clean development checkout; preserve unrelated work.
- Live project / document IDs and revisions: prj_c5a403a0-d1d5-4487-ac78-f4e545f46483; Foundation doc_cd3c4721-9f9b-4531-abab-a8bfdbac75f1 and Component Library doc_8077bf7c-0361-48f3-ac87-53b983bd89b3 read directly. New footer contracts committed as 210f4fd9; Form contract as 68d1f59f.
- Owning contracts / dependencies / vocabulary: Card/Footer, Dialog/Footer, Alert Dialog/Actions, Drawer/Footer, Form/Actions; Media Player and Markdown dependency reviews completed.
- Local reference evidence: specification/external/ui/apps/v4/registry/new-york-v4/ui/card.tsx CardFooter and dialog.tsx DialogFooter. Their different alignment and reverse-column defaults are deliberately superseded by the approved contract.
- Tool readiness: direct Spec Blocks and Chrome DevTools MCP used exclusively.
- Browser / server / build under test: source Vite fixture; built Storybook; isolated 116-page website build linked to current checkout, without changing original site dependencies/configuration/server.
- Evidence directory: tmp/component-verification/surface-footer/ (local ignored JSON).
- Durable verification fixtures / served URLs: tests/fixtures/components/surface-footer/; regenerate using scripts/footer-inventory.mjs after build.
- Evidence availability to the next agent: inventory.md and results.md are tracked; raw results.json is local only.

## Capability and interface mapping

| ID | Requirement / capability and defaults | Live authority | Local reference path / symbol | Lit interface / implementation | Docs location | Scenario IDs | Status | Evidence / gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | Logical-end wrapping row, no consumer alignment required | footer-layout requirements in four surface sections; Form actions paragraph | CardFooter, DialogFooter | surfaceFooterLayout shared declarations; surfaceFooterStyles; Form structure | Card/Form; all footer examples | V-01 | passed | 79 markup probes, 49 visible regions, both directions |
| C-02 | Natural action order and unchanged interaction | same contracts; existing form/dialog behavior | DialogFooter reverse-column traced and removed | authored secondary-first order; existing slots/handlers | Tabs, Text Area, Slider and workspace | V-02 | passed | real save, reset, submit, Tab and Escape input |
| C-03 | Appearance, hidden sections and public customization preserved | existing surface and presentation contracts | existing surface recipes | geometry separated from sectionFooterAppearance and spacing tokens | Card and owner pages | V-03 | passed | light/dark, narrow/RTL, metadata/content-only and wrapping probes |

## Architecture and reuse

- Component folder and responsibility boundaries: shared geometry in presentation/recipes/shared/surface.ts; CSS adapter in components/shared/surface-footer.ts. Existing Card/Dialog/Form owners consume it; Alert Dialog and Drawer inherit Dialog.
- Supported exports / registration / constituent API impact: unchanged.
- Framework bindings: manifest/build generation reports 207 files, zero updated. No property/event/slot API additions.
- Public vocabulary / tokens / parts / presentation review: existing slots and parts retained; Card footer slot description updated to logical end. No new tokens or alignment attributes.

### Family dependency map

| Responsibility | Reference dependency path / symbol | Existing local owner investigated | Reuse / repair and component-specific differences | Actual consumers / regression scenario IDs |
| --- | --- | --- | --- | --- |
| Footer row geometry | CardFooter / DialogFooter | Card CSS, Dialog CSS, Form structure | Replace independent defaults with one declaration object; no reverse-column media rule | Card, Dialog, Alert Dialog, Drawer, Form; V-01 |
| Dialog behavior | existing Dialog family | TpDialog and inherited Drawer/Alert Dialog | No action handlers, focus or form ancestry moved | workspace, Flow confirmation, Media Player errors; V-02 |

### Presentation source map

| Region / public part | Registry base / style preset | Source component + stylesheet / selectors | Existing library component / recipe | Decision / contract adaptations | Scenario IDs |
| --- | --- | --- | --- | --- | --- |
| Card footer | traced CardFooter | Card .card > footer | Card spacing and section paint | Shared row geometry, logical end | V-01, V-03 |
| Dialog/Alert/Drawer footer | traced DialogFooter | Dialog .footer and inherited Drawer | dialogFamilyAppearance | Preserve paint/gaps; replace layout and remove reversal | V-01, V-03 |
| Form actions | existing local structure | form > slot=actions | formPresentation | Consume shared geometry without moving controls | V-02 |

### Implementation and composition reuse map

| Demo / composition | Nested role | Existing component / public API | Registration and integration checks | Native exception / missing capability, if any |
| --- | --- | --- | --- | --- |
| 79 published markup cases | surfaces and actions | existing tp-card, dialog family, tp-form and tp-button | V-01 | Existing native content retained |
| Workspace forms | completion buttons | existing Form actions part | V-02 | No replacement native control |
| Flow / Media Player | consequential decisions | existing Alert Dialog cancel/confirm slots | V-02 | No local substitutes |

## Verification scenarios

| ID | Capability IDs / evidence category | Setup and input | Expected result | Actual result | Tool/command and evidence | Status | Justification / gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-01 | C-01; layout | inventory 79 published markup probes in LTR/RTL | owned footers end-align; action end-edge error under 2px | 49 visible affected regions, zero failures; supplied Tabs hero edge error 0 in fixture, website and Storybook | results.md; raw results.json | passed | Markup probes do not execute scripts and are not complete interaction certifications |
| V-02 | C-02; behavior/accessibility | real fill/click/Tab/Escape; workspace forms; dependent dialogs | action order and behavior retained | Tabs reports Saved; Discard then Tab focuses Save. Form submits expected values and Reset restores defaults. Alert focuses Cancel, Escape restores trigger. Workspace task/invite/settings order verified. Flow real Delete opens Cancel/Delete; Media error with Retry end-aligns | Chrome DevTools MCP | passed | No screen-reader claim |
| V-03 | C-03; visual/accessibility | dark/light, 320px, RTL, constrained Card, source and built docs | correct edge, natural wrapping, section appearance retained | source and built Tabs screenshots inspected; constrained 256px Card wraps with edge error 0; metadata/content-only included; axe on Tabs main has zero violations | Chrome screenshots inspected; axe through MCP | passed | Existing Button no-wrap contract retained |

## Early integration checkpoint

| ID | Check | Status | Evidence / unresolved finding |
| --- | --- | --- | --- |
| I-01 | Shared owners actually used | passed | Card and Dialog import CSS adapter; Form imports same declaration object; duplicate layout removed |
| I-02 | Default visual regions match shared recipes | passed | Alert screenshot and supplied Tabs composition inspected; section paints unchanged |
| I-03 | Independent options retained | passed | Empty/content-only and metadata cases; dialog hide/dismiss behavior; narrow wrap and RTL |

## Gate record

| Gate | Status | Required exit evidence / remaining work |
| --- | --- | --- |
| 0. Sources and scope | passed | Fresh direct specs, traced local sources and approved scope |
| 1. Capability mapping | passed | C-01–C-03 mapped to V-01–V-03 |
| 2. Architecture and composition reuse | passed | One shared layout owner; no public API added |
| 3. Behavior | passed | V-02 actual native input and dependent compositions |
| 4. Presentation and customization | passed | Existing tokens/parts retained; shared structural defaults |
| 5. Accessibility | passed | Actual keyboard/focus; axe zero violations; no screen-reader claim |
| 6. Visual and interaction inspection | passed | V-01–V-03 with exact verified boundary above |
| 7. Documentation and demo reuse | passed | Five docs checkers pass; ledgers updated; built website and static Storybook inspected |
| 8. Regression and reconciliation | passed | 446 files/6269 tests passed, 3 skipped, one worker; targeted lint/stylelint/tsc; library, Storybook and isolated website builds; size/tree-shaking report passed |

## Documentation synchronization

- Card and Form explain the default; Tabs/Slider/Text Area examples use secondary-first order. Forced edits are recorded in their ledgers.
- All five changed documentation pages pass the mandatory checker. Controls, handlers, names and IDs retained.
- No API field/attribute/event changes or manual framework binding edits.

## Completion / handoff

- Scope of claim: shared footer layout and the inventoried affected compositions; not whole-catalog conformance.
- Website preview used a temporary copy and local package symlink with preserveSymlinks for the temporary build. Original site remains on its installed package until dependency update/release.
- Raw measurements are local ignored artifacts; durable inventory/results and fixture generator are tracked.
