import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import type { FieldOption } from '@dynamic-forms/core';

export interface MuiRadioGroupProps { name: string; label?: string; disabled?: boolean; options?: readonly FieldOption[]; }
export function MuiRadioGroup({ name, label, disabled = false, options = [] }: MuiRadioGroupProps) {
  const field = useField<string | number | boolean>(name);
  return <FormControl component="fieldset" disabled={disabled} error={Boolean(field.error)} margin="normal">
    {label ? <FormLabel component="legend">{label}</FormLabel> : null}
    <RadioGroup name={field.name} value={field.value === undefined ? '' : String(field.value)} onChange={(event) => {
      const selected = options.find((option) => String(option.value) === event.target.value);
      field.setValue(selected?.value ?? event.target.value);
    }} onBlur={async () => { field.setTouched(true); await field.validate(); }}>
      {options.map((option) => <FormControlLabel key={String(option.value)} value={String(option.value)} disabled={option.disabled} control={<Radio />} label={option.label} />)}
    </RadioGroup>
    <FormHelperText>{field.error ?? ' '}</FormHelperText>
  </FormControl>;
}