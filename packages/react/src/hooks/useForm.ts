import { useMemo } from 'react';
import { FieldRegistry, FormStore, type FormValues } from '@lourthuxavierm/dynamic-forms-core';

export interface UseFormOptions<TValues extends FormValues = FormValues> {
  defaultValues?: TValues;
  registry?: FieldRegistry;
}

/** Creates a typed store and registry for a controlled FormProvider. */
export function useForm<TValues extends FormValues = FormValues>(options: UseFormOptions<TValues> = {}) {
  const store = useMemo(() => new FormStore<TValues>(options.defaultValues), []);
  const registry = useMemo(() => options.registry ?? new FieldRegistry(), [options.registry]);
  return { store, registry };
}