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
}

export type FormListener<T extends FormValues = DynamicFormValues> = (state: FormState<T>) => void;

export type FormValidator<T extends FormValues = DynamicFormValues> = (
  values: Readonly<T>
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
