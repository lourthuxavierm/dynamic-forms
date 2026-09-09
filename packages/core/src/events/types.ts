import type { DynamicFormValues, FormErrors, FormValues } from '../store/types';

export type FormEventType = 'valueChange' | 'fieldChange' | 'submit' | 'reset' | 'validate';

export type FormEventPayload<TValues extends FormValues = DynamicFormValues, TResult = unknown> =
  | { values: Readonly<TValues> }
  | { values: Readonly<TValues>; result: TResult }
  | { values: Readonly<TValues>; valid: boolean; errors: Readonly<FormErrors> };

export interface FormEvent<
  TValue = unknown,
  TValues extends FormValues = DynamicFormValues,
  TResult = unknown,
> {
  type: FormEventType;
  field?: string;
  value?: TValue;
  previousValue?: TValue;
  payload?: FormEventPayload<TValues, TResult>;
}

export type FormEventListener<
  TValue = unknown,
  TValues extends FormValues = DynamicFormValues,
  TResult = unknown,
> = (event: FormEvent<TValue, TValues, TResult>) => void;