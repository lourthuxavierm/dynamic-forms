import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { MuiTemporalRangeField } from './MuiTemporalRangeField';

export interface MuiTimeRangeFieldProps {
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

export function MuiTimeRangeField({ field, min, max, startLabel = 'Start time', endLabel = 'End time', ...props }: MuiTimeRangeFieldProps) {
  const config = field?.config as DateTimeFieldConfig | undefined;
  return <MuiTemporalRangeField {...props} type="time" startLabel={startLabel} endLabel={endLabel} min={min ?? config?.minDate} max={max ?? config?.maxDate} />;
}
