import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Unit tests live under tests/unit, mirroring src. Vitest runs only those, so a test module left in
// src would never run and would be compiled into the package build.

const src = new URL('../../src/', import.meta.url).pathname;
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );

describe('unit test layout', () => {
  it('keeps every test module under tests/unit, none in src', () => {
    const misplaced = files(src)
      .filter((file) => /\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(file))
      .map((file) => relative(src, file));
    expect(misplaced).toEqual([]);
  });
});
