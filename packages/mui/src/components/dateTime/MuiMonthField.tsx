import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { MuiTemporalField } from './MuiTemporalField';

export interface MuiMonthFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  inputRef?: Ref<HTMLElement>;
}

export function MuiMonthField({ field, min, max, ...props }: MuiMonthFieldProps) {
  const config = field?.config as DateTimeFieldConfig | undefined;
  return <MuiTemporalField {...props} type="month" min={min ?? config?.minDate} max={max ?? config?.maxDate} />;
}
