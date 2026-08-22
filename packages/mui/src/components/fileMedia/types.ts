import type { Ref } from 'react';
import type { FieldSchema } from '@dynamic-forms/core';

export interface MuiExistingFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export type MuiFileValue = File | MuiExistingFile;

export interface MuiFileUploadContext {
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
}

export type MuiFileUploader = (file: File, context: MuiFileUploadContext) => Promise<MuiExistingFile>;

export interface MuiFileUploadCommonProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  description?: string;
  accept?: string;
  maxFileSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  imagePreview?: boolean;
  uploader?: MuiFileUploader;
  inputRef?: Ref<HTMLInputElement>;
  browseLabel?: string;
  dropLabel?: string;
  capture?: boolean | 'user' | 'environment';
}

export interface MuiFileValidationError {
  code: 'type' | 'size' | 'count';
  fileName?: string;
  message: string;
}

export type MuiUploadStatus = 'ready' | 'uploading' | 'uploaded' | 'failed';
export interface MuiSignatureValue {
  dataUrl: string;
  mimeType: 'image/png';
  width: number;
  height: number;
  createdAt: string;
}
