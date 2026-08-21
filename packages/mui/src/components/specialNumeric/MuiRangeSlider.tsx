import { FormControl, FormHelperText, FormLabel, Slider } from '@mui/material';
import type { FieldSchema, NumericFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useId } from 'react';

export interface MuiRangeSliderProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  marks?: boolean;
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  orientation?: 'horizontal' | 'vertical';
}

export function MuiRangeSlider({ name, field: schemaField, label, min, max, step, disabled = false, readOnly = false, required = false, fullWidth = true, marks = false, valueLabelDisplay = 'auto', orientation = 'horizontal' }: MuiRangeSliderProps) {
  const config = schemaField?.config as NumericFieldConfig | undefined;
  const resolvedMin = min ?? config?.min ?? 0;
  const resolvedMax = max ?? config?.max ?? 100;
  const resolvedStep = step ?? config?.step ?? 1;
  const field = useField<readonly [number, number]>(name);
  const value = Array.isArray(field.value) && field.value.length === 2 ? [field.value[0], field.value[1]] : [resolvedMin, resolvedMax];
  const labelId = `${useId().replace(/:/g, '')}-label`;

  return (
    <FormControl fullWidth={fullWidth} disabled={disabled} error={Boolean(field.error)} required={required} margin="normal">
      {label ? <FormLabel id={labelId}>{label}</FormLabel> : null}
      <Slider
        name={name}
        value={value}
        min={resolvedMin}
        max={resolvedMax}
        step={resolvedStep}
        marks={marks}
        disabled={disabled}
        orientation={orientation}
        valueLabelDisplay={valueLabelDisplay}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : name}
        aria-readonly={readOnly || undefined}
        disableSwap
        onChange={(_event, next) => {
          if (!readOnly && Array.isArray(next) && next.length === 2) field.setValue([next[0], next[1]]);
        }}
        onChangeCommitted={async () => {
          if (readOnly) return;
          field.setTouched(true);
          await field.validate();
        }}
      />
      <FormHelperText>{field.error ?? ' '}</FormHelperText>
    </FormControl>
  );
}
