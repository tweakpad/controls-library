/** Content-only alpha masks. Geometry is supplied by the shared native scroll adapter. */
export const scrollEdgeCss = `
[data-tp-scroll-edge-mask] {
  mask-image: var(--_tp-scroll-edge-image);
  mask-composite: var(--_tp-scroll-edge-composite);
  mask-size: var(--_tp-scroll-edge-size);
  mask-position: var(--_tp-scroll-edge-position);
  mask-repeat: no-repeat;
  mask-clip: no-clip;
}
@media (forced-colors: active) {
  [data-tp-scroll-edge-mask] { mask-image: none; }
}
`;
export interface ScrollEdgeMaskRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
/** One product of two edge gradients, plus opaque islands preserving sticky/fixed chrome. */
export function scrollEdgeMask(
  rect: ScrollEdgeMaskRect,
  bands: { left: number; right: number; top: number; bottom: number },
  protectedRects: readonly ScrollEdgeMaskRect[],
  original: string,
) {
  const px = (value: number) => `${Math.round(value * 1000) / 1000}px`;
  const x = `linear-gradient(to right,transparent 0px,#000 ${px(bands.left)},#000 ${px(rect.width - bands.right)},transparent ${px(rect.width)})`;
  const y = `linear-gradient(to bottom,transparent 0px,#000 ${px(bands.top)},#000 ${px(rect.height - bands.bottom)},transparent ${px(rect.height)})`;
  const images = protectedRects.map(() => 'linear-gradient(#000,#000)');
  const sizes = protectedRects.map((r) => `${px(r.width)} ${px(r.height)}`);
  const positions = protectedRects.map((r) => `${px(r.left)} ${px(r.top)}`);
  const composites = protectedRects.map(() => 'add');
  images.push(x, y);
  sizes.push(`${px(rect.width)} ${px(rect.height)}`, `${px(rect.width)} ${px(rect.height)}`);
  positions.push(`${px(rect.left)} ${px(rect.top)}`, `${px(rect.left)} ${px(rect.top)}`);
  composites.push('intersect', original === 'none' ? 'add' : 'intersect');
  if (original !== 'none') {
    images.push(original);
    sizes.push('auto');
    positions.push('0 0');
    composites.push('add');
  }
  return {
    image: images.join(','),
    size: sizes.join(','),
    position: positions.join(','),
    composite: composites.join(','),
  };
}
