import { type ComponentType, type ReactNode, useEffect, useRef } from 'react';
import type { FieldSchema } from '@dynamic-form-engine/core';
import { useField } from '../hooks/useField';
import { useFieldState } from '../hooks/useFieldState';
import { useFormContext } from '../context';
import { warnInDevelopment } from '../development';
import { fieldId } from './FormErrorSummary';
import { findFieldByPath } from '../schemaPaths';

export interface FieldAccessibilityProps {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  ariaInvalid: boolean;
  ariaDescribedBy?: string;
  ariaLabelledBy: string;
  dataAttributes: { 'data-dynamic-forms-field': '' };
  validationMessage?: string;
  validationLiveRegion: { role: 'status'; 'aria-live': 'polite'; 'aria-atomic': true };
}

/** Stable renderer contract. Additions remain optional until the next major release. */
export interface FieldComponentProps<T = unknown> {
  field: FieldSchema;
  name: string;
  value: T;
  setValue: (value: T) => void;
  setError: (message: string) => void;
  clearError: () => void;
  error?: string;
  touched: boolean;
  dirty: boolean;
  isValidating: boolean;
  visible: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  accessibility: FieldAccessibilityProps;
  setTouched: (touched?: boolean) => void;
  validate: () => Promise<boolean>;
}

export interface DynamicFieldProps {
  field?: FieldSchema;
  name?: string;
  type?: string;
  render?: (props: FieldComponentProps) => ReactNode;
}

export function DynamicField({ field: explicitField, name, type, render }: DynamicFieldProps) {
  const { registry, schema } = useFormContext();
  const field = explicitField ?? (schema ? findFieldByPath(schema.fields, name ?? '') : undefined);
  if (!field) {
    warnInDevelopment(name ? `Unknown field path "${name}".` : 'DynamicField was rendered without a field or provider schema.');
    throw new Error(`DynamicField requires a field schema or a schema field named "${name}"`);
  }
  if (type && type !== field.type) throw new Error(`DynamicField type "${type}" does not match schema type "${field.type}"`);

  const fieldValue = useField(field.name);
  const fieldState = useFieldState(field.name);
  const id = fieldId(field.name);
  const wasFocused = useRef(false);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const trackFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      wasFocused.current = target?.id === id || target?.getAttribute('name') === field.name;
    };
    document.addEventListener('focusin', trackFocus);
    return () => document.removeEventListener('focusin', trackFocus);
  }, [field.name, id]);
  useEffect(() => {
    if (fieldState.visible || !wasFocused.current || typeof document === 'undefined') return;
    wasFocused.current = false;
    document.querySelector<HTMLElement>('[data-dynamic-forms-field]:not([disabled])')?.focus();
  }, [fieldState.visible]);
  if (!fieldState.visible) return null;

  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const labelId = `${id}-label`;
  const props: FieldComponentProps = {
    field,
    name: field.name,
    value: fieldValue.value,
    setValue: fieldValue.setValue,
    setError: fieldValue.setError,
    clearError: fieldValue.clearError,
    error: fieldState.error,
    touched: fieldState.touched,
    dirty: fieldState.dirty,
    isValidating: fieldState.isValidating,
    visible: fieldState.visible,
    disabled: fieldState.disabled || Boolean(field.disabled),
    required: fieldState.required || Boolean(field.validation?.required),
    readOnly: fieldState.readOnly || Boolean(field.readOnly),
    accessibility: {
      id,
      labelId,
      descriptionId,
      errorId,
      ariaInvalid: Boolean(fieldState.error),
      ariaDescribedBy: [field.description ? descriptionId : undefined, fieldState.error ? errorId : undefined].filter(Boolean).join(' ') || undefined,
      ariaLabelledBy: labelId,
      dataAttributes: { 'data-dynamic-forms-field': '' },
      validationMessage: fieldState.error ?? (fieldState.isValidating ? 'Validating' : undefined),
      validationLiveRegion: { role: 'status', 'aria-live': 'polite', 'aria-atomic': true },
    },
    setTouched: fieldValue.setTouched,
    validate: fieldValue.validate,
  };

  if (render) return <>{render(props)}</>;
  const Component = registry.get(field.type)?.component as ComponentType<FieldComponentProps> | undefined;
  if (!Component) {
    warnInDevelopment(`Unknown field type "${field.type}" for field "${field.name}".`);
    throw new Error(`Field type "${field.type}" is not registered`);
  }
  return <Component {...props} />;
}
