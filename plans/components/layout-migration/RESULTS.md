# Inline layout migration

Baseline: `a5c449b2`. Reviewed 473 authored inline flex/grid sites. This report covers documentation and story/example layouts, not component implementation styles.

Source comparison: 280 changed previews on 87 pages; 335 Stack elements added to published snippets. All 700 preview titles, control tags, IDs, attributes, visible text and whitespace-sensitive code content are preserved. Four renderer templates change their layout markup; script logic outside those literals is unchanged.

## Per-page changes

| Page | Total previews | Changed use cases |
| --- | ---: | --- |
| components/alert | 4 | Severity; Live update |
| components/aspect-ratio | 4 | One ratio, three widths |
| components/attachment | 8 | Attachment; Statuses; Scrollable groups; Title and description only; Preview trigger, download and retry; Sizes; Remove event |
| components/autocomplete | 8 | In a form |
| components/avatar | 9 | Custom shape and grayscale; Decorative avatar |
| components/badge | 6 | Status in a list; Interactive badges |
| components/breadcrumb | 7 | Menu on wide screens, drawer on narrow ones |
| components/bubble | 7 | Conversation; Variants; Alignment; Reactions; Rich content; Expandable message; Quick replies |
| components/button-group | 14 | Sizes; Mixed controls; Steppers, labels and counts; Menu and popover; Select and native select; Input groups and nesting; Navigation and toolbar; Grouped pagination |
| components/button | 10 | Form actions |
| components/calendar | 13 | Nightly prices and booked dates; Quick picks; French and Brazilian Portuguese; Value change |
| components/carousel | 12 | Carousel; Crossfade; Layered 3D; Shader transition; Commit |
| components/checkbox | 7 | Form values; Select all; CheckboxGroupController; Disabled and read-only; Inline |
| components/citation | 6 | Numbered references |
| components/code-block | 8 | Token theme |
| components/collapsible | 8 | Positional slots; Open change |
| components/color-input | 8 | Inline; Chip or text; Formats and alpha; Sizes; In a form; Disabled and read-only |
| components/command-palette | 4 | Command palette |
| components/copy-button | 7 | In an input group and a field group; Copy events |
| components/cursor | 8 | Sticking; Programmatic state |
| components/description-list | 5 | Alignment and stacking |
| components/dialog | 7 | Dialog |
| components/drag-drop-list | 11 | Commit events; Custom rows and overlay; Board lanes; Controlled lanes; Approve before committing |
| components/drawer | 6 | Drawer; Edges |
| components/empty-state | 5 | Empty state; No results |
| components/field-group | 9 | Color channels; Inline; Expanded |
| components/field | 7 | Horizontal; Legend and group |
| components/file-upload | 10 | Custom text and compact size |
| components/form | 8 | Repeated emails |
| components/icon | 4 | Icon; Decorative and labelled; Size and color; Custom definition |
| components/input-group | 9 | Text addons; Status addons; Actions; Button group composition; Interactive addons; Disabled and invalid |
| components/input | 9 | Types; Mono; Disabled and read-only; Inline; Number steps; Units and icons |
| components/kbd | 7 | Modifiers; Icon keys; Localized and right-to-left |
| components/label | 3 | Label; By id and by nesting; Optional |
| components/list | 11 | Content and actions; Variants and sizes; People and invitations |
| components/map | 5 | Map with a list; External controls |
| components/markdown | 9 | Streaming; Custom node rendering |
| components/marker | 9 | Marker; Variants; Tones; With icons; Shimmer; With an action; Native hosts and layout; Completion reveal; Accordion label and drawer |
| components/media-player | 10 | Custom top region |
| components/menu | 7 | Handling commands |
| components/menubar | 4 | Active menu |
| components/message-scroller | 8 | Streaming; Join marker as anchor; Commands; Outline and edges; Prepend history; Animated send |
| components/message | 8 | Message; Sender sides; Header and footer; Sending and failed; Attachment |
| components/native-select | 7 | Sizes; Form value; Controlled value; Disabled, read-only and invalid |
| components/navigation-menu | 4 | Navigation menu; Mixed items; Active link; Vertical |
| components/one-time-code-field | 7 | Grouped; Verify on completion; Controlled value; Disabled and invalid |
| components/pagination | 8 | Router handling; Rows per page |
| components/popover | 7 | Title and description; Separate anchor; Open change |
| components/preview-card | 4 | Preview Card; Delays; Placement and arrow; Not hoverable |
| components/progress | 6 | Bare and captioned; Import; Formatted value |
| components/qr-code | 6 | Live value; Error correction; Sizes and colors |
| components/questionnaire | 13 | Resume a draft; Submit; Checkpoint and cross-answer validation; Progress bar; Clarification dialog |
| components/radio-group | 8 | Disabled; Controlled value; Required; Value change |
| components/resizable-panel-group | 8 | Collapsible sidebar; Layout events; Layout presets; Persisted sizes |
| components/scroll-area | 5 | Horizontal; Visibility; Edge fade |
| components/scroll-trigger | 7 | Scrubbed band; Custom scroll range; Reveal events |
| components/select | 15 | Value change; Disabled, read-only and error; Inline |
| components/separator | 3 | Separator; Vertical; Between sections |
| components/skeleton | 6 | Skeleton; Pulse, sweep and none; Card; Video and description; Settings form; Table rows |
| components/slider | 21 | Push, swap and none; Currency and percent; Controlled range; Step and large step; Vertical; Fixed start and added thumbs; Thumb alignment and right to left; Disabled and read-only; Change and commit; Rejecting values; Inline; Editable value; Ticks |
| components/spinner | 6 | Spinner |
| components/status-dot | 5 | Status dot; Variants; Pulse and ping |
| components/switch | 9 | Settings; Form value; Disabled and read-only; Controlled; Change event; Inline |
| components/table-of-contents | 5 | Collected targets |
| components/tabs | 7 | Change event and setValue |
| components/text-area | 7 | Content and fixed sizing; Character count; Disabled and read-only |
| components/text-transform | 10 | Locales; Truncation; Length limits; Formatter; Named presets |
| components/theme-switcher | 6 | Theme switcher; Variants; Small, defaulting to dark; Explicit choices only |
| components/time | 12 | Time; Absolute formats; Dates and zones; Short and narrow |
| components/timeline | 8 | Changelog |
| components/toast | 8 | Types; Manager |
| components/toggle-group | 8 | Required choice |
| components/toggle | 8 | Toggle; Variants and sizes; Icon sizes; Icon and label; Pressed artwork; With Buttons; Change events |
| components/tooltip | 8 | Shared provider; Shared handle |
| components/tree-view | 11 | Opening items; Rendered rows; Controlled lanes; Expand, collapse and reveal |
| components/visually-hidden | 4 | Filter results |
| motion/surface/glow-border | 8 | Controls and fields |
| motion/surface/segment-border | 6 | Patterns; Leave path |
| motion/text/text-mirror | 5 | Scrubbed by the scroll |
| motion/text/text-split | 8 | Scrubbed by the scroll |
| motion/text/text-stroke | 5 | Hide and reveal; Scrubbed by the scroll |
| widgets/color-picker | 14 | Popup in a form; Harmony wheel and triangle; Reading the palette; Commit events; Controlled owner; Surface only, and fields without a format choice; Small and read-only; Right-to-left |
| widgets/emoji-picker | 10 | Picks; Insert into a message; Remembered tone; Popup in a form; Small and read-only |
| widgets/flow | 12 | Automatic layout; Commit and selection; Controlled owner; In a form |
| widgets/gradient-picker | 6 | Stop controls; Small and read-only; Field settings |
| widgets/plot | 7 | Push and revise |
| widgets/text-editor | 10 | Text editor; Markdown in and out; In a form; Read-only and disabled |

