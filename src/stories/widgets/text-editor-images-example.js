import { textEditorImages } from '../../widgets/text-editor/features/index.js';
import { createEngine } from './text-editor-engine.js';

/** The image tool with a simulated upload, limited to PNG, JPEG and WebP up to 5 MB. */
export function setupImageUploads(editor) {
  const urls = new Set();
  const page = editor.ownerDocument.defaultView;
  const release = () => {
    observer.disconnect();
    page.removeEventListener('pagehide', leave);
    for (const url of urls) URL.revokeObjectURL(url);
    urls.clear();
  };
  const leave = (event) => {
    // A cached page still needs its images when the user returns.
    if (!event.persisted) release();
  };
  const observer = new MutationObserver(() => {
    if (!editor.isConnected) release();
  });

  /** Simulate storage: report progress, stop on abort and retain the image while the demo lives. */
  function upload(file, { signal, onProgress }) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }
      const total = Math.max(file.size, 1);
      let step = 0;
      const abort = () => {
        clearInterval(timer);
        reject(signal.reason);
      };
      const timer = setInterval(() => {
        const sent = Math.ceil((total * ++step) / 8);
        onProgress(sent, total);
        if (signal.aborted || step < 8) return;
        clearInterval(timer);
        signal.removeEventListener('abort', abort);
        const url = URL.createObjectURL(file);
        urls.add(url);
        // Observe removal only after an upload creates a resource that needs cleanup.
        observer.observe(editor.ownerDocument, { childList: true, subtree: true });
        page.addEventListener('pagehide', leave);
        resolve(url);
      }, 200);
      signal.addEventListener('abort', abort, { once: true });
    });
  }

  editor.features = [
    textEditorImages({ upload, accept: 'image/png,image/jpeg,image/webp', maxFileSize: '5MB' }),
  ];
  editor.engine = createEngine();
}
