import { FormControl, FormHelperText, FormLabel, Slider } from '@mui/material';
import type { FieldSchema, NumericFieldConfig } from '@dynamic-forms/core';
import { useField } from '@dynamic-forms/react';
import { useId } from 'react';

export interface MuiSliderProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  min?: number;
  max?: number;
  step?: number | null;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  marks?: boolean;
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  orientation?: 'horizontal' | 'vertical';
}

export function MuiSlider({ name, field: schemaField, label, min, max, step, disabled = false, readOnly = false, required = false, fullWidth = true, marks = false, valueLabelDisplay = 'auto', orientation = 'horizontal' }: MuiSliderProps) {
  const config = schemaField?.config as NumericFieldConfig | undefined;
  const resolvedMin = min ?? config?.min ?? 0;
  const resolvedMax = max ?? config?.max ?? 100;
  const resolvedStep = step ?? config?.step ?? 1;
  const field = useField<number>(name);
  const labelId = `${useId().replace(/:/g, '')}-label`;

  return (
    <FormControl fullWidth={fullWidth} disabled={disabled} error={Boolean(field.error)} required={required} margin="normal">
      {label ? <FormLabel id={labelId}>{label}</FormLabel> : null}
      <Slider
        name={name}
        value={typeof field.value === 'number' ? field.value : resolvedMin}
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
        onChange={(_event, value) => {
          if (!readOnly && typeof value === 'number') field.setValue(value);
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
