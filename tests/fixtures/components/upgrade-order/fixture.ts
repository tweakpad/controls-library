/**
 * Owners whose members upgrade after them. `?case=<name>&order=owner-first` defines the owner
 * (with what it declares it renders), lets its first updates run, then defines its members;
 * `order=members-first` defines them the other way round, as `@tweakpad/ui/register` effectively
 * does. Each load runs one case and publishes `window.upgradeOrder.result`: the errors thrown or
 * logged, which member tags the owner's own definition already defined, and a snapshot of the
 * state attributes in light and shadow DOM before and after one press on a member. Compare the
 * snapshots of both orders. Driven only through the Chrome DevTools MCP (see README.md).
 */
import * as components from '../../../../src/components/index.js';
import * as widgets from '../../../../src/widgets/index.js';
import { defineElement } from '../../../../src/foundation/define.js';

type Constructor = CustomElementConstructor & { tagName: string };
interface Case {
  markup: string;
  owner: string;
  /** Defined after the owner; none for a composite, whose own definition is under test. */
  members: string[];
  /** A component that renders owners in its shadow root: defined alone, then everything else. */
  composite?: boolean;
  /** The member a press goes to, after both are defined. */
  press?: string;
}

const cases: Record<string, Case> = {
  'toggle-group': {
    markup:
      '<tp-toggle-group><tp-toggle value="a">A</tp-toggle><tp-toggle value="b">B</tp-toggle><tp-toggle value="c">C</tp-toggle></tp-toggle-group>',
    owner: 'TpToggleGroup',
    members: ['TpToggle'],
    press: 'tp-toggle[value="b"]',
  },
  'radio-group': {
    markup:
      '<tp-radio-group aria-label="Plan"><tp-radio-group-item value="a">A</tp-radio-group-item><tp-radio-group-item value="b">B</tp-radio-group-item></tp-radio-group>',
    owner: 'TpRadioGroup',
    members: ['TpRadioGroupItem'],
    press: 'tp-radio-group-item[value="b"]',
  },
  accordion: {
    markup:
      '<tp-accordion><tp-accordion-item value="a" heading="First">One</tp-accordion-item><tp-accordion-item value="b" heading="Second">Two</tp-accordion-item></tp-accordion>',
    owner: 'TpAccordion',
    members: ['TpAccordionItem'],
    press: 'tp-accordion-item[value="b"]',
  },
  'tree-view': {
    markup:
      '<tp-tree-view label="Files"><tp-tree-item value="src">src<tp-tree-item value="a.ts">a.ts</tp-tree-item></tp-tree-item><tp-tree-item value="b.ts">b.ts</tp-tree-item></tp-tree-view>',
    owner: 'TpTreeView',
    members: ['TpTreeItem'],
    press: 'tp-tree-item[value="b.ts"]',
  },
  form: {
    markup:
      '<tp-form><tp-field label="Name" description="As on your card"><tp-input name="name" required></tp-input></tp-field></tp-form>',
    owner: 'TpForm',
    members: ['TpField', 'TpInput'],
  },
  field: {
    markup:
      '<tp-field label="Email" description="We never share it"><tp-input name="email"></tp-input></tp-field>',
    owner: 'TpField',
    members: ['TpInput'],
  },
  menubar: {
    markup:
      '<tp-menubar aria-label="Editor"><tp-menu value="file" label="File"><tp-button slot="trigger" variant="ghost">File</tp-button><tp-menu-item value="new">New</tp-menu-item></tp-menu><tp-menu value="edit" label="Edit"><tp-button slot="trigger" variant="ghost">Edit</tp-button><tp-menu-item value="undo">Undo</tp-menu-item></tp-menu></tp-menubar>',
    owner: 'TpMenubar',
    members: ['TpMenu', 'TpMenuItem', 'TpButton'],
  },
  'slider-thumbs': {
    markup:
      '<tp-slider label="Hours" default-value="[9, 17]" max="24"><tp-slider-thumb index="0" value-text="Start"></tp-slider-thumb><tp-slider-thumb index="1" value-text="End"></tp-slider-thumb></tp-slider>',
    owner: 'TpSlider',
    members: ['TpSliderThumb'],
  },
  'kbd-group': {
    markup:
      '<tp-kbd-group><tp-kbd value="command"></tp-kbd><tp-kbd value="K"></tp-kbd></tp-kbd-group>',
    owner: 'TpKbdGroup',
    members: ['TpKbd'],
  },
  'navigation-menu': {
    markup:
      '<tp-navigation-menu aria-label="Main"><tp-navigation-menu-item value="product"><tp-button slot="trigger" variant="ghost">Product</tp-button><div slot="content">Overview</div></tp-navigation-menu-item></tp-navigation-menu>',
    owner: 'TpNavigationMenu',
    members: ['TpNavigationMenuItem', 'TpButton'],
  },
  'description-list': {
    markup:
      '<tp-description-list><tp-description-list-item label="Order">#48213</tp-description-list-item><tp-description-list-item label="Status">Paid</tp-description-list-item></tp-description-list>',
    owner: 'TpDescriptionList',
    members: ['TpDescriptionListItem'],
  },
  'message-scroller': {
    markup:
      '<tp-message-scroller label="Conversation"><tp-message-scroller-item message-id="q-1" scroll-anchor>Question</tp-message-scroller-item><tp-message-scroller-item message-id="a-1">Answer</tp-message-scroller-item></tp-message-scroller>',
    owner: 'TpMessageScroller',
    members: ['TpMessageScrollerItem'],
  },
  // Components that render the owners above in their own shadow roots.
  'theme-switcher': {
    markup: '<tp-theme-switcher></tp-theme-switcher>',
    owner: 'TpThemeSwitcher',
    members: [],
    composite: true,
  },
  'color-picker': {
    markup: '<tp-color-picker></tp-color-picker>',
    owner: 'TpColorPicker',
    members: [],
    composite: true,
  },
  'easing-editor': {
    markup: '<tp-easing-editor></tp-easing-editor>',
    owner: 'TpEasingEditor',
    members: [],
    composite: true,
  },
  'text-editor': {
    markup: '<tp-text-editor></tp-text-editor>',
    owner: 'TpTextEditor',
    members: [],
    composite: true,
  },
  'flow-controls': {
    markup: '<tp-flow-controls></tp-flow-controls>',
    owner: 'TpFlowControls',
    members: [],
    composite: true,
  },
  'flow-inspector': {
    markup: '<tp-flow-inspector></tp-flow-inspector>',
    owner: 'TpFlowInspector',
    members: [],
    composite: true,
  },
};

