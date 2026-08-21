import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ConditionController,
  createFieldValidators,
  createFormValidator,
  DependencyController,
  FieldRegistry,
  FormStore,
  type DataSourceConfig,
  type FieldSchema,
  type FormEvent,
  type FormSubmitHandler,
  type FormValues,
  type FormSchema,
  type FieldConditionState,
  validateField,
} from '@dynamic-forms/core';
import { warnInDevelopment } from '../development';

export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'manual';

export interface FormContextValue<T extends FormValues = FormValues> {
  store: FormStore<T>;
  registry: FieldRegistry;
  schema?: FormSchema;
  conditionController?: ConditionController<T>;
  validationMode: ValidationMode;
  isFieldValidating: (name: string) => boolean;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  submit: <TResult = unknown>() => Promise<TResult | undefined>;
  reset: () => void;
  resetField: (name: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export interface FormProviderProps<T extends FormValues = FormValues> {
  store?: FormStore<T>;
  registry?: FieldRegistry;
  schema?: FormSchema;
  defaultValues?: T;
  children: ReactNode;
  onSubmit?: FormSubmitHandler<T>;
  onError?: (error: unknown) => void;
  onChange?: (event: FormEvent) => void;
  onValidate?: (valid: boolean) => void;
  validationMode?: ValidationMode;
  onInvalidSubmit?: (errors: Readonly<Record<string, string>>) => void;
  focusOnInvalidSubmit?: boolean;
  onDataSourceRefresh?: (field: FieldSchema, dataSource: DataSourceConfig, values: Readonly<T>) => void | Promise<void>;
}

export function FormProvider<T extends FormValues = FormValues>({
  store,
  registry,
  schema,
  defaultValues,
  children,
  onSubmit,
  onError,
  onChange,
  onValidate,
  validationMode = 'onBlur',
  onInvalidSubmit,
  focusOnInvalidSubmit = true,
  onDataSourceRefresh,
}: FormProviderProps<T>) {
  const parentProvider = useContext(FormContext);
  const internalStore = useRef<FormStore<T> | null>(null);
  if (!internalStore.current) internalStore.current = new FormStore(defaultValues);
  const resolvedStore = store ?? internalStore.current;
  const resolvedRegistry = useMemo(() => registry ?? new FieldRegistry(), [registry]);
  const [conditionController, setConditionController] = useState<ConditionController<T> | undefined>(undefined);
  const [validatingFields, setValidatingFields] = useState<ReadonlySet<string>>(() => new Set());
  const validationRuns = useRef(new Map<string, number>());

  useEffect(() => {
    if (parentProvider) warnInDevelopment('Nested FormProvider detected. Provide a single provider per form unless an isolated nested form is intentional.');
    if (!schema) warnInDevelopment('FormProvider has no schema. Schema-driven rendering and validation are unavailable.');
  }, [parentProvider, schema]);

  const validateFieldByName = useCallback(async (name: string): Promise<boolean> => {
    const run = (validationRuns.current.get(name) ?? 0) + 1;
    validationRuns.current.set(name, run);
    setValidatingFields((current) => new Set(current).add(name));
    const field = schema ? findField(schema.fields, name) : undefined;
    if (!field) { setValidatingFields((current) => { const next = new Set(current); next.delete(name); return next; }); return true; }
    const result = await validateField(name, resolvedStore.getValue(name), resolvedStore.getValues(), createFieldValidators(field));
    const isLatest = validationRuns.current.get(name) === run;
    if (isLatest && result.valid) resolvedStore.clearError(name);
    else if (isLatest) resolvedStore.setError(name, result.errors[0].message);
    if (isLatest) setValidatingFields((current) => { const next = new Set(current); next.delete(name); return next; });
    return result.valid;
  }, [resolvedStore, schema]);

  const handleInvalidSubmit = useCallback((errors: Readonly<Record<string, string>>) => {
    onInvalidSubmit?.(errors);
    if (focusOnInvalidSubmit) focusFirstInvalidField(errors);
  }, [focusOnInvalidSubmit, onInvalidSubmit]);
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!schema) return true;
    const valid = await resolvedStore.validate(createFormValidator(schema));
    if (!valid) handleInvalidSubmit(resolvedStore.getState().errors);
    return valid;
  }, [handleInvalidSubmit, onValidate, resolvedStore, schema]);

  const submit = useCallback(async <TResult,>(): Promise<TResult | undefined> => {
    if (!onSubmit) return undefined;
    try {
      const result = await resolvedStore.submit(onSubmit as FormSubmitHandler<T, TResult>, schema ? createFormValidator(schema) : undefined);
      if (result === undefined && !resolvedStore.getState().valid) handleInvalidSubmit(resolvedStore.getState().errors);
      return result;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [handleInvalidSubmit, onError, onSubmit, resolvedStore, schema]);

  const reset = useCallback(() => resolvedStore.reset(), [resolvedStore]);
  const resetField = useCallback((name: string) => resolvedStore.resetField(name), [resolvedStore]);

  useEffect(() => {
    if (!schema) {
      setConditionController(undefined);
      return;
    }
    const conditions = new ConditionController(resolvedStore, schema);
    setConditionController(conditions);
    const dependencies = new DependencyController(resolvedStore, schema, { onDataSourceRefresh });
    return () => {
      conditions.dispose();
      dependencies.dispose();
      setConditionController((current) => current === conditions ? undefined : current);
    };
  }, [onDataSourceRefresh, resolvedStore, schema]);

  useEffect(() => {
    if (!onChange) return;
    return resolvedStore.on('valueChange', onChange);
  }, [onChange, resolvedStore]);

  useEffect(() => {
    if (!onValidate) return;
    return resolvedStore.on('validate', (event) => {
      const payload = event.payload as { valid?: boolean } | undefined;
      onValidate(payload?.valid ?? false);
    });
  }, [onValidate, resolvedStore]);

  const value = useMemo<FormContextValue<T>>(() => ({
    store: resolvedStore,
    registry: resolvedRegistry,
    schema,
    conditionController,
    validationMode,
    isFieldValidating: (name) => validatingFields.has(name),
    validateField: validateFieldByName,
    validateForm,
    submit,
    reset,
    resetField,
  }), [conditionController, resolvedRegistry, resolvedStore, reset, resetField, schema, submit, validateFieldByName, validateForm, validatingFields, validationMode]);

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext<T extends FormValues = FormValues>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used inside <FormProvider>');
  return context as FormContextValue<T>;
}

function findField(fields: readonly FieldSchema[], name: string, parent = ''): FieldSchema | undefined {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    if (path === name) return field;
    const nested = field.fields ? findField(field.fields, name, path) : undefined;
    if (nested) return nested;
  }
  return undefined;
}

function focusFirstInvalidField(errors: Readonly<Record<string, string>>): void {
  if (typeof document === 'undefined') return;
  const name = Object.keys(errors)[0];
  if (!name) return;
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/(["\\])/g, '\\$1');
  document.querySelector<HTMLElement>(`[name="${escaped}"]`)?.focus();
}