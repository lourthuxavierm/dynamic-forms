import TextField from '@mui/material/TextField';
import type { FieldSchema, NumericFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import type { Ref } from 'react';
import { clampNumber } from '../../adapters';

export interface MuiYearFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  inputRef?: Ref<HTMLElement>;
}

export function MuiYearField({ name, field: schemaField, label, disabled = false, readOnly = false, required = false, fullWidth = true, min, max, inputRef }: MuiYearFieldProps) {
  const config = schemaField?.config as NumericFieldConfig | undefined;
  const resolvedMin = min ?? config?.min ?? 1900;
  const resolvedMax = max ?? config?.max ?? 2100;
  const field = useField<number | undefined>(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ''}
      label={label}
      type="number"
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? ' '}
      inputRef={inputRef}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: resolvedMin, max: resolvedMax, step: 1, inputMode: 'numeric', readOnly } }}
      onChange={(event) => {
        const value = event.target.value;
        if (!value) field.setValue(undefined);
        else if (/^-?\d+$/.test(value)) field.setValue(Number(value));
      }}
      onBlur={async () => {
        if (typeof field.value === 'number') field.setValue(Math.trunc(clampNumber(field.value, resolvedMin, resolvedMax)));
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}