const errors = new Map<string, number>();
const note = (message: string) => errors.set(message, (errors.get(message) ?? 0) + 1);
addEventListener('error', (event) => note(String(event.error?.message ?? event.message)));
addEventListener('unhandledrejection', (event) =>
  note(String(event.reason?.message ?? event.reason)),
);
const consoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  note(args.map(String).join(' ').slice(0, 200));
  consoleError(...args);
};

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
};
const exports = { ...components, ...widgets } as unknown as Record<string, Constructor>;
const define = (name: string) => {
  const constructor = exports[name];
  if (!constructor) throw new Error(`No export ${name}`);
  defineElement(constructor.tagName, constructor);
};

/** State attributes in light and shadow DOM, with generated ids replaced by a placeholder. */
function snapshot(root: Element): string[] {
  const lines: string[] = [];
  const keep = (name: string) =>
    name === 'role' ||
    name.startsWith('aria-') ||
    (name.startsWith('data-') && !name.startsWith('data-tp-presentation')) ||
    ['value', 'checked', 'disabled', 'tabindex', 'hidden', 'open', 'selected'].includes(name);
  const walk = (node: Element | ShadowRoot, path: string) => {
    for (const element of node.children) {
      const here = `${path}>${element.localName}`;
      const attributes = [...element.attributes]
        .filter((attribute) => keep(attribute.name))
        .map((attribute) => `${attribute.name}=${attribute.value.replace(/[\w-]*-\d+\b/g, '#id')}`)
        .sort();
      if (attributes.length) lines.push(`${here} ${attributes.join(' ')}`);
      if (element.shadowRoot) walk(element.shadowRoot, `${here}::shadow`);
      walk(element, here);
    }
  };
  walk(root, '');
  return lines;
}

/** The `tp-` tags in light and shadow DOM that have no definition. */
function undefinedTags(root: Element): string[] {
  const tags = new Set<string>();
  const walk = (node: Element | ShadowRoot) => {
    for (const element of node.querySelectorAll('*')) {
      if (element.localName.startsWith('tp-') && !customElements.get(element.localName))
        tags.add(element.localName);
      if (element.shadowRoot) walk(element.shadowRoot);
    }
  };
  walk(root);
  return [...tags].sort();
}

/** Every component and widget, through the package's own registration entries. */
async function registerAll() {
  // Absolute URLs: a relative dynamic import would load second instances of the modules.
  for (const entry of ['/src/register.ts', '/src/register/widgets.ts'])
    await import(/* @vite-ignore */ new URL(entry, location.href).href);
}

function press(root: Element, selector: string): boolean {
  const member = root.querySelector<HTMLElement & { controlElement?: HTMLElement | null }>(
    selector,
  );
  if (!member) return false;
  const target =
    member.controlElement ??
    member.shadowRoot?.querySelector<HTMLElement>('button, [role=radio], [role=treeitem], input') ??
    member;
  target.click();
  return true;
}

async function run() {
  const params = new URL(location.href).searchParams;
  const name = params.get('case') ?? 'toggle-group';
  const order = params.get('order') ?? 'owner-first';
  const test = cases[name];
  if (!test) return { error: `unknown case ${name}`, cases: Object.keys(cases) };
  const root = document.getElementById('stage')!;
  root.innerHTML = test.markup;
  const memberTags = test.members.map((member) => exports[member]!.tagName);
  let definedByOwner: string[] = [];
  let undefinedAlone: string[] = [];
  if (order === 'owner-first') {
    define(test.owner);
    definedByOwner = memberTags.filter((tag) => customElements.get(tag));
    await settle();
    if (test.composite) undefinedAlone = undefinedTags(root);
  }
  const errorsBeforeMembers = [...errors];
  if (test.composite) await registerAll();
  else for (const member of test.members) define(member);
  if (order !== 'owner-first') define(test.owner);
  await settle();
  const before = snapshot(root);
  const pressed = test.press ? press(root, test.press) : false;
  await settle();
  return {
    case: name,
    order,
    definedByOwner,
    undefinedAlone,
    errorsBeforeMembers,
    errors: [...errors],
    pressed,
    before,
    after: pressed ? snapshot(root) : null,
  };
}

const result = await run();
Object.assign(window, { upgradeOrder: { result, cases: Object.keys(cases) } });
document.documentElement.dataset.fixtureReady = '';
