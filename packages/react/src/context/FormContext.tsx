import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ConditionController,
  dynamicPath,
  createFieldValidators,
  createFormValidator,
  DependencyController,
  FieldRegistry,
  FormStore,
  normalizePath,
  type DataSourceConfig,
  type DependencyRefreshContext,
  type DynamicFormValues,
  type FieldSchema,
  type FormEvent,
  type FormSubmitHandler,
  type FormValidator,
  type FormValues,
  type FormSchema,
  validateField,
} from '@dynamic-form-engine/core';
import { warnInDevelopment } from '../development';
import { findFieldByPath } from '../schemaPaths';

export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'manual';

/**
 * Provider context. Its identity changes only when the store, registry, schema,
 * condition controller, or a form-level provider setting changes — never on
 * value, error, or validation-progress updates — so consumers that only read
 * the context do not re-render as fields change.
 */
export interface FormContextValue<T extends FormValues = DynamicFormValues> {
  store: FormStore<T>;
  registry: FieldRegistry;
  schema?: FormSchema;
  conditionController?: ConditionController<T>;
  validationMode: ValidationMode;
  /** Form-level read-only flag from `FormProviderProps.readOnly`. */
  readOnly: boolean;
  /** Whether field controls are disabled while the form is submitting. */
  disableWhileSubmitting: boolean;
  isFieldValidating: (name: string) => boolean;
  /** Subscribe to one field's validation-in-progress flag. Returns a cleanup. */
  subscribeFieldValidating: (name: string, listener: () => void) => () => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  submit: <TResult = unknown>() => Promise<TResult | undefined>;
  reset: () => void;
  resetField: (name: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export interface FormProviderProps<T extends FormValues = DynamicFormValues> {
  /**
   * Controlled store, typically from `useForm`. When omitted, the provider
   * creates one from `defaultValues` on first render and owns it for its
   * lifetime; later `defaultValues` changes are ignored (use `reset`).
   */
  store?: FormStore<T>;
  registry?: FieldRegistry;
  schema?: FormSchema;
  defaultValues?: T;
  children: ReactNode;
  onSubmit?: FormSubmitHandler<T>;
  /** Additional form-level validator composed after schema validation. */
  formValidator?: FormValidator<T>;
  /** Receives errors thrown by `onSubmit` or by a validator during `validateForm`/`submit`. */
  onError?: (error: unknown) => void;
  onChange?: (event: FormEvent<unknown, T>) => void;
  onValidate?: (valid: boolean) => void;
  /** Called after `reset()` installs new state. */
  onReset?: (event: FormEvent<unknown, T>) => void;
  /** Receives every Core form event (`valueChange`, `fieldChange`, `validate`, `submit`, `reset`). */
  onEvent?: (event: FormEvent<unknown, T>) => void;
  validationMode?: ValidationMode;
  onInvalidSubmit?: (errors: Readonly<Record<string, string>>) => void;
  focusOnInvalidSubmit?: boolean;
  /** Form-level disabled state, synchronized to `store.setDisabled`. Disabled forms do not submit. */
  disabled?: boolean;
  /** Form-level read-only state applied to every field rendered through `DynamicField`. */
  readOnly?: boolean;
  /** Disable field controls while `submitting` is true. Defaults to `true`. */
  disableWhileSubmitting?: boolean;
  onDataSourceRefresh?: (
    field: FieldSchema,
    dataSource: DataSourceConfig,
    values: Readonly<T>,
    context?: DependencyRefreshContext,
  ) => void | Promise<void>;
}

/** Validation-in-progress flags keyed by canonical path, observable without context churn. */
class ValidatingFields {
  private readonly active = new Set<string>();
  private readonly listeners = new Map<string, Set<() => void>>();

  has(name: string): boolean { return this.active.has(normalizePath(name)); }

  set(name: string, validating: boolean): void {
    const key = normalizePath(name);
    if (this.active.has(key) === validating) return;
    if (validating) this.active.add(key);
    else this.active.delete(key);
    for (const listener of [...(this.listeners.get(key) ?? [])]) listener();
  }

  subscribe(name: string, listener: () => void): () => void {
    const key = normalizePath(name);
    const listeners = this.listeners.get(key) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(key, listeners);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) this.listeners.delete(key);
    };
  }
}

