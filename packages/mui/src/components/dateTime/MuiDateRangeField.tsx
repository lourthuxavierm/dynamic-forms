import type { DateTimeFieldConfig, FieldSchema } from '@dynamic-forms/core';
import type { Ref } from 'react';
import { MuiTemporalRangeField } from './MuiTemporalRangeField';

export interface MuiDateRangeFieldProps {
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
  startInputRef?: Ref<HTMLElement>;
  endInputRef?: Ref<HTMLElement>;
}

export function MuiDateRangeField({ field, min, max, startLabel = 'Start date', endLabel = 'End date', ...props }: MuiDateRangeFieldProps) {
  const config = field?.config as DateTimeFieldConfig | undefined;
  return <MuiTemporalRangeField {...props} type="date" startLabel={startLabel} endLabel={endLabel} min={min ?? config?.minDate} max={max ?? config?.maxDate} />;
}
