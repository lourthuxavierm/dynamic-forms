import { Box, Button, FormControl, FormHelperText, FormLabel, Stack } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { MuiSignatureValue } from './types';

export interface MuiSignaturePadProps {
  name: string;
  label?: string;
  description?: string;
  width?: number;
  height?: number;
  lineWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  clearLabel?: string;
}

/** Captures a drawn mark as PNG data. This is not a cryptographic or identity-verifying signature. */
export function MuiSignaturePad({
  name,
  label,
  description,
  width = 600,
  height = 200,
  lineWidth = 2,
  strokeColor = '#111827',
  backgroundColor = '#ffffff',
  disabled = false,
  readOnly = false,
  required = false,
  clearLabel = 'Clear signature',
}: MuiSignaturePadProps) {
  const field = useField<MuiSignatureValue | undefined>(name);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const inkRef = useRef(false);
  const [captureError, setCaptureError] = useState<string>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundColor]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / (rect.width || canvas.width)),
      y: (event.clientY - rect.top) * (canvas.height / (rect.height || canvas.height)),
    };
  };
  const context = () => {
    const value = canvasRef.current?.getContext('2d');
    if (value) {
      value.lineCap = 'round';
      value.lineJoin = 'round';
      value.lineWidth = lineWidth;
      value.strokeStyle = strokeColor;
    }
    return value;
  };
  const begin = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled || readOnly) return;
    const ctx = context();
    if (!ctx) return;
    drawingRef.current = true;
    inkRef.current = true;
    const next = point(event);
    ctx.beginPath();
    ctx.moveTo(next.x, next.y);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = context();
    if (!ctx) return;
    const next = point(event);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  };
  const finish = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const canvas = canvasRef.current;
    if (!canvas || !inkRef.current) return;
    try {
      field.setValue({ dataUrl: canvas.toDataURL('image/png'), mimeType: 'image/png', width: canvas.width, height: canvas.height, createdAt: new Date().toISOString() });
      field.setTouched(true);
      setCaptureError(undefined);
    } catch {
      setCaptureError('Unable to capture the signature.');
    }
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    inkRef.current = false;
    field.setValue(undefined);
    field.setTouched(true);
    setCaptureError(undefined);
  };

  return (
    <FormControl component="fieldset" fullWidth disabled={disabled} required={required} error={Boolean(captureError ?? field.error)} margin="normal">
      {label ? <FormLabel component="legend" required={required}>{label}</FormLabel> : null}
      {description ? <FormHelperText>{description}</FormHelperText> : null}
      <Box sx={{ width: '100%', maxWidth: width, height, bgcolor: backgroundColor, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          role="img"
          aria-label={label ? `${label} drawing area` : 'Signature drawing area'}
          aria-readonly={readOnly || undefined}
          onPointerDown={begin}
          onPointerMove={draw}
          onPointerUp={finish}
          onPointerCancel={finish}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: disabled || readOnly ? 'default' : 'crosshair' }}
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button type="button" onClick={clear} disabled={disabled || readOnly || (!field.value && !inkRef.current)}>{clearLabel}</Button>
      </Stack>
      {captureError ?? field.error ? <FormHelperText role="alert">{captureError ?? field.error}</FormHelperText> : null}
    </FormControl>
  );
}
