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
  FormStore,
  type DataSourceConfig,
  type FieldSchema,
  type FormSchema,
  type FormValues,
} from '@dynamic-form-engine/core';
import { FormProvider as DynamicFormsProvider } from '@dynamic-form-engine/react';
import {
  FormProvider as ReactHookFormProvider,
  useForm as useReactHookForm,
  useFormState as useReactHookFormState,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { RHFHiddenFieldPolicy } from './contract';

export interface DynamicFormRHFContextValue<TFieldValues extends FieldValues = FieldValues> {
  methods: UseFormReturn<TFieldValues>;
  store: FormStore<TFieldValues>;
  hiddenFieldPolicy: RHFHiddenFieldPolicy;
}

const DynamicFormRHFContext = createContext<DynamicFormRHFContextValue<any> | null>(null);

export interface DynamicFormRHFProviderProps<TFieldValues extends FieldValues = FieldValues> {
  schema?: FormSchema;
  children: ReactNode;
  methods?: UseFormReturn<TFieldValues>;
  formOptions?: UseFormProps<TFieldValues>;
  hiddenFieldPolicy?: RHFHiddenFieldPolicy;
  onDataSourceRefresh?: (field: FieldSchema, dataSource: DataSourceConfig, values: Readonly<TFieldValues>) => void | Promise<void>;
}

/**
 * Makes React Hook Form authoritative while projecting its values into a Core
 * store for Dynamic Forms schemas, conditions, and renderer subscriptions.
 */
export function DynamicFormRHFProvider<TFieldValues extends FieldValues = FieldValues>({
  schema,
  children,
  methods: externalMethods,
  formOptions,
  hiddenFieldPolicy = 'retain',
  onDataSourceRefresh,
}: DynamicFormRHFProviderProps<TFieldValues>) {
  const internalMethods = useReactHookForm<TFieldValues>(formOptions);
  const methods = externalMethods ?? internalMethods;
  const [store] = useState(() => new FormStore<TFieldValues>(methods.getValues()));
  const { errors } = useReactHookFormState({ control: methods.control });
  const syncingFromRHF = useRef(false);
  const syncingFromCore = useRef(false);

  useEffect(() => {
    syncingFromRHF.current = true;
    projectSnapshot(store, methods.getValues());
    syncingFromRHF.current = false;
    const subscription = methods.watch((values, info) => {
      if (syncingFromCore.current) return;
      syncingFromRHF.current = true;
      if (info.name) {
        store.setValue(info.name, cloneForProjection(readPath(values, info.name)), { shouldDirty: false });
        syncingFromRHF.current = false;
        syncingFromCore.current = true;
        try { reconcileCoreValues(methods, store); } finally { syncingFromCore.current = false; }
      } else {
        projectSnapshot(store, values as TFieldValues);
        syncingFromRHF.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, store]);

useEffect(() => {
    const nextErrors = flattenErrorMessages(errors);
    for (const path of Object.keys(store.getState().errors)) {
      if (!(path in nextErrors)) store.clearError(path);
    }
    for (const [path, message] of Object.entries(nextErrors)) {
      if (store.getState().errors[path] !== message) store.setError(path, message);
    }
  }, [errors, store]);

  useEffect(() => store.subscribe((state) => {
    if (syncingFromRHF.current) return;
    syncingFromCore.current = true;
    try {
      writeCoreValuesToRHF(methods, state.values, state.dirty, state.touched);
    } finally {
      syncingFromCore.current = false;
    }
  }), [methods, store]);

  const value = useMemo<DynamicFormRHFContextValue<TFieldValues>>(
    () => ({ methods, store, hiddenFieldPolicy }),
    [hiddenFieldPolicy, methods, store],
  );

  return (
    <DynamicFormRHFContext.Provider value={value}>
      <ReactHookFormProvider {...methods}>
        <DynamicFormsProvider<FormValues>
          schema={schema}
          store={store as FormStore<FormValues>}
          onDataSourceRefresh={onDataSourceRefresh as DynamicFormRHFProviderProps<FormValues>['onDataSourceRefresh']}
        >
          {children}
        </DynamicFormsProvider>
      </ReactHookFormProvider>
    </DynamicFormRHFContext.Provider>
  );
}

/** Returns the RHF methods and the read-only Dynamic Forms projection store. */
export function useDynamicFormRHF<TFieldValues extends FieldValues = FieldValues>(): DynamicFormRHFContextValue<TFieldValues> {
  const context = useContext(DynamicFormRHFContext);
  if (!context) throw new Error('useDynamicFormRHF must be used inside <DynamicFormRHFProvider>');
  return context as DynamicFormRHFContextValue<TFieldValues>;
}

function reconcileCoreValues<TFieldValues extends FieldValues>(
  methods: UseFormReturn<TFieldValues>,
  store: FormStore<TFieldValues>,
): void {
  const state = store.getState();
  writeCoreValuesToRHF(methods, state.values, state.dirty, state.touched);
}

function writeCoreValuesToRHF<TFieldValues extends FieldValues>(
  methods: UseFormReturn<TFieldValues>,
  values: TFieldValues,
  dirty: Readonly<Record<string, boolean>>,
  touched: Readonly<Record<string, boolean>>,
): void {
  for (const [path, value] of Object.entries(values)) {
    if (isSameValue(readPath(methods.getValues(), path), value)) continue;
    const hasDirtyDescendant = Object.keys(dirty).some((key) => key === path || key.startsWith(path + '.'));
    const hasTouchedDescendant = Object.keys(touched).some((key) => key === path || key.startsWith(path + '.'));
    methods.setValue(path as FieldPath<TFieldValues>, value as PathValue<TFieldValues, FieldPath<TFieldValues>>, {
      shouldDirty: hasDirtyDescendant,
      shouldTouch: hasTouchedDescendant,
    });
  }
}
function flattenErrorMessages(value: unknown, prefix = ''): Record<string, string> {
  if (value === null || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  if (typeof record.message === 'string' && prefix) return { [prefix]: record.message };
  const output: Record<string, string> = {};
  for (const [key, nested] of Object.entries(record)) {
    if (key === 'ref' || key === 'type' || key === 'types' || key === 'message') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    Object.assign(output, flattenErrorMessages(nested, path));
  }
  return output;
}
function cloneForProjection<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value.map(cloneForProjection) as T;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, cloneForProjection(nested)]),
  ) as T;
}
function projectSnapshot<TFieldValues extends FieldValues>(
  store: FormStore<TFieldValues>,
  values: TFieldValues,
): void {
  store.reset(structuredClone(values));
}

function leafEntries(value: unknown, prefix = ''): Array<[string, unknown]> {
  if (!isTraversable(value)) return prefix ? [[prefix, value]] : [];
  const entries: Array<[string, unknown]> = [];
  for (const [key, nested] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isTraversable(nested)) entries.push(...leafEntries(nested, path));
    else entries.push([path, nested]);
  }
  return entries;
}

function isTraversable(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  if (value instanceof Date) return false;
  if (typeof File !== 'undefined' && value instanceof File) return false;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return false;
  return true;
}

function isSameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
  if (typeof File !== 'undefined' && left instanceof File && right instanceof File) {
    return left.name === right.name
      && left.size === right.size
      && left.type === right.type
      && left.lastModified === right.lastModified;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => isSameValue(value, right[index]));
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length
      && leftKeys.every((key) => key in right && isSameValue(left[key], right[key]));
  }
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
    && Object.getPrototypeOf(value) === Object.prototype;
}
function readPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}