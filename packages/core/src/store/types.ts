import type { AsyncRequestContext } from '../async';

export type FormValues = object;
export type DynamicFormValues = Record<string, unknown>;
export type FormErrors = Record<string, string>;

export interface FormState<T extends FormValues = DynamicFormValues> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  valid: boolean;
  submitting: boolean;
  disabled: boolean;
  loading: boolean;
  validating: boolean;
  validationError?: Error;
}

export type FormListener<T extends FormValues = DynamicFormValues> = (state: FormState<T>) => void;

export type FormSelector<T extends FormValues, TSelected> = (
  state: Readonly<FormState<T>>,
) => TSelected;

export type SelectorListener<TSelected> = (
  selected: TSelected,
  previous: TSelected,
) => void;

export type EqualityFn<TSelected> = (left: TSelected, right: TSelected) => boolean;

export type FormValidator<T extends FormValues = DynamicFormValues> = (
  values: Readonly<T>,
  context?: AsyncRequestContext,
) => FormErrors | Promise<FormErrors>;

export type FormSubmitHandler<T extends FormValues = DynamicFormValues, TResult = unknown> = (
  values: Readonly<T>
) => TResult | Promise<TResult>;

export interface SetValueOptions {
  shouldTouch?: boolean;
  shouldDirty?: boolean;
  shouldValidate?: boolean;
}

export interface ResetOptions {
  keepValues?: boolean;
  keepErrors?: boolean;
  keepTouched?: boolean;
  keepDirty?: boolean;
}

export interface FormStoreOptions {
  /** Maximum number of lifecycle events processed by one outer transaction. */
  maxLifecycleIterations?: number;
  onAsyncError?: (error: Error, operation: 'validation', requestId: number) => void;
}

export interface ValidateOptions {
  signal?: AbortSignal;
}
