import { FormControl, FormHelperText, FormLabel, Rating } from '@mui/material';
import { useField } from '@dynamic-forms/react';
import { useId } from 'react';

export interface MuiRatingProps {
  name: string;
  label?: string;
  max?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function MuiRating({ name, label, max = 5, precision = 1, disabled = false, readOnly = false, required = false, size = 'medium' }: MuiRatingProps) {
  const field = useField<number | undefined>(name);
  const labelId = `${useId().replace(/:/g, '')}-label`;

  return (
    <FormControl disabled={disabled} error={Boolean(field.error)} required={required} margin="normal">
      {label ? <FormLabel id={labelId}>{label}</FormLabel> : null}
      <Rating
        name={name}
        value={typeof field.value === 'number' ? field.value : null}
        max={max}
        precision={precision}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        aria-labelledby={label ? labelId : undefined}
        getLabelText={(value) => `${value} of ${max}`}
        onChange={(_event, value) => field.setValue(value ?? undefined)}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
      />
      <FormHelperText>{field.error ?? ' '}</FormHelperText>
    </FormControl>
  );
}
