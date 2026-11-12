import { describe, expect, it } from 'vitest';

const helper = new URL('../../scripts/pack-smoke-bundle.mjs', import.meta.url).href;
const { bundlesModule } = await import(helper);

const region = (module: string) => `//#region node_modules/@tweakpad/ui/dist/${module}.js\n`;

describe('package smoke module detection', () => {
  it('detects a bundled module by its region', () => {
    expect(bundlesModule(region('components/select/select'), 'components/select/select')).toBe(
      true,
    );
  });

  it('does not take a tag named in a selector list for the component', () => {
    expect(
      bundlesModule(
        `${region('foundation/interactive-target')}const targets = ["tp-select", "tp-dialog"].join(",");`,
        'components/select/select',
      ),
    ).toBe(false);
  });

  it('does not accept a module whose path only starts the same way', () => {
    expect(
      bundlesModule(region('components/select/select-trigger'), 'components/select/select'),
    ).toBe(false);
  });
});
