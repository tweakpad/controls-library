import { html } from 'lit';
import { markupExample } from './documentation-examples.js';
export interface SkeletonArgs {
  motion: 'pulse' | 'sweep' | 'none';
  animated: boolean;
  motionPolicy: 'inherit' | 'normal' | 'reduce';
}
const defaults: SkeletonArgs = { motion: 'pulse', animated: true, motionPolicy: 'inherit' };
export function skeletonProfile(args: SkeletonArgs = defaults) {
  return html`<tp-stack
    aria-busy="true"
    aria-label="Loading profile"
    direction="row"
    gap="4"
    align="center"
  >
    <tp-skeleton
      .motion=${args.motion}
      .animated=${args.animated}
      .motionPolicy=${args.motionPolicy}
      style="inline-size:var(--tp-space-10);block-size:var(--tp-space-10);border-radius:var(--tp-radius-full);flex:none"
    ></tp-skeleton>
    <tp-stack gap="2">
      <tp-skeleton
        .motion=${args.motion}
        .animated=${args.animated}
        .motionPolicy=${args.motionPolicy}
        style="inline-size:calc(var(--tp-spacing) * 38);block-size:var(--tp-space-4)"
      ></tp-skeleton>
      <tp-skeleton
        .motion=${args.motion}
        .animated=${args.animated}
        .motionPolicy=${args.motionPolicy}
        style="inline-size:calc(var(--tp-spacing) * 25);block-size:var(--tp-space-4)"
      ></tp-skeleton>
    </tp-stack>
  </tp-stack>`;
}
export const skeletonSource = `<tp-stack aria-busy="true" aria-label="Loading profile" direction="row" gap="4" align="center">
  <tp-skeleton style="inline-size:var(--tp-space-10);block-size:var(--tp-space-10);border-radius:var(--tp-radius-full);flex:none"></tp-skeleton>
  <tp-stack gap="2">
    <tp-skeleton style="inline-size:calc(var(--tp-spacing) * 38);block-size:var(--tp-space-4)"></tp-skeleton>
    <tp-skeleton style="inline-size:calc(var(--tp-spacing) * 25);block-size:var(--tp-space-4)"></tp-skeleton>
  </tp-stack>
</tp-stack>`;
const line = (width: string) =>
  `<tp-skeleton style="inline-size:${width};block-size:var(--tp-space-4)"></tp-skeleton>`;
const field = (width: number) => `<tp-stack gap="3">
  ${line(`calc(var(--tp-spacing) * ${width})`)}
  <tp-skeleton style="block-size:var(--tp-control-height-md)"></tp-skeleton>
</tp-stack>`;
const row = `<tp-stack direction="row" gap="4">
  <tp-skeleton style="flex:1;block-size:var(--tp-space-4)"></tp-skeleton>
  ${line('calc(var(--tp-spacing) * 24)')}
  ${line('calc(var(--tp-spacing) * 20)')}
</tp-stack>`;
export const skeletonExamples = [
  markupExample(
    'Media preview',
    `<tp-stack aria-busy="true"  gap="3">
  <tp-aspect-ratio ratio="2" style="border-radius:var(--tp-radius-xl)">
    <tp-skeleton style="border-radius:inherit"></tp-skeleton>
  </tp-aspect-ratio>
  <tp-stack gap="2">
    ${line('100%')}
    ${line('80%')}
  </tp-stack>
</tp-stack>`,
    'Reserve a two-to-one media region and its captions while content loads.',
  ),
  markupExample(
    'Card',
    `<tp-card aria-busy="true" >
  <tp-stack slot="header" gap="2">
    ${line('66%')}
    ${line('50%')}
  </tp-stack>
  <tp-skeleton style="aspect-ratio:1;inline-size:100%"></tp-skeleton>
</tp-card>`,
  ),
  markupExample(
    'Text',
    `<tp-stack aria-busy="true"  gap="2">
  ${line('100%')}
  ${line('100%')}
  ${line('75%')}
</tp-stack>`,
  ),
  markupExample(
    'Form',
    `<div aria-busy="true" style="display:grid;gap:calc(var(--tp-spacing) * 7)">
  ${field(20)}
  ${field(24)}
  <tp-skeleton style="inline-size:calc(var(--tp-spacing) * 24);block-size:var(--tp-control-height-md)"></tp-skeleton>
</div>`,
    'Reserve the labels, inputs and submit action while form data loads.',
  ),
  markupExample(
    'Table',
    `<tp-stack aria-busy="true"  gap="2">
  ${[row, row, row].join('\n  ')}
</tp-stack>`,
    'Reserve repeated row geometry without exposing fake data or focusable controls.',
  ),
];
