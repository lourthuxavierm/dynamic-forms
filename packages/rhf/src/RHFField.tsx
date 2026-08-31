import { useEffect, type ReactElement } from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { useFieldState as useDynamicFieldState } from '@dynamic-form-engine/react';
import { useDynamicFormRHF } from './provider';

export interface RHFDynamicFieldState {
  visible: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  error?: string;
  touched: boolean;
  dirty: boolean;
  isValidating: boolean;
}

type ControllerRenderArguments<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Parameters<ControllerProps<TFieldValues, TName>['render']>[0];

export type RHFFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'control' | 'render'> & {
  control?: ControllerProps<TFieldValues, TName>['control'];
  render: (props: ControllerRenderArguments<TFieldValues, TName> & {
    dynamicState: RHFDynamicFieldState;
  }) => ReactElement;
};

/** Controller-backed field with Dynamic Forms condition state and hidden-field policy. */
export function RHFField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, render, disabled, shouldUnregister, ...props }: RHFFieldProps<TFieldValues, TName>) {
  const context = useDynamicFormRHF<TFieldValues>();
  const name = String(props.name);
  const dynamicState = useDynamicFieldState(name);
  useEffect(() => {
    if (dynamicState.visible || context.hiddenFieldPolicy !== 'unregister') return;
    context.store.setValue(name, undefined, { shouldDirty: false });
    context.methods.unregister(props.name);
  }, [context.hiddenFieldPolicy, context.methods, context.store, dynamicState.visible, name, props.name]);
  if (!dynamicState.visible) return null;
  return <Controller<TFieldValues, TName>
    {...props}
    control={control ?? context.methods.control}
    disabled={disabled ?? dynamicState.disabled}
    shouldUnregister={shouldUnregister ?? context.hiddenFieldPolicy === 'unregister'}
    render={(controller) => render({ ...controller, dynamicState })}
  />;
}