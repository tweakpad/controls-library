import type { TpFlow } from '../../../../src/widgets/flow/flow.js';

/** Browser-only regression: load a nonempty graph before calling through DevTools MCP. */
export async function verifyMinimapReconnect(flow: TpFlow) {
  if (!flow.value.nodes.length) throw new Error('Load a nonempty graph before this check.');
  const minimap = flow.shadowRoot?.querySelector('tp-flow-minimap');
  if (!minimap?.parentNode) throw new Error('Enable the minimap before this check.');
  const parent = minimap.parentNode;
  const next = minimap.nextSibling;
  const wait = () => new Promise((resolve) => setTimeout(resolve, 200));
  const pixels = () => {
    const canvas = minimap.shadowRoot?.querySelector('canvas');
    if (!canvas?.width || !canvas.height) throw new Error('Expected an allocated minimap.');
    return new Uint8ClampedArray(
      canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data,
    );
  };
  const original = { ...flow.viewport };
  try {
    minimap.remove();
    parent.insertBefore(minimap, next);
    await wait();
    const before = pixels();
    await flow.setViewport(
      { ...original, x: original.x + 100, y: original.y + 10 },
      { duration: 0 },
    );
    await wait();
    const after = pixels();
    return {
      passed: before.some((value, index) => value !== after[index]),
      expected: 'Minimap repaints after direct disconnect/reconnect and a viewport change.',
    };
  } finally {
    await flow.setViewport(original, { duration: 0 });
  }
}
