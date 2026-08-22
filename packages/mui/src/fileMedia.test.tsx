// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormStore } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiCameraCapture, MuiDocumentPreview, MuiFileUpload, MuiMultiFileUpload, MuiSignaturePad, createDefaultMuiRegistry, formatFileSize, validateFiles, type MuiExistingFile, type MuiFileUploadContext } from './index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderField(store: FormStore, child: React.ReactNode, type = 'file') {
  return render(<FormProvider store={store} schema={{ id: 'files', fields: [{ name: 'files', type }] }}>{child}</FormProvider>);
}

function input(container: HTMLElement): HTMLInputElement {
  const element = container.querySelector('input[type="file"]');
  if (!(element instanceof HTMLInputElement)) throw new Error('File input was not rendered');
  return element;
}

describe('@dynamic-forms/mui file validation', () => {
  it('validates MIME/extensions, size, and count with human-readable errors', () => {
    const files = [new File(['content'], 'report.pdf', { type: 'application/pdf' }), new File(['large'], 'photo.png', { type: 'image/png' })];
    const errors = validateFiles(files, { accept: '.pdf', maxFileSize: 4, maxFiles: 1 });
    expect(errors.map((error) => error.code)).toEqual(['count', 'size', 'type', 'size']);
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });
});

describe('@dynamic-forms/mui enterprise file controls', () => {
  it('registers single and multi-file controls by default', () => {
    const registry = createDefaultMuiRegistry();
    expect(registry.file).toBe(MuiFileUpload);
    expect(registry['multi-file']).toBe(MuiMultiFileUpload);
  });

  it('stores a selected File and removes it accessibly', () => {
    const store = new FormStore({ files: undefined });
    const view = renderField(store, <MuiFileUpload name="files" label="Attachment" />);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(input(view.container), { target: { files: [file] } });
    expect(store.getValue('files')).toBe(file);
    fireEvent.click(screen.getByRole('button', { name: 'Remove hello.txt' }));
    expect(store.getValue('files')).toBeUndefined();
  });

  it('accepts drag-and-drop and enforces maximum file count', () => {
    const store = new FormStore({ files: [] });
    renderField(store, <MuiMultiFileUpload name="files" label="Documents" maxFiles={1} />, 'multi-file');
    const dropzone = screen.getByText('Drop files here or browse').closest('[role="button"]');
    if (!dropzone) throw new Error('Dropzone was not rendered');

    fireEvent.drop(dropzone, { dataTransfer: { files: [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')] } });
    expect(screen.getByRole('alert').textContent).toContain('Select no more than 1 file');
    expect(store.getValue('files')).toEqual([]);
  });

  it('renders existing server files with preview, download, and removal', () => {
    const existing: MuiExistingFile = { id: 'asset-1', name: 'invoice.png', size: 2048, thumbnailUrl: '/thumb.png', downloadUrl: '/invoice.png' };
    const store = new FormStore({ files: existing });
    renderField(store, <MuiFileUpload name="files" label="Invoice" />);

    expect(screen.getByRole('img', { name: 'invoice.png preview' }).getAttribute('src')).toBe('/thumb.png');
    expect(screen.getByRole('link', { name: 'Download' }).getAttribute('href')).toBe('/invoice.png');
    fireEvent.click(screen.getByRole('button', { name: 'Remove invoice.png' }));
    expect(store.getValue('files')).toBeUndefined();
  });

  it('reports upload progress and replaces the raw File with the server representation', async () => {
    const store = new FormStore({ files: undefined });
    let finish: ((value: MuiExistingFile) => void) | undefined;
    const uploader = vi.fn((_file: File, context: MuiFileUploadContext) => {
      context.onProgress(45);
      return new Promise<MuiExistingFile>((resolve) => { finish = resolve; });
    });
    const view = renderField(store, <MuiFileUpload name="files" label="Upload" uploader={uploader} />);
    const file = new File(['data'], 'data.csv', { type: 'text/csv' });

    fireEvent.change(input(view.container), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole('progressbar', { name: 'Uploading data.csv' }).getAttribute('aria-valuenow')).toBe('45'));
    finish?.({ id: 'server-1', name: 'data.csv', downloadUrl: '/data.csv' });
    await waitFor(() => expect(store.getValue('files')).toMatchObject({ id: 'server-1' }));
  });

    it('cancels an in-flight upload through AbortSignal', async () => {
    const store = new FormStore({ files: undefined });
    const uploader = vi.fn((_file: File, context: MuiFileUploadContext) => new Promise<MuiExistingFile>((_resolve, reject) => {
      context.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const view = renderField(store, <MuiFileUpload name="files" label="Cancel upload" uploader={uploader} />);
    fireEvent.change(input(view.container), { target: { files: [new File(['x'], 'cancel.txt')] } });

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByText('Upload canceled.')).toBeTruthy());
    expect(store.getValue('files')).toBeInstanceOf(File);
  });
it('supports cancellation and retry after a failed upload', async () => {
    const store = new FormStore({ files: undefined });
    let attempt = 0;
    const uploader = vi.fn((_file: File, context: MuiFileUploadContext) => {
      attempt += 1;
      if (attempt === 1) return Promise.reject(new Error('Network unavailable'));
      return new Promise<MuiExistingFile>((resolve, reject) => {
        context.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        setTimeout(() => resolve({ id: 'retried', name: 'retry.txt' }), 0);
      });
    });
    const view = renderField(store, <MuiFileUpload name="files" label="Retry upload" uploader={uploader} />);
    fireEvent.change(input(view.container), { target: { files: [new File(['x'], 'retry.txt')] } });

    await waitFor(() => expect(screen.getByText('Network unavailable')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(store.getValue('files')).toMatchObject({ id: 'retried' }));
  });
});
describe('@dynamic-forms/mui advanced media controls', () => {
  it('registers camera, signature, and document preview controls', () => {
    const registry = createDefaultMuiRegistry();
    expect(registry.camera).toBe(MuiCameraCapture);
    expect(registry.signature).toBe(MuiSignaturePad);
    expect(registry['document-preview']).toBe(MuiDocumentPreview);
  });

  it('configures the native camera picker and stores captured images', () => {
    const store = new FormStore({ files: undefined });
    const view = renderField(store, <MuiCameraCapture name="files" label="Site photo" facingMode="environment" />, 'camera');
    const captureInput = input(view.container);
    expect(captureInput.accept).toBe('image/*');
    expect(captureInput.getAttribute('capture')).toBe('environment');

    const image = new File(['image'], 'site.jpg', { type: 'image/jpeg' });
    fireEvent.change(captureInput, { target: { files: [image] } });
    expect(store.getValue('files')).toBe(image);
  });

  it('captures and clears a typed PNG signature value', () => {
    const context = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      lineWidth: 1,
      strokeStyle: '',
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,c2lnbmF0dXJl');
    const store = new FormStore({ files: undefined });
    renderField(store, <MuiSignaturePad name="files" label="Customer signature" />, 'signature');
    const canvas = screen.getByRole('img', { name: 'Customer signature drawing area' });

    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    expect(store.getValue('files')).toMatchObject({ dataUrl: 'data:image/png;base64,c2lnbmF0dXJl', mimeType: 'image/png', width: 600, height: 200 });

    fireEvent.click(screen.getByRole('button', { name: 'Clear signature' }));
    expect(store.getValue('files')).toBeUndefined();
  });

  it('renders images directly and PDFs in a sandboxed frame', () => {
    const imageStore = new FormStore({ files: { id: 'image', name: 'scan.png', type: 'image/png', url: '/scan.png' } });
    const imageView = renderField(imageStore, <MuiDocumentPreview name="files" label="Image preview" />, 'document-preview');
    expect(screen.getByRole('img', { name: 'scan.png preview' }).getAttribute('src')).toBe('/scan.png');
    imageView.unmount();

    const pdfStore = new FormStore({ files: { id: 'pdf', name: 'contract.pdf', type: 'application/pdf', url: 'about:blank#contract.pdf' } });
    renderField(pdfStore, <MuiDocumentPreview name="files" label="PDF preview" />, 'document-preview');
    const frame = screen.getByTitle('contract.pdf preview');
    expect(frame.getAttribute('src')).toBe('about:blank#contract.pdf');
    expect(frame.getAttribute('sandbox')).toBe('');
    expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
  });
});
