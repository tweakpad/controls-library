/** Browser-only regression checks, executed through Chrome DevTools MCP. */
const built = new URLSearchParams(location.search).has('built');
if (built)
  document.querySelector<HTMLLinkElement>('link[rel=stylesheet]')!.href = '/dist/styles.css';
const api = await import(/* @vite-ignore */ built ? '/dist/index.js' : '/src/index.ts');
for (const element of [
  api.TpMoTextStroke,
  api.TpMoTextSplit,
  api.TpMoTextMirror,
  api.TpScrollTrigger,
])
  api.defineElement(element.tagName, element);

type Stroke = InstanceType<typeof api.TpMoTextStroke>;
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const cases = document.querySelector('#cases')!;
const checks: { name: string; passed: boolean; detail: unknown }[] = [];
function check(name: string, passed: boolean, detail: unknown = null) {
  checks.push({ name, passed, detail });
}
function outlineState(element: HTMLElement) {
  const piece = (element.querySelector<HTMLElement>("[data-tp-piece='char']") ??
    element.querySelector<HTMLElement>("[data-tp-piece='word']"))!;
  const text = piece.querySelector<SVGTextElement>('svg text')!;
  const range = document.createRange();
  range.selectNodeContents([...piece.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!);
  const rect = range.getBoundingClientRect();
  const box = piece.getBoundingClientRect();
  return {
    font: getComputedStyle(piece).fontSize,
    outline: text.style.fontSize,
    xError: Math.abs(Number(text.getAttribute('x')) - (rect.left - box.left)),
    svg: piece.querySelector('svg'),
    text,
  };
}
async function sample(id: string, split: string): Promise<Stroke> {
  const element = document.createElement('tp-mo-text-stroke') as Stroke;
  element.id = id;
  element.className = 'sample';
  element.split = split;
  element.revealHold = true;
  element.textContent = 'Resize text';
  cases.append(element);
  await wait();
  return element;
}
async function runResizeChecks() {
  checks.length = 0;
  cases.replaceChildren();
  for (const split of ['chars', 'words', 'chars words lines']) {
    const element = await sample(`fixed-${split.replaceAll(' ', '-')}`, split);
    const before = outlineState(element);
    let events = 0;
    element.addEventListener('tp-reveal-change', () => events++);
    element.style.fontSize = '44px';
    await wait();
    const after = outlineState(element);
    check(
      `${split}: fixed-width typography`,
      before.font === '68px' &&
        after.font === '44px' &&
        after.outline === after.font &&
        after.xError < 0.1,
      { before: before.font, after: after.font, outline: after.outline, xError: after.xError },
    );
    check(
      `${split}: pending nodes and state`,
      before.svg === after.svg && before.text === after.text && !element.revealed && events === 0,
    );
    element.remove();
  }

  const wrapped = await sample('wrapped', 'chars words lines');
  wrapped.style.width = '260px';
  wrapped.textContent = 'Responsive text wraps onto several lines';
  await wait();
  const oldLines = wrapped.lines.length;
  const oldChar = wrapped.chars[0];
  const oldOutline = outlineState(wrapped).text;
  wrapped.style.fontSize = '36px';
  await wait();
  check(
    'rewrap: updated outlines and retained characters',
    wrapped.lines.length !== oldLines &&
      wrapped.chars[0] === oldChar &&
      outlineState(wrapped).text === oldOutline &&
      [...wrapped.querySelectorAll<SVGTextElement>('svg text')].every(
        (text) => text.style.fontSize === '36px',
      ),
    { beforeLines: oldLines, afterLines: wrapped.lines.length },
  );
  wrapped.remove();

  const active = await sample('active', 'chars');
  active.style.setProperty('--tp-mo-text-stroke-duration', '1s');
  active.stagger = 0;
  let starts = 0;
  let completions = 0;
  active.addEventListener('tp-reveal-change', () => starts++);
  active.addEventListener('tp-reveal-change-complete', () => completions++);
  active.revealHold = false;
  await wait(160);
  const running = outlineState(active);
  const animation = running.text.getAnimations().find((item) => item.playState === 'running');
  const startTime = animation?.startTime;
  active.style.fontSize = '44px';
  await wait();
  const resized = outlineState(active);
  check(
    'mid-reveal: no replacement or replay',
    Boolean(animation) &&
      running.text === resized.text &&
      animation!.startTime === startTime &&
      starts === 1 &&
      active.revealed,
    { starts, hasRunningAnimation: Boolean(animation) },
  );
  await wait(1100);
  const complete = outlineState(active);
  active.style.fontSize = '52px';
  await wait();
  check(
    'completed: remains settled',
    active.revealed &&
      starts === 1 &&
      completions === 1 &&
      complete.text === outlineState(active).text &&
      getComputedStyle(complete.svg!).opacity === '0',
    { starts, completions },
  );

  const hidden = await sample('hidden', 'words');
  hidden.style.display = 'none';
  hidden.style.fontSize = '36px';
  await wait();
  hidden.style.display = 'block';
  await wait();
  check('hidden to visible', outlineState(hidden).outline === '36px');
  hidden.remove();
  hidden.style.fontSize = '40px';
  cases.append(hidden);
  await wait();
  check('reconnect', outlineState(hidden).outline === '40px' && !hidden.revealed);

  const formatted = await sample('formatted', 'words');
  formatted.innerHTML = 'Read <a href="#formatted"><em>more</em></a>';
  await wait();
  const link = formatted.querySelector('a');
  formatted.style.fontSize = '40px';
  await wait();
  check(
    'accessible text and link identity',
    formatted.querySelector('a') === link &&
      [...formatted.querySelectorAll('svg')].every(
        (svg) => svg.getAttribute('aria-hidden') === 'true',
      ) &&
      [...formatted.querySelectorAll('[data-tp-text]')]
        .map((node) => node.textContent)
        .join('')
        .includes('Read'),
  );

  for (const tag of ['tp-mo-text-split', 'tp-mo-text-mirror']) {
    const sibling = document.createElement(tag);
    sibling.className = 'sample';
    sibling.setAttribute('reveal-hold', '');
    sibling.textContent = 'Shared layout';
    cases.append(sibling);
    await wait();
    const word = sibling.querySelector('[data-tp-piece="word"]');
    sibling.style.fontSize = '44px';
    await wait();
    check(
      `${tag}: unchanged grouping`,
      word === sibling.querySelector('[data-tp-piece="word"]') &&
        !sibling.hasAttribute('data-revealed') &&
        !sibling.querySelector('svg'),
    );
  }

  const responsive = await sample('responsive', 'chars');
  responsive.classList.add('responsive');
  await wait();
  const initialFont = outlineState(responsive).font;
  Object.assign(window, { responsiveInitialFont: initialFont });
  return checks;
}
Object.assign(window, { runResizeChecks, resizeChecks: checks, outlineState });

async function runScrubResizeCheck() {
  const trigger = document.createElement('tp-scroll-trigger');
  trigger.setAttribute('scrub', '');
  trigger.setAttribute('scrub-range', 'cover');
  trigger.style.cssText = 'display:block;margin-block:100vh;height:600px';
  const element = await sample('scrub-resize', 'chars');
  element.revealHold = false;
  trigger.append(element);
  cases.append(trigger);
  await wait();
  const top = trigger.getBoundingClientRect().top + scrollY;
  scrollTo(0, top - innerHeight + 0.45 * (600 + innerHeight));
  await wait(250);
  const before = outlineState(element);
  const animations = before.text.getAnimations();
  const times = animations.map((animation) => animation.currentTime);
  const scrubTime = element.style.getPropertyValue('--_tp-tm-time');
  const progress = (trigger as InstanceType<typeof api.TpScrollTrigger>).progress;
  element.style.fontSize = '44px';
  await wait();
  const after = outlineState(element);
  const current = after.text.getAnimations();
  check(
    'scrub: same nodes, animations and time',
    progress > 0 &&
      progress < 1 &&
      Number.parseFloat(scrubTime) > 0 &&
      element.style.getPropertyValue('--_tp-tm-time') === scrubTime &&
      animations.length > 0 &&
      before.text === after.text &&
      animations.every(
        (animation, index) =>
          animation === current[index] && animation.currentTime === times[index],
      ) &&
      after.outline === '44px',
    {
      progress,
      scrubTime,
      animations: animations.length,
      times,
      after: current.map((animation) => animation.currentTime),
    },
  );
  return checks.at(-1);
}
Object.assign(window, { runScrubResizeCheck });
