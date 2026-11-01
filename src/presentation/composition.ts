import type { PresentationDeclarations } from './resolver.js';

/** The same logical seam geometry for ButtonGroup and zero-spacing ToggleGroup. */
export function joinedControlPresentation(
  index: number,
  count: number,
  orientation: 'horizontal' | 'vertical',
  // The group ends restore the members' own outer shape (their large radius).
  radius: string | null = 'var(--tp-radius-lg)',
): PresentationDeclarations {
  const first = index === 0;
  const last = index === count - 1;
  const vertical = orientation === 'vertical';
  const corners = {
    'border-start-start-radius': first ? radius : '0',
    'border-start-end-radius': (vertical ? first : last) ? radius : '0',
    'border-end-start-radius': (vertical ? last : first) ? radius : '0',
    'border-end-end-radius': last ? radius : '0',
  };
  return {
    ...Object.fromEntries(Object.entries(corners).filter(([, value]) => value !== null)),
    ...(first
      ? {}
      : { [vertical ? 'border-block-start-width' : 'border-inline-start-width']: '0' }),
    // Each member's end edge is the seam to the next: `joined-edge-width` wide, with the fill kept
    // inside it, so where the edge is transparent (the flat appearance) the seam reads as a gap
    // cut through the fills instead of one surface.
    ...(last
      ? {}
      : {
          [vertical ? 'border-block-end-width' : 'border-inline-end-width']:
            'var(--tp-joined-edge-width)',
        }),
    'background-clip': 'padding-box',
    // Vertical members stretch to the widest member without losing their own extent
    // (a fixed `inline-size: 100%` collapses square icon controls in a fit-content group).
    ...(vertical ? { 'min-inline-size': '100%' } : {}),
  };
}
