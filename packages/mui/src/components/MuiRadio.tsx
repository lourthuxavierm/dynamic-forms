import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import type { FieldOption } from '@dynamic-forms/core';

export interface MuiRadioProps { name: string; label?: string; disabled?: boolean; options?: readonly FieldOption[]; }
export function MuiRadio({ name, label, disabled = false, options = [] }: MuiRadioProps) {
  const field = useField<string | number | boolean>(name);
  return <FormControl error={Boolean(field.error)} disabled={disabled} margin="normal">
    <RadioGroup name={field.name} value={field.value === undefined ? '' : String(field.value)} onChange={(event) => {
      const selected = options.find((option) => String(option.value) === event.target.value);
      field.setValue(selected?.value ?? event.target.value);
    }} onBlur={async () => { field.setTouched(true); await field.validate(); }}>
      {options.map((option) => <FormControlLabel key={String(option.value)} value={String(option.value)} disabled={option.disabled} control={<Radio />} label={option.label} />)}
    </RadioGroup>
    <FormHelperText>{field.error ?? ' '}</FormHelperText>
  </FormControl>;
}