import { useMemo } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useDynamicFormRHF } from './provider';

export interface RHFFormActions<TFieldValues extends FieldValues = FieldValues> {
  reset: UseFormReturn<TFieldValues>['reset'];
  resetField: UseFormReturn<TFieldValues>['resetField'];
  trigger: UseFormReturn<TFieldValues>['trigger'];
  setError: UseFormReturn<TFieldValues>['setError'];
  clearErrors: UseFormReturn<TFieldValues>['clearErrors'];
  setFocus: UseFormReturn<TFieldValues>['setFocus'];
}

/** Typed lifecycle and imperative operations for the authoritative RHF form. */
export function useRHFFormActions<
  TFieldValues extends FieldValues = FieldValues,
>(): RHFFormActions<TFieldValues> {
  const { methods } = useDynamicFormRHF<TFieldValues>();
  return useMemo(() => ({
    reset: methods.reset,
    resetField: methods.resetField,
    trigger: methods.trigger,
    setError: methods.setError,
    clearErrors: methods.clearErrors,
    setFocus: methods.setFocus,
  }), [methods]);
}
