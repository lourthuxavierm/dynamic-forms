import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { MuiTemporalField } from './MuiTemporalField';

export interface MuiDateTimeFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  step?: number;
  inputRef?: Ref<HTMLElement>;
}

export function MuiDateTimeField({ field, min, max, ...props }: MuiDateTimeFieldProps) {
  const config = field?.config as DateTimeFieldConfig | undefined;
  return <MuiTemporalField {...props} type="datetime-local" min={min ?? config?.minDate} max={max ?? config?.maxDate} />;
}
