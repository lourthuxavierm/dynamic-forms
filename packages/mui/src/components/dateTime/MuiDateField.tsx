import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { useField } from '@dynamic-forms/react';
import { MuiTemporalField } from './MuiTemporalField';

export interface MuiDateFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  isDateDisabled?: (value: string) => boolean;
  disabledDateMessage?: string;
  inputRef?: Ref<HTMLElement>;
}

export function MuiDateField({
  field: schemaField,
  min,
  max,
  isDateDisabled,
  disabledDateMessage = 'This date is unavailable',
  ...props
}: MuiDateFieldProps) {
  const config = schemaField?.config as DateTimeFieldConfig | undefined;
  const field = useField<string | undefined>(props.name);

  return (
    <MuiTemporalField
      {...props}
      type="date"
      min={min ?? config?.minDate}
      max={max ?? config?.maxDate}
      onValueChange={(value) => {
        if (value && isDateDisabled?.(value)) {
          field.setError(disabledDateMessage);
          return false;
        }
        if (field.error === disabledDateMessage) field.clearError();
        return true;
      }}
    />
  );
}
