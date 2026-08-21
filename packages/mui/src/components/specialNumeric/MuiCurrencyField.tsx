import TextField from '@mui/material/TextField';
import type { CurrencyFieldConfig, FieldSchema } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useEffect, useState, type Ref } from 'react';
import { clampNumber, formatCurrencyValue, parseLocaleNumber } from '../../adapters';

export interface MuiCurrencyFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  placeholder?: string;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  inputRef?: Ref<HTMLElement>;
}

export function MuiCurrencyField({
  name,
  field: schemaField,
  label,
  placeholder,
  currency,
  locale,
  min,
  max,
  step,
  precision,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  inputRef,
}: MuiCurrencyFieldProps) {
  const config = schemaField?.config as CurrencyFieldConfig | undefined;
  const resolvedCurrency = currency ?? config?.currency ?? 'USD';
  const resolvedLocale = locale ?? config?.locale ?? 'en-US';
  const resolvedMin = min ?? config?.min;
  const resolvedMax = max ?? config?.max;
  const resolvedStep = step ?? config?.step;
  const field = useField<number | undefined>(name);
  const format = (value: number) => formatCurrencyValue(value, resolvedLocale, resolvedCurrency, precision);
  const [inputValue, setInputValue] = useState(() => typeof field.value === 'number' ? format(field.value) : '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInputValue(typeof field.value === 'number' ? format(field.value) : '');
  }, [field.value, focused, resolvedCurrency, resolvedLocale, precision]);

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
        const parsed = parseLocaleNumber(raw, resolvedLocale);
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
