import { Alert, Box, Button, FormControl, FormLabel, Paper, Stack, Typography } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import { useEffect, useMemo } from 'react';
import type { MuiExistingFile, MuiFileValue } from './types';
import { formatFileSize } from './fileValidation';

export interface MuiDocumentPreviewProps {
  name: string;
  label?: string;
  height?: number;
  emptyMessage?: string;
  allowDownload?: boolean;
}

function isBrowserFile(value: MuiFileValue): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function sourceFor(value: MuiFileValue): string | undefined {
  if (isBrowserFile(value)) return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(value) : undefined;
  return value.url ?? value.downloadUrl;
}

function mimeFor(value: MuiFileValue): string {
  if (value.type) return value.type.toLowerCase();
  const name = value.name.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return 'image/*';
  if (name.endsWith('.pdf')) return 'application/pdf';
  return '';
}

/** Sandboxed preview for image and PDF file values, with a safe metadata fallback. */
export function MuiDocumentPreview({ name, label, height = 480, emptyMessage = 'No document selected.', allowDownload = true }: MuiDocumentPreviewProps) {
  const field = useField<MuiFileValue | undefined>(name);
  const value = field.value;
  const source = useMemo(() => value ? sourceFor(value) : undefined, [value]);
  const mime = value ? mimeFor(value) : '';

  useEffect(() => () => {
    if (source?.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(source);
  }, [source]);

  return (
    <FormControl component="section" fullWidth margin="normal">
      {label ? <FormLabel component="div">{label}</FormLabel> : null}
      {!value ? <Alert severity="info">{emptyMessage}</Alert> : (
        <Paper variant="outlined" sx={{ overflow: 'hidden', mt: 1 }}>
          {source && mime.startsWith('image/') ? (
            <Box component="img" src={source} alt={`${value.name} preview`} sx={{ display: 'block', width: '100%', maxHeight: height, objectFit: 'contain', bgcolor: 'background.default' }} />
          ) : source && mime === 'application/pdf' ? (
            <Box component="iframe" src={source} title={`${value.name} preview`} sandbox="" referrerPolicy="no-referrer" sx={{ display: 'block', width: '100%', height, border: 0 }} />
          ) : (
            <Alert severity="info">A secure inline preview is not available for this file type.</Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ p: 1.5 }}>
            <Typography sx={{ flex: 1 }} noWrap>{value.name}</Typography>
            {value.size !== undefined ? <Typography variant="caption" color="text.secondary">{formatFileSize(value.size)}</Typography> : null}
            {allowDownload && source ? <Button component="a" href={source} download={isBrowserFile(value) ? value.name : undefined} target={isBrowserFile(value) ? undefined : '_blank'} rel="noopener noreferrer">Download</Button> : null}
          </Stack>
        </Paper>
      )}
    </FormControl>
  );
}

export type { MuiExistingFile };
