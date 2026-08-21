import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { MuiTemporalRangeField } from './MuiTemporalRangeField';

export interface MuiDateTimeRangeFieldProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  startLabel?: string;
  endLabel?: string;
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

export function MuiDateTimeRangeField({ field, min, max, startLabel = 'Start date and time', endLabel = 'End date and time', ...props }: MuiDateTimeRangeFieldProps) {
  const config = field?.config as DateTimeFieldConfig | undefined;
  return <MuiTemporalRangeField {...props} type="datetime-local" startLabel={startLabel} endLabel={endLabel} min={min ?? config?.minDate} max={max ?? config?.maxDate} />;
}