/** One validation-progress tracker per store, shared by every provider that uses it. */
const validatingByStore = new WeakMap<object, ValidatingFields>();
function validatingFor(store: object): ValidatingFields {
  let tracker = validatingByStore.get(store);
  if (!tracker) {
    tracker = new ValidatingFields();
    validatingByStore.set(store, tracker);
  }
  return tracker;
}

export function FormProvider<T extends FormValues = DynamicFormValues>(props: FormProviderProps<T>) {
  const {
    store,
    registry,
    schema,
    defaultValues,
    children,
    validationMode = 'onBlur',
    disabled,
    readOnly = false,
    disableWhileSubmitting = true,
  } = props;
  // Callbacks are read through a ref so inline props never recreate actions,
  // controllers, or event subscriptions.
  const latest = useRef(props);
  latest.current = props;

  const parentProvider = useContext(FormContext);
  const internalStore = useRef<FormStore<T> | null>(null);
  if (!store && !internalStore.current) internalStore.current = new FormStore(defaultValues);
  const resolvedStore = store ?? internalStore.current!;
  const resolvedRegistry = useMemo(() => registry ?? new FieldRegistry(), [registry]);
  const [conditionController, setConditionController] = useState<ConditionController<T> | undefined>(undefined);
  const controllerRef = useRef(conditionController);
  controllerRef.current = conditionController;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  const schemaValidator = useMemo(() => (schema ? createFormValidator(schema) as FormValidator<T> : undefined), [schema]);
  const schemaValidatorRef = useRef(schemaValidator);
  schemaValidatorRef.current = schemaValidator;
  const validating = validatingFor(resolvedStore);

  useEffect(() => {
    if (parentProvider) warnInDevelopment('Nested FormProvider detected. Provide a single provider per form unless an isolated nested form is intentional.');
    if (!schema) warnInDevelopment('FormProvider has no schema. Schema-driven rendering and validation are unavailable.');
  }, [parentProvider, schema]);

  const actions = useMemo(() => {
    const validationRuns = new Map<string, number>();
    const resolvedFormValidator = (): FormValidator<T> | undefined => {
      const builtIn = schemaValidatorRef.current;
      const custom = latest.current.formValidator;
      if (!builtIn) return custom;
      if (!custom) return builtIn;
      return async (values, context) => ({ ...await builtIn(values, context), ...await custom(values, context) });
    };
    const handleInvalidSubmit = (errors: Readonly<Record<string, string>>) => {
      latest.current.onInvalidSubmit?.(errors);
      if (latest.current.focusOnInvalidSubmit ?? true) focusFirstInvalidField(errors);
    };
    const reportError = (error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      latest.current.onError?.(error);
    };

    const validateFieldByName = async (name: string): Promise<boolean> => {
      const key = normalizePath(name);
      const run = (validationRuns.get(key) ?? 0) + 1;
      validationRuns.set(key, run);
      const currentSchema = schemaRef.current;
      const field = currentSchema ? findFieldByPath(currentSchema.fields, name) : undefined;
      if (!field) return true;
      validating.set(name, true);
      try {
        const required = Boolean(field.validation?.required || controllerRef.current?.getState(name)?.required);
        const result = await validateField(name, resolvedStore.getValue(dynamicPath(name)), resolvedStore.getValues() as Record<string, unknown>, createFieldValidators(field, { required }));
        if (validationRuns.get(key) === run) {
          if (result.valid) resolvedStore.clearError(dynamicPath(name));
          else resolvedStore.setError(dynamicPath(name), result.errors[0].message);
        }
        return result.valid;
      } finally {
        if (validationRuns.get(key) === run) validating.set(name, false);
      }
    };

    const validateForm = async (): Promise<boolean> => {
      const validator = resolvedFormValidator();
      if (!validator) return true;
      try {
        const valid = await resolvedStore.validate(validator);
        if (!valid) handleInvalidSubmit(resolvedStore.getState().errors);
        return valid;
      } catch (error) {
        reportError(error);
        throw error;
      }
    };

    const submit = async <TResult,>(): Promise<TResult | undefined> => {
      const onSubmit = latest.current.onSubmit;
      if (!onSubmit) return undefined;
      try {
        const result = await resolvedStore.submit(onSubmit as FormSubmitHandler<T, TResult>, resolvedFormValidator());
        if (result === undefined && !resolvedStore.getState().valid) handleInvalidSubmit(resolvedStore.getState().errors);
        return result;
      } catch (error) {
        reportError(error);
        throw error;
      }
    };

    return {
      validateField: validateFieldByName,
      validateForm,
      submit,
      reset: () => resolvedStore.reset(),
      resetField: (name: string) => resolvedStore.resetField(dynamicPath(name)),
    };
  }, [resolvedStore, validating]);

  useEffect(() => {
    if (!schema) {
      setConditionController(undefined);
      return;
    }
    const conditions = new ConditionController(resolvedStore, schema);
    setConditionController(conditions);
    const dependencies = new DependencyController(resolvedStore, schema, {
      onDataSourceRefresh: (field, dataSource, values, context) => latest.current.onDataSourceRefresh?.(field, dataSource, values, context),
    });
    return () => {
      conditions.dispose();
      dependencies.dispose();
      setConditionController((current) => current === conditions ? undefined : current);
    };
  }, [resolvedStore, schema]);

  useEffect(() => {
    const forward = (event: FormEvent<unknown, T>) => latest.current.onEvent?.(event);
    const unsubscribers = [
      resolvedStore.on('valueChange', (event) => { latest.current.onChange?.(event); forward(event); }),
      resolvedStore.on('fieldChange', forward),
      resolvedStore.on('submit', forward),
      resolvedStore.on('reset', (event) => { latest.current.onReset?.(event); forward(event); }),
      resolvedStore.on('validate', (event) => {
        const payload = event.payload as { valid?: boolean } | undefined;
        latest.current.onValidate?.(payload?.valid ?? false);
        forward(event);
      }),
    ];
    return () => { for (const unsubscribe of unsubscribers) unsubscribe(); };
  }, [resolvedStore]);

  useEffect(() => {
    if (disabled !== undefined) resolvedStore.setDisabled(disabled);
  }, [disabled, resolvedStore]);

  const value = useMemo<FormContextValue<T>>(() => ({
    store: resolvedStore,
    registry: resolvedRegistry,
    schema,
    conditionController,
    validationMode,
    readOnly,
    disableWhileSubmitting,
    isFieldValidating: (name) => validating.has(name),
    subscribeFieldValidating: (name, listener) => validating.subscribe(name, listener),
    ...actions,
  }), [actions, conditionController, disableWhileSubmitting, readOnly, resolvedRegistry, resolvedStore, schema, validating, validationMode]);

  return <FormContext.Provider value={value as unknown as FormContextValue}>{children}</FormContext.Provider>;
}

export function useFormContext<T extends FormValues = DynamicFormValues>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used inside <FormProvider>');
  return context as FormContextValue<T>;
}

/**
 * Focuses the first control, in document order, whose `name` matches an error
 * path and that is enabled and not hidden. Equivalent array spellings match.
 */
function focusFirstInvalidField(errors: Readonly<Record<string, string>>): void {
  if (typeof document === 'undefined') return;
  const invalid = new Set(Object.keys(errors).map(normalizePath));
  if (!invalid.size) return;
  for (const element of document.querySelectorAll<HTMLElement>('[name]')) {
    const name = element.getAttribute('name');
    if (!name || !invalid.has(normalizePath(name))) continue;
    if ((element as HTMLInputElement).disabled || element.getAttribute('aria-hidden') === 'true') continue;
    if (element.closest('[hidden], [inert]')) continue;
    if ((element.closest('fieldset') as HTMLFieldSetElement | null)?.disabled) continue;
    element.focus();
    if (document.activeElement === element) return;
  }
}