## Layouts retained after rendered comparison

These are explicit compatibility decisions. Replacing these wrappers changed minimum-content sizing, motion measurements, native box geometry or behavior through `display: contents`.

| Page | Use case | Reason |
| --- | --- | --- |
| components/cursor | Cursor | Native figure track sizing across contents wrappers |
| components/cursor | Zones | Padded minimum-size native scene boxes |
| components/cursor | Native passthrough | Grid item justification through display-contents Cursor zones |
| components/carousel | Virtual archive with controlled selection | Native one-column intrinsic sizing of virtual carousel viewport |
| components/image | Staggered group | Reveal-member layout and hidden-member track spacing |
| components/image | Reveal timing and repeat | Reveal member geometry and transforms |
| components/image | Headline, group and caption | Text-split minimum-content width and grouped reveal geometry |
| components/image | Horizontal strip | Parallax scroller native track positioning |
| components/resizable-panel-group | Resizable Panel Group | Native grid minimum-content sizing inside constrained panels |
| components/scroll-trigger | Pinned scene | Pinned text measurement and grid minimum-content sizing |
| motion/text/text-split | Reveal on demand | Intrinsic width of measured text and grid stretching |
| motion/text/text-mirror | Hide and reveal | Intrinsic width of measured text and grid stretching |
| widgets/easing-editor | Spring and custom points | Intrinsic minimum control width in wrapping layout |
| widgets/easing-editor | Commit and veto | Intrinsic minimum editor width in centered grid |
| widgets/easing-editor | Controlled owner | Intrinsic minimum editor width in centered grid |

