import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FieldComponentProps } from '@dynamic-forms/react';
import { HtmlFieldShell } from './HtmlFieldShell';

export interface HtmlFileControlConfig {
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  imagePreview?: boolean;
  rejectDuplicates?: boolean;
}

export interface HtmlUploadRequest {
  file: File;
  fieldName: string;
  index: number;
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
}
export type HtmlUploadHandler = (request: HtmlUploadRequest) => Promise<unknown>;

const UploadContext = createContext<HtmlUploadHandler | undefined>(undefined);
export function HtmlFileUploadProvider({ upload, children }: { upload: HtmlUploadHandler; children: ReactNode }) {
  return <UploadContext.Provider value={upload}>{children}</UploadContext.Provider>;
}

export interface HtmlSignatureRendererProps {
  field: FieldComponentProps;
  onChange: (value: unknown) => void;
}
export type HtmlSignatureRenderer = (props: HtmlSignatureRendererProps) => ReactNode;
const SignatureContext = createContext<HtmlSignatureRenderer | undefined>(undefined);
export function HtmlSignatureProvider({ renderSignature, children }: { renderSignature: HtmlSignatureRenderer; children: ReactNode }) {
  return <SignatureContext.Provider value={renderSignature}>{children}</SignatureContext.Provider>;
}

export function validateSelectedFiles(files: readonly File[], config: HtmlFileControlConfig = {}): string | undefined {
  if (config.maxFiles !== undefined && files.length > config.maxFiles) return 'Select no more than ' + config.maxFiles + ' files.';
  if (config.maxFileSize !== undefined) {
    const oversized = files.find((file) => file.size > config.maxFileSize!);
    if (oversized) return 'A selected file exceeds the ' + config.maxFileSize + ' byte limit.';
  }
  if (config.accept) {
    const rejected = files.find((file) => !matchesAccept(file, config.accept!));
    if (rejected) return 'A selected file type is not accepted.';
  }
  if (config.rejectDuplicates !== false) {
    const keys = new Set<string>();
    for (const file of files) {
      const key = file.name.toLowerCase() + ':' + file.size + ':' + file.lastModified;
      if (keys.has(key)) return 'Duplicate files are not allowed.';
      keys.add(key);
    }
  }
  return undefined;
}

export function createSafeFileSnapshot(files: readonly File[]): Readonly<{ count: number; files: readonly { type: string; size: number }[] }> {
  return Object.freeze({
    count: files.length,
    files: Object.freeze(files.map((file) => Object.freeze({ type: file.type, size: file.size }))),
  });
}

function matchesAccept(file: File, accept: string): boolean {
  const name = file.name.toLowerCase();
  return accept.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean).some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return file.type.toLowerCase().startsWith(token.slice(0, -1));
    return file.type.toLowerCase() === token;
  });
}

export function useObjectUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!file || typeof URL === 'undefined' || !URL.createObjectURL) { setUrl(undefined); return; }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress: number;
  error?: string;
}
function useUploads(fieldName: string) {
  const upload = useContext(UploadContext);
  const files = useRef<readonly File[]>([]);
  const controllers = useRef<AbortController[]>([]);
  const run = useRef(0);
  const [state, setState] = useState<UploadState>({ status: 'idle', progress: 0 });

  const cancel = useCallback(() => {
    run.current += 1;
    for (const controller of controllers.current) controller.abort();
    setState((current) => current.status === 'uploading' ? { ...current, status: 'cancelled' } : current);
  }, []);

  const start = useCallback(async (nextFiles: readonly File[]) => {
    files.current = nextFiles;
    if (!upload || nextFiles.length === 0) { setState({ status: 'idle', progress: 0 }); return; }
    cancel();
    const currentRun = ++run.current;
    const progress = nextFiles.map(() => 0);
    const update = () => {
      if (run.current === currentRun) setState({ status: 'uploading', progress: Math.round(progress.reduce((sum, value) => sum + value, 0) / progress.length) });
    };
    const currentControllers = nextFiles.map(() => new AbortController());
    controllers.current = currentControllers;
    setState({ status: 'uploading', progress: 0 });
    try {
      await Promise.all(nextFiles.map((file, index) => upload({
        file,
        fieldName,
        index,
        signal: currentControllers[index].signal,
        onProgress: (value) => { progress[index] = Math.max(0, Math.min(100, value)); update(); },
      })));
      if (run.current === currentRun) setState({ status: 'success', progress: 100 });
    } catch (error) {
      if (run.current !== currentRun) return;
      const aborted = currentControllers.some((controller) => controller.signal.aborted);
      setState({ status: aborted ? 'cancelled' : 'error', progress: 0, error: aborted ? undefined : error instanceof Error ? error.message : 'Upload failed' });
    }
  }, [cancel, fieldName, upload]);

  useEffect(() => cancel, [cancel]);
  return { state, start, cancel, retry: () => start(files.current), enabled: Boolean(upload) };
}

