import { FormControl, FormHelperText, FormLabel, Stack, TextField } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import type { Ref } from 'react';
import { formatTemporalInput, parseTemporalInput, type TemporalInputType } from '../../adapters';

export type TemporalRangeValue = readonly [string | undefined, string | undefined];

export interface MuiTemporalRangeFieldProps {
  name: string;
  type: TemporalInputType;
  label?: string;
  startLabel: string;
  endLabel: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  step?: number;
  startInputRef?: Ref<HTMLElement>;
  endInputRef?: Ref<HTMLElement>;
}

export function MuiTemporalRangeField({
  name,
  type,
  label,
  startLabel,
  endLabel,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  min,
  max,
  step,
  startInputRef,
  endInputRef,
}: MuiTemporalRangeFieldProps) {
  const field = useField<TemporalRangeValue | undefined>(name);
  const [start, end] = field.value ?? [undefined, undefined];
  const update = (nextStart: string | undefined, nextEnd: string | undefined) => {
    field.setValue(nextStart === undefined && nextEnd === undefined ? undefined : [nextStart, nextEnd]);
  };
  const handleBlur = async () => {
    field.setTouched(true);
    await field.validate();
  };
  const common = {
    type,
    disabled,
    required,
    fullWidth,
    error: Boolean(field.error),
    slotProps: { inputLabel: { shrink: true }, htmlInput: { readOnly, step } },
  } as const;

  return (
    <FormControl component="fieldset" fullWidth={fullWidth} disabled={disabled} error={Boolean(field.error)} margin="normal">
      {label ? <FormLabel component="legend" required={required}>{label}</FormLabel> : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...common}
          name={`${field.name}.start`}
          label={startLabel}
          value={formatTemporalInput(start)}
          inputRef={startInputRef}
          slotProps={{ ...common.slotProps, htmlInput: { ...common.slotProps.htmlInput, min, max: end ?? max } }}
          onChange={(event) => update(parseTemporalInput(event.target.value), end)}
          onBlur={handleBlur}
        />
        <TextField
          {...common}
          name={`${field.name}.end`}
          label={endLabel}
          value={formatTemporalInput(end)}
          inputRef={endInputRef}
          slotProps={{ ...common.slotProps, htmlInput: { ...common.slotProps.htmlInput, min: start ?? min, max } }}
          onChange={(event) => update(start, parseTemporalInput(event.target.value))}
          onBlur={handleBlur}
        />
      </Stack>
      <FormHelperText>{field.error ?? ' '}</FormHelperText>
    </FormControl>
  );
}
