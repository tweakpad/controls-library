import type { PropertyValues } from 'lit';
import { describe, it, expect } from 'vitest';
import { TpPlot } from '../../../../src/widgets/plot/plot.js';
class ServerPlot extends TpPlot {
  prepare() {
    this.willUpdate(new Map() as PropertyValues<this>);
  }
  template() {
    return this.render();
  }
}
function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(text).join(' ');
  if (value && typeof value === 'object' && 'values' in value) return text(value.values);
  return '';
}
describe('Plot server text', () => {
  it('constructs and prepares its caption/label without a document or Canvas', () => {
    const plot = new ServerPlot();
    plot.label = 'CPU history';
    plot.description = 'Most observations stay below the target.';
    plot.series = [{ id: 'load', label: 'Load' }];
    plot.data = {
      load: [
        [0, 20],
        [1, 30],
      ],
    };
    plot.prepare();
    const content = text(plot.template());
    expect(content).toContain('CPU history');
    expect(content).toContain('Most observations stay below the target.');
    expect(plot.getSummary().series.load!.count).toBe(2);
    expect(plot.renderStats.fullRedraws).toBe(0);
  });
});
