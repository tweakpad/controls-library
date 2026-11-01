import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../', import.meta.url).pathname;
const owner = 'src/presentation/recipes/shared/edges.ts';

/** Line and control-fill roles: only the edge module names them. */
const lineRole =
  /var\(--tp-(?:border|edge|hairline|input|control|control-strong|control-border|(?:primary|destructive|success|warning|pressed)-border)\)/gu;
/** A line color mixed from the foreground over transparency, which bypasses every role. */
const foregroundLine = /color-mix\(in oklab,\s*var\(--tp-foreground\)\s*\d+%,\s*transparent\)/gu;

/**
 * Sources that keep a line color of their own, each for a reason that is not a component edge.
 * The value is the number of matches the file may keep.
 */
const allowed: Readonly<Record<string, { count: number; reason: string }>> = {
  'src/presentation/recipes/shared/handle.ts': {
    count: 1,
    reason: 'Handle rings mark a position over value paint; they stay in every appearance.',
  },
  'src/presentation/recipes/easing-editor.ts': {
    count: 2,
    reason: 'Chart ticks and grid dots are value paint of the curve plot.',
  },
  'src/presentation/recipes/color-picker.ts': {
    count: 1,
    reason:
      'The wheel’s harmony line marks positions over value paint; it stays in every appearance.',
  },
  'src/presentation/recipes/flow.ts': {
    count: 5,
    reason: 'Canvas grid, graph edge strokes and minimap nodes are canvas content paint.',
  },
  'src/presentation/recipes/command-surface.ts': {
    count: 1,
    reason: 'The item highlight is a tint over the translucent surface, not a line.',
  },
  'src/presentation/recipes/slider.ts': {
    count: 2,
    reason: 'The bar variant’s track and buffer are value fills, not lines.',
  },
  'src/presentation/recipes/media-player.ts': {
    count: 1,
    reason: 'The media button’s highlight over video is a fill, not a line.',
  },
  'src/presentation/recipes/navigation-panel.ts': {
    count: 1,
    reason: 'The group label’s text tint is not a line.',
  },
  'src/presentation/recipes/shared/document-content.ts': {
    count: 1,
    reason: 'The link underline is text decoration, not a component edge.',
  },
  'src/components/media-player/styles.ts': {
    count: 1,
    reason: 'The frosted overlay’s top highlight over video is a light effect, not an edge.',
  },
  'src/components/mo-glow-border/styles.ts': {
    count: 1,
    reason: 'The motion border’s resting line is its own public color property’s fallback.',
  },
  'src/components/mo-segment-border/styles.ts': {
    count: 1,
    reason: 'The motion border’s resting line is its own public color property’s fallback.',
  },
};

function sources(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sources(path);
    return name.endsWith('.ts') ? [path] : [];
  });
}

describe('every line comes from the edge module', () => {
  it('no recipe, component or widget names a line role or mixes a line color itself', () => {
    const offenders: string[] = [];
    for (const directory of ['src/presentation/recipes', 'src/components', 'src/widgets']) {
      for (const path of sources(join(root, directory))) {
        const file = relative(root, path);
        if (file === owner) continue;
        const text = readFileSync(path, 'utf8');
        const matches = [...text.matchAll(lineRole), ...text.matchAll(foregroundLine)].map(
          (match) => match[0],
        );
        const keep = allowed[file]?.count ?? 0;
        if (matches.length > keep) offenders.push(`${file}: ${matches.join(', ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('focus halos come only from the focus module', () => {
    const halo = /color-mix\(in oklab,\s*var\(--tp-(?:ring|destructive)\)\s*50%,\s*transparent\)/u;
    const offenders: string[] = [];
    for (const directory of ['src/presentation/recipes', 'src/components', 'src/widgets'])
      for (const path of sources(join(root, directory))) {
        const file = relative(root, path);
        if (
          file !== 'src/presentation/recipes/shared/focus.ts' &&
          halo.test(readFileSync(path, 'utf8'))
        )
          offenders.push(file);
      }
    expect(offenders).toEqual([]);
  });

  it('every allowance is still in use', () => {
    for (const [file, { count }] of Object.entries(allowed)) {
      const text = readFileSync(join(root, file), 'utf8');
      const matches = [...text.matchAll(lineRole), ...text.matchAll(foregroundLine)];
      expect(matches.length, file).toBe(count);
    }
  });
});
