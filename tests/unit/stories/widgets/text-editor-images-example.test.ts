import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TpTextEditor } from '../../../../src/widgets/text-editor/index.js';
import { setupImageUploads } from '../../../../src/stories/widgets/text-editor-images-example.js';

const captured = vi.hoisted(() => ({
  options: null as null | {
    upload(
      file: Blob,
      options: { signal: AbortSignal; onProgress: (sent: number, total: number) => void },
    ): Promise<string>;
  },
}));
vi.mock('../../../../src/widgets/text-editor/features/index.js', () => ({
  textEditorImages: (options: typeof captured.options) => {
    captured.options = options;
    return {};
  },
}));
vi.mock('../../../../src/stories/widgets/text-editor-engine.js', () => ({
  createEngine: () => ({}),
}));

let removed: () => void;
const disconnect = vi.fn();
function setup() {
  const page = new EventTarget();
  const editor = { isConnected: true, ownerDocument: { defaultView: page } };
  setupImageUploads(editor as unknown as TpTextEditor);
  return { editor, page, upload: captured.options!.upload };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:demo-upload');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.stubGlobal(
    'MutationObserver',
    class {
      constructor(callback: () => void) {
        removed = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  disconnect.mockClear();
});

describe('image upload demo lifecycle', () => {
  it('reports eight progress steps and releases the completed URL when removed', async () => {
    const { editor, upload } = setup();
    const progress = vi.fn();
    const result = upload(new Blob(['image']), {
      signal: new AbortController().signal,
      onProgress: progress,
    });
    await vi.advanceTimersByTimeAsync(1600);
    await expect(result).resolves.toBe('blob:demo-upload');
    expect(progress).toHaveBeenCalledTimes(8);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    editor.isConnected = false;
    removed();
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:demo-upload');
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops an aborted upload before creating a URL', async () => {
    const { upload } = setup();
    const controller = new AbortController();
    const result = upload(new Blob(['image']), { signal: controller.signal, onProgress: vi.fn() });
    const rejected = expect(result).rejects.toBe('cancelled');
    controller.abort('cancelled');
    await rejected;
    await vi.advanceTimersByTimeAsync(2000);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects an already aborted upload without starting a timer', async () => {
    const { upload } = setup();
    await expect(
      upload(new Blob(), { signal: AbortSignal.abort('cancelled'), onProgress: vi.fn() }),
    ).rejects.toBe('cancelled');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves URLs in the page cache and releases them on a real navigation', async () => {
    const { page, upload } = setup();
    const result = upload(new Blob(['image']), {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(1600);
    await result;
    page.dispatchEvent(Object.assign(new Event('pagehide'), { persisted: true }));
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    page.dispatchEvent(Object.assign(new Event('pagehide'), { persisted: false }));
    page.dispatchEvent(new Event('pagehide'));
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:demo-upload');
  });
});
