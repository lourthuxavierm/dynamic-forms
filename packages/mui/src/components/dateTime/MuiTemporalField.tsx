import TextField from '@mui/material/TextField';
import { useField } from '@dynamic-forms/react';
import type { Ref } from 'react';
import { formatTemporalInput, parseTemporalInput, type TemporalInputType } from '../../adapters';

export interface MuiTemporalFieldProps {
  name: string;
  label?: string;
  type: TemporalInputType;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  step?: number;
  inputRef?: Ref<HTMLElement>;
  onValueChange?: (value: string | undefined) => boolean | void;
}

export function MuiTemporalField({
  name,
  label,
  type,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  min,
  max,
  step,
  inputRef,
  onValueChange,
}: MuiTemporalFieldProps) {
  const field = useField<string | undefined>(name);

  return (
    <TextField
      name={field.name}
      value={formatTemporalInput(field.value)}
      label={label}
      type={type}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? ' '}
      inputRef={inputRef}
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { min, max, step, readOnly },
      }}
      onChange={(event) => {
        const value = parseTemporalInput(event.target.value);
        if (onValueChange?.(value) !== false) field.setValue(value);
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}
