import { roundTo } from '../values.js';

/** One corner's horizontal and vertical radius, in pixels. */
export interface CornerRadius {
  readonly x: number;
  readonly y: number;
}

/** A border box: its size and corner radii in the order top-left, top-right, bottom-right, bottom-left. */
export interface RingBox {
  readonly width: number;
  readonly height: number;
  readonly radii: readonly [CornerRadius, CornerRadius, CornerRadius, CornerRadius];
}

export interface RingPath {
  /** SVG path data, clockwise from the start of the top edge. */
  readonly d: string;
  /** The perimeter in pixels. */
  readonly length: number;
}

/** A computed corner radius (`8px`, `8px 4px`, `50%`) in pixels for a box of `width` × `height`. */
export function parseCornerRadius(value: string, width: number, height: number): CornerRadius {
  const [first = '0', second = first] = value.trim().split(/\s+/);
  const resolve = (token: string, size: number) =>
    token.endsWith('%') ? (parseFloat(token) / 100) * size : parseFloat(token) || 0;
  return { x: Math.max(0, resolve(first, width)), y: Math.max(0, resolve(second, height)) };
}

/**
 * Radii as the browser draws them: when adjacent radii exceed a side, all of them shrink by the
 * same factor (CSS Backgrounds `border-radius` overlap rule).
 */
export function fitCornerRadii(box: RingBox): RingBox['radii'] {
  const [tl, tr, br, bl] = box.radii;
  const ratio = (side: number, sum: number) => (sum > side ? side / sum : 1);
  const factor = Math.min(
    ratio(box.width, tl.x + tr.x),
    ratio(box.width, bl.x + br.x),
    ratio(box.height, tl.y + bl.y),
    ratio(box.height, tr.y + br.y),
  );
  const scale = (radius: CornerRadius) => ({ x: radius.x * factor, y: radius.y * factor });
  return [scale(tl), scale(tr), scale(br), scale(bl)];
}

/** A quarter ellipse's arc length (Ramanujan's perimeter approximation). */
function quarterArc(radius: CornerRadius): number {
  const { x, y } = radius;
  if (x === 0 || y === 0) return 0;
  const h = (x - y) ** 2 / (x + y) ** 2;
  return (Math.PI * (x + y) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))) / 4;
}

/**
 * The centerline of a border `inset` pixels inside `box` (half the stroke width, so the stroke
 * covers the border exactly): a closed path through the fitted corner radii, each reduced by the
 * inset, clockwise from the end of the top-left corner.
 */
export function ringPath(box: RingBox, inset: number): RingPath {
  const fitted = fitCornerRadii(box);
  const x0 = inset;
  const y0 = inset;
  const x1 = Math.max(x0, box.width - inset);
  const y1 = Math.max(y0, box.height - inset);
  const [tl, tr, br, bl] = fitted.map((radius) => ({
    x: Math.max(0, radius.x - inset),
    y: Math.max(0, radius.y - inset),
  })) as [CornerRadius, CornerRadius, CornerRadius, CornerRadius];
  const arc = (radius: CornerRadius, x: number, y: number) =>
    radius.x > 0 && radius.y > 0
      ? `A${roundTo(radius.x, 3)} ${roundTo(radius.y, 3)} 0 0 1 ${roundTo(x, 3)} ${roundTo(y, 3)}`
      : `L${roundTo(x, 3)} ${roundTo(y, 3)}`;
  const d = [
    `M${roundTo(x0 + tl.x, 3)} ${roundTo(y0, 3)}`,
    `H${roundTo(x1 - tr.x, 3)}`,
    arc(tr, x1, y0 + tr.y),
    `V${roundTo(y1 - br.y, 3)}`,
    arc(br, x1 - br.x, y1),
    `H${roundTo(x0 + bl.x, 3)}`,
    arc(bl, x0, y1 - bl.y),
    `V${roundTo(y0 + tl.y, 3)}`,
    arc(tl, x0 + tl.x, y0),
    'Z',
  ].join('');
  const width = x1 - x0;
  const height = y1 - y0;
  const length =
    Math.max(0, width - tl.x - tr.x) +
    Math.max(0, width - bl.x - br.x) +
    Math.max(0, height - tl.y - bl.y) +
    Math.max(0, height - tr.y - br.y) +
    quarterArc(tl) +
    quarterArc(tr) +
    quarterArc(br) +
    quarterArc(bl);
  return { d, length };
}
