import {
  useFieldArray,
  type FieldArrayPath,
  type FieldValues,
  type UseFieldArrayProps,
  type UseFieldArrayReturn,
} from 'react-hook-form';
import { useCallback, useMemo } from 'react';
import { useDynamicFormRHF } from './provider';

export type UseRHFFieldArrayProps<
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
> = Omit<UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>, 'control'> & {
  control?: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>['control'];
};

/**
 * Uses RHF's field-array identity and mutations while defaulting to the adapter
 * provider's authoritative control instance. Whole-array replacement also
 * removes errors belonging to rows that no longer exist.
 */
export function useRHFFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseRHFFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> {
  const { methods } = useDynamicFormRHF<TFieldValues>();
  const array = useFieldArray<TFieldValues, TFieldArrayName, TKeyName>({
    ...props,
    control: props.control ?? methods.control,
  });
  const replace = useCallback<typeof array.replace>((values) => {
    array.replace(values);
    methods.clearErrors(props.name as Parameters<typeof methods.clearErrors>[0]);
  }, [array.replace, methods, props.name]);
  return useMemo(() => ({ ...array, replace }), [array, replace]);
}
