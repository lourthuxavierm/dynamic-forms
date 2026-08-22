import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { FileFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react';
import { formatFileSize, validateFiles } from './fileValidation';
import type { MuiExistingFile, MuiFileUploadCommonProps, MuiFileUploader, MuiFileValue, MuiUploadStatus } from './types';

interface UploadState {
  status: MuiUploadStatus;
  progress: number;
  error?: string;
  controller?: AbortController;
}

interface MuiFileUploadBaseProps extends MuiFileUploadCommonProps {
  multiple: boolean;
  maxFiles?: number;
}

function isBrowserFile(value: MuiFileValue): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function fileKey(value: MuiFileValue): string {
  return isBrowserFile(value) ? `${value.name}:${value.size}:${value.lastModified}` : value.id;
}

function replaceValue(values: readonly MuiFileValue[], current: MuiFileValue, replacement: MuiFileValue): MuiFileValue[] {
  return values.map((value) => value === current ? replacement : value);
}

export function MuiFileUploadBase({
  name,
  field: schemaField,
  label,
  description,
  accept,
  maxFileSize,
  maxFiles,
  disabled = false,
  readOnly = false,
  required = false,
  imagePreview,
  uploader,
  inputRef,
  browseLabel = 'Choose files',
  dropLabel = 'Drop files here or browse',
  multiple,
  capture,
}: MuiFileUploadBaseProps) {
  const config = schemaField?.config as FileFieldConfig | undefined;
  const resolvedAccept = accept ?? config?.accept;
  const resolvedMaxSize = maxFileSize ?? config?.maxFileSize;
  const resolvedMaxFiles = multiple ? maxFiles ?? config?.maxFiles : 1;
  const showPreviews = imagePreview ?? config?.imagePreview ?? true;
  const field = useField<MuiFileValue | readonly MuiFileValue[] | undefined>(name);
  const values = useMemo(() => {
    if (Array.isArray(field.value)) return [...field.value] as MuiFileValue[];
    return field.value ? [field.value as MuiFileValue] : [];
  }, [field.value]);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const uploadsRef = useRef(uploads);
  uploadsRef.current = uploads;
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const inputId = `${useId().replace(/:/g, '')}-file-input`;

  const previewUrls = useMemo(() => {
    const urls = new Map<string, string>();
    if (!showPreviews) return urls;
    for (const value of values) {
      if (isBrowserFile(value) && value.type.startsWith('image/') && typeof URL.createObjectURL === 'function') {
        urls.set(fileKey(value), URL.createObjectURL(value));
      } else if (!isBrowserFile(value) && (value.thumbnailUrl ?? value.url)) {
        urls.set(fileKey(value), value.thumbnailUrl ?? value.url ?? '');
      }
    }
    return urls;
  }, [showPreviews, values]);

  useEffect(() => () => {
    for (const value of previewUrls.values()) {
      if (value.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(value);
    }
  }, [previewUrls]);

  useEffect(() => () => {
    for (const upload of Object.values(uploadsRef.current)) upload.controller?.abort();
  }, []);

  const commit = (next: readonly MuiFileValue[]) => {
    valuesRef.current = [...next];
    field.setValue(multiple ? next : next[0]);
  };

  const beginUpload = (file: File, transport: MuiFileUploader) => {
    const key = fileKey(file);
    const controller = new AbortController();
    setUploads((current) => ({ ...current, [key]: { status: 'uploading', progress: 0, controller } }));
    void transport(file, {
      signal: controller.signal,
      onProgress: (percentage) => setUploads((current) => ({
        ...current,
        [key]: { ...current[key], status: 'uploading', progress: Math.max(0, Math.min(100, percentage)), controller },
      })),
    }).then((uploaded) => {
      commit(replaceValue(valuesRef.current, file, uploaded));
      setUploads((current) => ({ ...current, [fileKey(uploaded)]: { status: 'uploaded', progress: 100 }, [key]: { status: 'uploaded', progress: 100 } }));
    }).catch((error: unknown) => {
      const message = controller.signal.aborted ? 'Upload canceled.' : error instanceof Error ? error.message : 'Upload failed.';
      setUploads((current) => ({ ...current, [key]: { status: 'failed', progress: current[key]?.progress ?? 0, error: message } }));
    });
  };

  const addFiles = (incoming: readonly File[]) => {
    if (disabled || readOnly || incoming.length === 0) return;
    const errors = validateFiles(incoming, {
      accept: resolvedAccept,
      maxFileSize: resolvedMaxSize,
      maxFiles: resolvedMaxFiles,
      existingCount: multiple ? values.length : 0,
    });
    if (errors.length) {
      setLocalError(errors.map((error) => error.message).join(' '));
      return;
    }
    setLocalError(undefined);
    const next = multiple ? [...values, ...incoming] : [incoming[0]];
    commit(next);
    if (uploader) for (const file of incoming) beginUpload(file, uploader);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };
  const remove = (value: MuiFileValue) => {
    const key = fileKey(value);
    uploads[key]?.controller?.abort();
    commit(values.filter((candidate) => candidate !== value));
    setUploads((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const openPicker = () => {
    if (!disabled && !readOnly) internalInputRef.current?.click();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(Array.from(event.dataTransfer.files));
  };
  const setRefs = (node: HTMLInputElement | null) => {
    internalInputRef.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef) inputRef.current = node;
  };

  const describedBy = description ? `${inputId}-description` : undefined;
  const error = localError ?? field.error;

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled} error={Boolean(error)} required={required} margin="normal">
      {label ? <FormLabel component="legend" required={required}>{label}</FormLabel> : null}
      {description ? <FormHelperText id={describedBy}>{description}</FormHelperText> : null}
      <input ref={setRefs} id={inputId} type="file" hidden multiple={multiple} accept={resolvedAccept} capture={capture} disabled={disabled || readOnly} aria-describedby={describedBy} onChange={handleInput} />
      <Paper
        variant="outlined"
        role="button"
        tabIndex={disabled || readOnly ? -1 : 0}
        aria-disabled={disabled || readOnly}
        aria-controls={inputId}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragEnter={(event) => { event.preventDefault(); if (!disabled && !readOnly) setDragActive(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        sx={(theme) => ({
          cursor: disabled || readOnly ? 'default' : 'pointer',
          borderStyle: 'dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          p: 3,
          textAlign: 'center',
          transition: theme.transitions.create(['border-color', 'background-color']),
        })}
      >
        <Typography>{dropLabel}</Typography>
        <Button component="span" disabled={disabled || readOnly} sx={{ mt: 1 }}>{browseLabel}</Button>
      </Paper>
      {error ? <FormHelperText role="alert">{error}</FormHelperText> : null}
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, mt: 2, p: 0 }}>
        {values.map((value) => {
          const key = fileKey(value);
          const state = uploads[key];
          const preview = previewUrls.get(key);
          return (
            <Paper component="li" variant="outlined" key={key} sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                {preview ? <Box component="img" src={preview} alt={`${value.name} preview`} sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }} /> : null}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap>{value.name}</Typography>
                  {value.size !== undefined ? <Typography variant="caption" color="text.secondary">{formatFileSize(value.size)}</Typography> : null}
                  {!isBrowserFile(value) && (value.downloadUrl ?? value.url) ? <Button component="a" href={value.downloadUrl ?? value.url} target="_blank" rel="noopener noreferrer" size="small">Download</Button> : null}
                  {state?.status === 'uploading' ? <LinearProgress variant="determinate" value={state.progress} aria-label={`Uploading ${value.name}`} /> : null}
                  {state?.error ? <Typography variant="caption" color="error" role="alert">{state.error}</Typography> : null}
                </Box>
                {state?.status === 'uploading' ? <Button size="small" onClick={(event) => { event.stopPropagation(); state.controller?.abort(); }}>Cancel</Button> : null}
                {state?.status === 'failed' && isBrowserFile(value) && uploader ? <Button size="small" onClick={(event) => { event.stopPropagation(); beginUpload(value, uploader); }}>Retry</Button> : null}
                {!readOnly ? <Button size="small" color="error" disabled={disabled} onClick={(event) => { event.stopPropagation(); remove(value); }} aria-label={`Remove ${value.name}`}>Remove</Button> : null}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </FormControl>
  );
}