## Remaining inline flow layouts

Grid tracks, semantic lists, per-axis spacing and token-scale gaps outside Stack remain explicit. No declaration was moved into a stylesheet to hide it. Some individually compatible wrappers remain inside the retained use cases above so the whole use case preserves its existing geometry.

| Source | Use case | Host | Reason |
| --- | --- | --- | --- |
| docs/components/accordion.mdx:36 | Variants | div | explicit grid tracks or auto-placement |
| docs/components/aspect-ratio.mdx:26 | Common ratios | div | explicit grid tracks or auto-placement |
| docs/components/aspect-ratio.mdx:28 | Common ratios | div | constrained block geometry: preserve current track sizing |
| docs/components/aspect-ratio.mdx:31 | Common ratios | div | constrained block geometry: preserve current track sizing |
| docs/components/aspect-ratio.mdx:34 | Common ratios | div | constrained block geometry: preserve current track sizing |
| docs/components/aspect-ratio.mdx:123 | Cover and contain | div | explicit grid tracks or auto-placement |
| docs/components/calendar.mdx:225 | Date with start and end times | div | explicit grid tracks or auto-placement |
| docs/components/card.mdx:55 | Surface options | div | explicit grid tracks or auto-placement |
| docs/components/carousel.mdx:105 | Bullets inside | blockquote | semantic content element: manual composition review |
| docs/components/carousel.mdx:109 | Bullets inside | blockquote | semantic content element: manual composition review |
| docs/components/carousel.mdx:113 | Bullets inside | blockquote | semantic content element: manual composition review |
| docs/components/carousel.mdx:133 | Autoplay | div | constrained block geometry: preserve current track sizing |
| docs/components/carousel.mdx:137 | Autoplay | div | constrained block geometry: preserve current track sizing |
| docs/components/carousel.mdx:141 | Autoplay | div | constrained block geometry: preserve current track sizing |
| docs/components/carousel.mdx:613 | Virtual archive with controlled selection | div | Retained use-case geometry: see compatibility table above |
| docs/components/carousel.mdx:652 | Commit | div | constrained block geometry: preserve current track sizing |
| docs/components/carousel.mdx:663 | Commit | div | constrained block geometry: preserve current track sizing |
| docs/components/carousel.mdx:674 | Commit | div | constrained block geometry: preserve current track sizing |
| docs/components/code-block.mdx:33 | Title slot | span | inline formatting context; Stack has no inline API |
| docs/components/collapsible.mdx:151 | Line-by-line reveal | ul | semantic content element: manual composition review |
| docs/components/copy-button.mdx:50 | Beside a value | dl | semantic content element: manual composition review |
| docs/components/cursor.mdx:11 | Cursor | div | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:14 | Cursor | span | constrained block geometry: preserve current track sizing |
| docs/components/cursor.mdx:15 | Cursor | div | explicit grid tracks or auto-placement |
| docs/components/cursor.mdx:16 | Cursor | figure | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:20 | Cursor | figure | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:24 | Cursor | figure | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:46 | Spring | div | explicit grid tracks or auto-placement |
| docs/components/cursor.mdx:47 | Spring | div | constrained block geometry: preserve current track sizing |
| docs/components/cursor.mdx:51 | Spring | div | constrained block geometry: preserve current track sizing |
| docs/components/cursor.mdx:69 | Zones | div | explicit grid tracks or auto-placement |
| docs/components/cursor.mdx:72 | Zones | span | constrained block geometry: preserve current track sizing |
| docs/components/cursor.mdx:73 | Zones | div | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:80 | Zones | div | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:134 | Dot and ring | div | constrained block geometry: preserve current track sizing |
| docs/components/cursor.mdx:154 | Native passthrough | div | Retained use-case geometry: see compatibility table above |
| docs/components/cursor.mdx:208 | Reduced motion | div | constrained block geometry: preserve current track sizing |
| docs/components/description-list.mdx:35 | Record details | span | inline formatting context; Stack has no inline API |
| docs/components/dialog.mdx:55 | Non-modal | dl | semantic content element: manual composition review |
| docs/components/dialog.mdx:82 | Container modality | section | constrained block geometry: preserve current track sizing |
| docs/components/drag-drop-list.mdx:67 | Variants and sizes | div | explicit grid tracks or auto-placement |
| docs/components/drag-drop-list.mdx:184 | Board lanes | div | explicit grid tracks or auto-placement |
| docs/components/drag-drop-list.mdx:244 | Controlled lanes | div | explicit grid tracks or auto-placement |
| docs/components/drag-drop-list.mdx:311 | Approve before committing | div | explicit grid tracks or auto-placement |
| docs/components/empty-state.mdx:45 | Media treatments | div | explicit grid tracks or auto-placement |
| docs/components/empty-state.mdx:107 | Bordered and filled | div | explicit grid tracks or auto-placement |
| docs/components/icon.mdx:51 | Decorative and labelled | span | inline formatting context; Stack has no inline API |
| docs/components/image.mdx:36 | Ratio and fit | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:56 | Fallbacks | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:59 | Fallbacks | span | constrained block geometry: preserve current track sizing |
| docs/components/image.mdx:69 | Loading placeholders | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:86 | Hover zoom | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:119 | Staggered group | tp-image-group | component-owned layout or named slots: preserve ownership |
| docs/components/image.mdx:133 | Reveal timing and repeat | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:138 | Reveal timing and repeat | p | constrained block geometry: preserve current track sizing |
| docs/components/image.mdx:139 | Reveal timing and repeat | div | explicit grid tracks or auto-placement |
| docs/components/image.mdx:154 | Headline, group and caption | tp-scroll-trigger | component-owned layout or named slots: preserve ownership |
| docs/components/image.mdx:156 | Headline, group and caption | tp-image-group | component-owned layout or named slots: preserve ownership |
| docs/components/image.mdx:178 | Parallax in a scroller | div | constrained block geometry: preserve current track sizing |
| docs/components/image.mdx:190 | Scroll zoom in a vertical scroller | div | constrained block geometry: preserve current track sizing |
| docs/components/image.mdx:251 | Horizontal strip | div | Retained use-case geometry: see compatibility table above |
| docs/components/image.mdx:264 | Smoothing | div | constrained block geometry: preserve current track sizing |
| docs/components/list.mdx:247 | Recordings | span | explicit grid tracks or auto-placement |
| docs/components/list.mdx:248 | Recordings | span | gap is outside the existing Stack token scale |
| docs/components/list.mdx:341 | People and invitations | span | explicit grid tracks or auto-placement |
| docs/components/list.mdx:344 | People and invitations | span | gap is outside the existing Stack token scale |
| docs/components/markdown.mdx:234 | With a table of contents | div | explicit grid tracks or auto-placement |
| docs/components/menu.mdx:147 | Context invocation | div | constrained block geometry: preserve current track sizing |
| docs/components/message-scroller.mdx:315 | Outline and edges | div | explicit grid tracks or auto-placement |
| docs/components/navigation-menu.mdx:13 | Navigation menu | div | explicit grid tracks or auto-placement |
| docs/components/popover.mdx:13 | Popover | div | explicit grid tracks or auto-placement |
| docs/components/popover.mdx:112 | Separate anchor | tp-popover | component-owned layout or named slots: preserve ownership |
| docs/components/preview-card.mdx:13 | Preview Card | div | explicit grid tracks or auto-placement |
| docs/components/resizable-panel-group.mdx:13 | Resizable Panel Group | div | Retained use-case geometry: see compatibility table above |
| docs/components/resizable-panel-group.mdx:24 | Resizable Panel Group | div | Retained use-case geometry: see compatibility table above |
| docs/components/scroll-trigger.mdx:15 | Scroll Trigger | div | explicit grid tracks or auto-placement |
| docs/components/scroll-trigger.mdx:42 | From the center | tp-scroll-trigger | component-owned layout or named slots: preserve ownership |
| docs/components/scroll-trigger.mdx:105 | Scrubbed band | div | constrained block geometry: preserve current track sizing |
| docs/components/scroll-trigger.mdx:158 | Custom scroll range | div | explicit grid tracks or auto-placement |
| docs/components/scroll-trigger.mdx:180 | Custom scroll range | div | constrained block geometry: preserve current track sizing |
| docs/components/scroll-trigger.mdx:204 | Pinned scene | div | Retained use-case geometry: see compatibility table above |
| docs/components/scroll-trigger.mdx:211 | Pinned scene | div | Retained use-case geometry: see compatibility table above |
| docs/components/scroll-trigger.mdx:219 | Pinned scene | div | constrained block geometry: preserve current track sizing |
| docs/components/slider.mdx:203 | Compact readout | div | explicit grid tracks or auto-placement |
| docs/components/table-of-contents.mdx:12 | Table of contents | div | explicit grid tracks or auto-placement |
| docs/components/table-of-contents.mdx:87 | Nested sections | div | explicit grid tracks or auto-placement |
| docs/components/table-of-contents.mdx:173 | Collected targets | div | explicit grid tracks or auto-placement |
| docs/components/table-of-contents.mdx:238 | Compact | div | explicit grid tracks or auto-placement |
| docs/components/text-transform.mdx:10 | Text transform | dl | semantic content element: manual composition review |
| docs/components/text-transform.mdx:34 | Case and identifiers | dl | semantic content element: manual composition review |
| docs/components/time.mdx:10 | Time | ul | semantic content element: manual composition review |
| docs/components/time.mdx:63 | Modes | dl | semantic content element: manual composition review |
| docs/components/time.mdx:154 | Calendar | dl | semantic content element: manual composition review |
| docs/components/time.mdx:194 | Precisions | dl | semantic content element: manual composition review |
| docs/components/time.mdx:209 | Timers | dl | semantic content element: manual composition review |
| docs/components/tooltip.mdx:69 | Cursor tracking | div | constrained block geometry: preserve current track sizing |
| docs/motion/surface/glow-border.mdx:56 | Comets | div | explicit grid tracks or auto-placement |
| docs/motion/surface/glow-border.mdx:79 | Sweep, pulse and glint | div | explicit grid tracks or auto-placement |
| docs/motion/surface/glow-border.mdx:137 | Custom colors | div | explicit grid tracks or auto-placement |
| docs/motion/surface/glow-border.mdx:162 | Lit by an element | div | explicit grid tracks or auto-placement |
| docs/motion/surface/segment-border.mdx:121 | Traced in | div | explicit grid tracks or auto-placement |
| docs/motion/text/text-mirror.mdx:58 | Hide and reveal | div | Retained use-case geometry: see compatibility table above |
| docs/motion/text/text-mirror.mdx:95 | Scrubbed by the scroll | div | constrained block geometry: preserve current track sizing |
| docs/motion/text/text-split.mdx:75 | Reveal on demand | div | Retained use-case geometry: see compatibility table above |
| docs/motion/text/text-split.mdx:163 | Scrubbed by the scroll | div | constrained block geometry: preserve current track sizing |
| docs/motion/text/text-stroke.mdx:112 | Scrubbed by the scroll | div | constrained block geometry: preserve current track sizing |
| docs/widgets/easing-editor.mdx:22 | Spring and custom points | div | Retained use-case geometry: see compatibility table above |
| docs/widgets/easing-editor.mdx:139 | Commit and veto | div | Retained use-case geometry: see compatibility table above |
| docs/widgets/easing-editor.mdx:163 | Controlled owner | div | Retained use-case geometry: see compatibility table above |
| src/stories/cursor.stories.ts:92 | Story/template | div | constrained block geometry: preserve current track sizing |
| src/stories/map.examples.ts:110 | Story/template | section | explicit grid tracks or auto-placement |
| src/stories/scroll-trigger.stories.ts:21 | Story/template | div | explicit grid tracks or auto-placement |
| src/stories/skeleton.examples.ts:91 | Story/template | div | gap is outside the existing Stack token scale |
| src/stories/table-of-contents.examples.ts:97 | Story/template | div | explicit grid tracks or auto-placement |
| src/stories/table-of-contents.examples.ts:141 | Story/template | div | explicit grid tracks or auto-placement |
| src/stories/table-of-contents.examples.ts:148 | Story/template | aside | gap is outside the existing Stack token scale |
| src/stories/table-of-contents.stories.ts:143 | Story/template | div | explicit grid tracks or auto-placement |

