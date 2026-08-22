import TextField from '@mui/material/TextField';
import type { FieldSchema, MaskFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useEffect, useState, type ChangeEvent, type Ref } from 'react';

export interface MuiMaskFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  placeholder?: string;
  mask?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  inputRef?: Ref<HTMLElement>;
}

export function MuiMaskField({ name, field: schemaField, label, placeholder, mask, disabled = false, readOnly = false, required = false, fullWidth = true, inputRef }: MuiMaskFieldProps) {
  const field = useField<string | undefined>(name);
  const config = schemaField?.config as MaskFieldConfig | undefined;
  const resolvedMask = mask ?? config?.mask;
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(resolvedMask ? applyMask(field.value ?? '', resolvedMask) : field.value ?? '');
  }, [field.value, resolvedMask]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!resolvedMask) return;
    const value = extractMaskValue(event.target.value, resolvedMask);
    field.setValue(value || undefined);
    setDisplayValue(applyMask(value, resolvedMask));
  };
  const configurationError = resolvedMask ? undefined : 'Mask configuration is required.';

  return (
    <TextField
      name={field.name}
      value={displayValue}
      label={label}
      placeholder={placeholder ?? resolvedMask}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      error={Boolean(field.error || configurationError)}
      helperText={field.error ?? configurationError ?? ' '}
      inputRef={inputRef}
      slotProps={{ htmlInput: { readOnly, 'aria-readonly': readOnly || undefined } }}
      onChange={handleChange}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}

/** Mask syntax: 0 = digit, A = letter, * = letter or digit; other characters are literals. */
export function applyMask(value: string, mask: string): string {
  if (!value) return '';
  const characters = value.split('');
  let valueIndex = 0;
  let result = '';
  let accepted = 0;
  for (const maskCharacter of mask) {
    if (isMaskToken(maskCharacter)) {
      let matched = false;
      while (valueIndex < characters.length) {
        const character = characters[valueIndex++];
        if (isValidCharacter(character, maskCharacter)) {
          result += character;
          accepted += 1;
          matched = true;
          break;
        }
      }
      if (!matched) break;
    } else if (accepted > 0 && valueIndex < characters.length) {
      result += maskCharacter;
    }
  }
  return result;
}

export function extractMaskValue(input: string, mask: string): string {
  const inputCharacters = input.split('');
  let inputIndex = 0;
  let result = '';
  for (const maskCharacter of mask) {
    if (!isMaskToken(maskCharacter)) {
      if (inputCharacters[inputIndex] === maskCharacter) inputIndex += 1;
      continue;
    }
    while (inputIndex < inputCharacters.length) {
      const character = inputCharacters[inputIndex++];
      if (isValidCharacter(character, maskCharacter)) {
        result += character;
        break;
      }
    }
  }
  return result;
}

function isMaskToken(character: string): boolean {
  return character === '0' || character === 'A' || character === '*';
}

function isValidCharacter(character: string, maskCharacter: string): boolean {
  if (maskCharacter === '0') return /\d/.test(character);
  if (maskCharacter === 'A') return /[A-Za-z]/.test(character);
  if (maskCharacter === '*') return /[A-Za-z0-9]/.test(character);
  return false;
}
