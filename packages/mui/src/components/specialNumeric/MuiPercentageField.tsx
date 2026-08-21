import TextField from '@mui/material/TextField';
import type { FieldSchema, NumericFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useEffect, useState, type Ref } from 'react';
import { clampNumber, parseLocaleNumber } from '../../adapters';

export interface MuiPercentageFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  placeholder?: string;
  locale?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  inputRef?: Ref<HTMLElement>;
}

export function MuiPercentageField({
  name,
  field: schemaField,
  label,
  placeholder,
  locale = 'en-US',
  min,
  max,
  step,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  inputRef,
}: MuiPercentageFieldProps) {
  const config = schemaField?.config as NumericFieldConfig | undefined;
  const resolvedMin = min ?? config?.min ?? 0;
  const resolvedMax = max ?? config?.max ?? 100;
  const resolvedStep = step ?? config?.step ?? 1;
  const field = useField<number | undefined>(name);
  const format = (value: number) => `${new Intl.NumberFormat(locale).format(value)}%`;
  const [inputValue, setInputValue] = useState(() => typeof field.value === 'number' ? format(field.value) : '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInputValue(typeof field.value === 'number' ? format(field.value) : '');
  }, [field.value, focused, locale]);

  return (
    <TextField
      name={field.name}
      value={inputValue}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? ' '}
      inputRef={inputRef}
      slotProps={{ htmlInput: { inputMode: 'decimal', min: resolvedMin, max: resolvedMax, step: resolvedStep, readOnly } }}
      onFocus={() => {
        setFocused(true);
        setInputValue(typeof field.value === 'number' ? String(field.value) : '');
      }}
      onChange={(event) => {
        const raw = event.target.value;
        setInputValue(raw);
        const parsed = parseLocaleNumber(raw, locale);
        if (parsed !== undefined) field.setValue(parsed);
        else if (!raw.trim()) field.setValue(undefined);
      }}
      onBlur={async () => {
        setFocused(false);
        if (typeof field.value === 'number') {
          const normalized = clampNumber(field.value, resolvedMin, resolvedMax);
          if (normalized !== field.value) field.setValue(normalized);
          setInputValue(format(normalized));
        } else {
          setInputValue('');
        }
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}