## Other source layouts reviewed

- Existing multi-column Grid demonstrations, table tracks and positioning geometry stay native.
- Semantic list/description-list structure stays intact; no wrapper is inserted between a list and its items.
- Form uses its shared field spacing and actions recipe; named-slot popup children remain direct children.
- Remaining dynamic display writes are visibility/configuration: date-picker trigger, Flow output, and size-report SVG. They do not define row/column compositions.
- Story CSS and explicit presentation-hook examples are retained; Stack does not replace intentional styling demonstrations or component-owned anatomy.

## Verification

- Full unit suite: 447 files pass; 6,274 tests pass and 3 skip. Library and static Storybook builds pass. All 97 docs pages pass the documentation checker. Full lint and all five framework type compilers pass; the isolated website build passes for 117 pages. Package smoke passes and size-report verifies tree-shaking across 98 independent bundles.
- All 700 affected previews were captured before editing at 1100px and 420px. A first candidate pass covered all 89 pages and exposed the retained compatibility cases listed above.
- The final settled paired pass completed the first 60 pages in source order, through Skeleton, at both widths. No unexplained migrated-layout differences were found there. An unchanged looping carousel's offscreen slide moves between equivalent loop edges; that observation is recorded separately.
- Chrome DevTools MCP then stopped responding, even to listing tabs. The remaining 29 pages, interaction/accessibility checks and final website browser review are **not signed off**. No alternative browser driver or browser restart was used.
- Stack's inherited color, fixed/minimum content-box filling and padded end distribution passed the browser fixture before the connection failed.
- Inventory refresh: static inline declarations fell from 4,289 in the original inventory to 3,413; the refreshed single-file property ranking remains in `plans/use-case-styles/RESULTS.md`.

Source parity has no failures. Static paired Chrome comparison and final checks are recorded in implementation-checklist.md. Baseline screenshots/geometry and raw logs are local ignored artifacts under tmp/component-verification/layout-migration/. Browser comparison must settle async setup; empty loading controls are not accepted as equivalent layouts.