function UploadStatus({ upload }: { upload: ReturnType<typeof useUploads> }) {
  if (!upload.enabled || upload.state.status === 'idle') return null;
  return <div aria-live="polite">
    {upload.state.status === 'uploading' && <><progress max={100} value={upload.state.progress}>{upload.state.progress}%</progress><button type="button" onClick={upload.cancel}>Cancel upload</button></>}
    {upload.state.status === 'success' && <span>Upload complete</span>}
    {upload.state.status === 'cancelled' && <><span>Upload cancelled</span><button type="button" onClick={() => void upload.retry()}>Retry upload</button></>}
    {upload.state.status === 'error' && <><span role="alert">{upload.state.error ?? 'Upload failed'}</span><button type="button" onClick={() => void upload.retry()}>Retry upload</button></>}
  </div>;
}

function FilePreview({ file }: { file: File }) {
  const url = useObjectUrl(file);
  if (!url) return null;
  return <img src={url} alt={'Preview of ' + file.name} />;
}

function FileControl({ props, multiple, camera }: { props: FieldComponentProps; multiple?: boolean; camera?: boolean }) {
  const config = props.field.config as HtmlFileControlConfig | undefined;
  const upload = useUploads(props.name);
  const values = multiple ? (Array.isArray(props.value) ? props.value.filter((value): value is File => value instanceof File) : []) : props.value instanceof File ? [props.value] : [];
  const select = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const error = validateSelectedFiles(files, { ...config, maxFiles: multiple ? config?.maxFiles : 1 });
    if (error) { props.setError(error); return; }
    props.clearError();
    props.setValue(multiple ? files : files[0] ?? null);
    void upload.start(files);
  };
  return <HtmlFieldShell props={props}><input id={props.accessibility.id} name={props.name} type="file"
    multiple={multiple} accept={camera ? 'image/*' : config?.accept} capture={camera ? 'environment' : undefined}
    disabled={props.disabled} required={props.required} aria-labelledby={props.accessibility.labelId}
    aria-invalid={props.accessibility.ariaInvalid || undefined}
    onChange={(event) => { if (!props.readOnly) select(event.target.files); }}
    onBlur={() => props.setTouched(true)} />
    {config?.imagePreview && values.map((file, index) => <FilePreview key={file.name + index} file={file} />)}
    <UploadStatus upload={upload} />
  </HtmlFieldShell>;
}

export const HtmlFileUpload = (props: FieldComponentProps) => <FileControl props={props} />;
export const HtmlMultiFileUpload = (props: FieldComponentProps) => <FileControl props={props} multiple />;
export const HtmlCameraCapture = (props: FieldComponentProps) => <FileControl props={props} camera />;

export function HtmlDocumentPreview(props: FieldComponentProps) {
  const file = props.value instanceof File ? props.value : undefined;
  const objectUrl = useObjectUrl(file);
  const source = objectUrl ?? (typeof props.value === 'string' ? props.value : undefined);
  if (!source) return <HtmlFieldShell props={props}><span>No document selected.</span></HtmlFieldShell>;
  const type = file?.type ?? '';
  return <HtmlFieldShell props={props}>
    {type.startsWith('image/') ? <img src={source} alt={props.field.label ?? 'Document preview'} /> :
      <iframe src={source} title={props.field.label ?? 'Document preview'} sandbox="" />}
  </HtmlFieldShell>;
}

export function HtmlSignatureField(props: FieldComponentProps) {
  const renderer = useContext(SignatureContext);
  return <HtmlFieldShell props={props}>{renderer
    ? renderer({ field: props, onChange: props.setValue })
    : <div role="note">Provide HtmlSignatureProvider to enable signature capture.</div>}
  </HtmlFieldShell>;
}
