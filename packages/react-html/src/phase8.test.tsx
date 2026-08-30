/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HtmlFileUploadProvider,
  HtmlForm,
  HtmlSignatureProvider,
  createSafeFileSnapshot,
  createDefaultHtmlRegistry,
  validateSelectedFiles,
} from './index';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderField(field: FieldSchema, value: unknown, children?: (form: React.ReactNode) => React.ReactNode) {
  const schema: FormSchema = { id: 'media', fields: [field] };
  const store = new FormStore({ [field.name]: value });
  const form = <HtmlForm />;
  const view = render(<FormProvider store={store} schema={schema}>{children ? children(form) : form}</FormProvider>);
  return { store, view };
}

function file(name: string, type: string, size = 4, lastModified = 1): File {
  return new File(['x'.repeat(size)], name, { type, lastModified });
}

describe('Phase 8 file validation and privacy', () => {
  it('validates MIME/extensions, size, count, and duplicates', () => {
    expect(validateSelectedFiles([file('a.pdf', 'application/pdf')], { accept: '.pdf' })).toBeUndefined();
    expect(validateSelectedFiles([file('a.exe', 'application/octet-stream')], { accept: 'image/*,.pdf' })).toMatch(/not accepted/);
    expect(validateSelectedFiles([file('large.pdf', 'application/pdf', 10)], { maxFileSize: 5 })).toMatch(/byte limit/);
    expect(validateSelectedFiles([file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf')], { maxFiles: 1 })).toMatch(/no more than/);
    expect(validateSelectedFiles([file('same.pdf', 'application/pdf'), file('same.pdf', 'application/pdf')])).toMatch(/Duplicate/);
  });

  it('creates snapshots without names, timestamps, paths, or contents', () => {
    const selected = file('customer-secret.pdf', 'application/pdf', 12, 999);
    const serialized = JSON.stringify(createSafeFileSnapshot([selected]));
    expect(serialized).toContain('application/pdf');
    expect(serialized).not.toContain('customer-secret');
    expect(serialized).not.toContain('999');
    expect(serialized).not.toContain('xxxxxxxx');
  });

  it('writes validation failures into form error state and clears them after a valid selection', async () => {
    const { store, view } = renderField({
      name: 'document', type: 'file', label: 'Document',
      config: { accept: '.pdf', maxFileSize: 5 },
    }, null);
    const input = view.getByLabelText('Document');
    fireEvent.change(input, { target: { files: [file('large.pdf', 'application/pdf', 10)] } });
    await waitFor(() => expect(store.getState().errors.document).toBeDefined());
    fireEvent.change(input, { target: { files: [file('ok.pdf', 'application/pdf', 4)] } });
    await waitFor(() => expect(store.getState().errors.document).toBeUndefined());
    expect((store.getValue('document') as File).name).toBe('ok.pdf');
  });
});

describe('Phase 8 file and media controls', () => {
  it('registers the complete media inventory and stores multiple files', () => {
    const registry = createDefaultHtmlRegistry();
    for (const type of ['file', 'multi-file', 'camera', 'document-preview', 'signature']) expect(registry[type]).toBeDefined();
    const { store, view } = renderField({ name: 'files', type: 'multi-file', label: 'Files', config: { maxFiles: 2 } }, []);
    const files = [file('a.pdf', 'application/pdf'), file('b.pdf', 'application/pdf')];
    fireEvent.change(view.getByLabelText('Files'), { target: { files } });
    expect(store.getValue('files')).toEqual(files);
  });

  it('creates image preview object URLs and revokes them on cleanup', async () => {
    const create = vi.fn(() => 'blob:preview');
    const revoke = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
    const result = renderField({ name: 'photo', type: 'file', label: 'Photo', config: { accept: 'image/*', imagePreview: true } }, null);
    fireEvent.change(result.view.getByLabelText('Photo'), { target: { files: [file('photo.png', 'image/png')] } });
    await waitFor(() => expect(result.view.getByRole('img', { name: 'Preview of photo.png' })).toBeTruthy());
    result.view.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:preview');
  });

  it('exposes camera capture and sandboxed document previews', () => {
    let result = renderField({ name: 'camera', type: 'camera', label: 'Camera' }, null);
    const camera = result.view.getByLabelText('Camera');
    expect(camera.getAttribute('accept')).toBe('image/*');
    expect(camera.getAttribute('capture')).toBe('environment');
    result.view.unmount();

    result = renderField({ name: 'preview', type: 'document-preview', label: 'Contract' }, 'about:blank#contract');
    const frame = result.view.getByTitle('Contract');
    expect(frame.getAttribute('sandbox')).toBe('');
  });

  it('supports signature rendering without adding signature APIs to Core', () => {
    const result = renderField({ name: 'signature', type: 'signature', label: 'Signature' }, null, (form) =>
      <HtmlSignatureProvider renderSignature={({ onChange }) => <button type="button" onClick={() => onChange('signed')}>Sign</button>}>{form}</HtmlSignatureProvider>,
    );
    fireEvent.click(result.view.getByRole('button', { name: 'Sign' }));
    expect(result.store.getValue('signature')).toBe('signed');
  });
});

describe('Phase 8 uploads', () => {
  it('reports progress, supports cancellation, and retries safely', async () => {
    let attempts = 0;
    const upload = vi.fn(({ signal, onProgress }) => {
      attempts += 1;
      if (attempts === 1) {
        onProgress(40);
        return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
      }
      onProgress(100);
      return Promise.resolve();
    });
    const result = renderField({ name: 'document', type: 'file', label: 'Document' }, null, (form) =>
      <HtmlFileUploadProvider upload={upload}>{form}</HtmlFileUploadProvider>,
    );
    fireEvent.change(result.view.getByLabelText('Document'), { target: { files: [file('a.pdf', 'application/pdf')] } });
    await waitFor(() => expect((result.view.getByRole('progressbar') as HTMLProgressElement).value).toBe(40));
    fireEvent.click(result.view.getByRole('button', { name: 'Cancel upload' }));
    await waitFor(() => expect(result.view.getByText('Upload cancelled')).toBeTruthy());
    fireEvent.click(result.view.getByRole('button', { name: 'Retry upload' }));
    await waitFor(() => expect(result.view.getByText('Upload complete')).toBeTruthy());
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('offers retry after transport failure', async () => {
    let attempts = 0;
    const upload = vi.fn(() => ++attempts === 1 ? Promise.reject(new Error('Network unavailable')) : Promise.resolve());
    const result = renderField({ name: 'document', type: 'file', label: 'Document' }, null, (form) =>
      <HtmlFileUploadProvider upload={upload}>{form}</HtmlFileUploadProvider>,
    );
    fireEvent.change(result.view.getByLabelText('Document'), { target: { files: [file('a.pdf', 'application/pdf')] } });
    await waitFor(() => expect(result.view.getByRole('alert').textContent).toContain('Network unavailable'));
    fireEvent.click(result.view.getByRole('button', { name: 'Retry upload' }));
    await waitFor(() => expect(result.view.getByText('Upload complete')).toBeTruthy());
  });
});
