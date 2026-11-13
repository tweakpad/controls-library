/**
 * Two-dimensional roving navigation of a grid of cells (Foundation §14.9): the key commands of
 * a date grid, read once from a key event, and the walk to the next present cell. Calendar day
 * grids and heatmap grids share it; each maps a step onto its own cells (a calendar steps by days,
 * a heatmap by its column and row ticks).
 */

/** A navigation command of a grid key. */
export type GridKeyMove =
  /** An arrow: one column (inline axis, mirrored in right-to-left) or one row. */
  | { readonly kind: 'step'; readonly columns: -1 | 0 | 1; readonly rows: -1 | 0 | 1 }
  /** Home or End: the start or end of the current row. */
  | { readonly kind: 'line'; readonly edge: 'start' | 'end' }
  /** Control+Home or Control+End: the first or last cell of the grid. */
  | { readonly kind: 'grid'; readonly edge: 'start' | 'end' }
  /** Page Up or Page Down; `large` with Shift (a calendar's year). */
  | { readonly kind: 'page'; readonly direction: -1 | 1; readonly large: boolean };

/** The command of a key event, or null for a key the grid leaves alone. */
export function gridKeyMove(event: KeyboardEvent, rtl: boolean): GridKeyMove | null {
  const inline = rtl ? -1 : 1;
  switch (event.key) {
    case 'ArrowRight':
      return { kind: 'step', columns: inline as 1 | -1, rows: 0 };
    case 'ArrowLeft':
      return { kind: 'step', columns: -inline as 1 | -1, rows: 0 };
    case 'ArrowDown':
      return { kind: 'step', columns: 0, rows: 1 };
    case 'ArrowUp':
      return { kind: 'step', columns: 0, rows: -1 };
    case 'Home':
    case 'End': {
      const edge = event.key === 'Home' ? 'start' : 'end';
      return event.ctrlKey || event.metaKey ? { kind: 'grid', edge } : { kind: 'line', edge };
    }
    case 'PageUp':
      return { kind: 'page', direction: -1, large: event.shiftKey };
    case 'PageDown':
      return { kind: 'page', direction: 1, large: event.shiftKey };
    default:
      return null;
  }
}

/** A sparse grid of `columns` × `rows` positions, some of which hold a cell. */
export interface GridCells {
  readonly columns: number;
  readonly rows: number;
  /** Whether a cell can take focus at this position. */
  present(column: number, row: number): boolean;
}

/**
 * The next present cell from `column`, `row` stepping by `columnStep`, `rowStep`, skipping absent
 * positions; null when the walk leaves the grid without finding one.
 */
export function stepGridCell(
  grid: GridCells,
  column: number,
  row: number,
  columnStep: number,
  rowStep: number,
): { column: number; row: number } | null {
  if (!columnStep && !rowStep) return null;
  let c = column + columnStep;
  let r = row + rowStep;
  while (c >= 0 && r >= 0 && c < grid.columns && r < grid.rows) {
    if (grid.present(c, r)) return { column: c, row: r };
    c += columnStep;
    r += rowStep;
  }
  return null;
}

/** The first (`start`) or last (`end`) present cell of `row`. */
export function rowEdgeCell(
  grid: GridCells,
  edge: 'start' | 'end',
  row: number,
): { column: number; row: number } | null {
  for (let i = 0; i < grid.columns; i += 1) {
    const column = edge === 'start' ? i : grid.columns - 1 - i;
    if (grid.present(column, row)) return { column, row };
  }
  return null;
}
