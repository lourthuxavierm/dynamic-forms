import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { DateTimeFieldConfig, FieldComponentProps, NumericFieldConfig } from './types-internal';
import { HtmlFieldShell } from './HtmlFieldShell';

// Single-input controls with no temporal, option, or file dependencies, kept in
// their own module so `@dynamic-form-engine/react-html/controls/text` stays small.
type InputKind = 'text' | 'password' | 'email' | 'url' | 'number' | 'date' | 'time' | 'datetime-local' | 'month';

export function describedBy(props: FieldComponentProps): string | undefined {
  const ids = [];
  if (props.field.description) ids.push(props.accessibility.descriptionId);
  if (props.error) ids.push(props.accessibility.errorId);
  return ids.length ? ids.join(' ') : undefined;
}

export function common(props: FieldComponentProps) {
  return {
    ...props.accessibility.dataAttributes,
    id: props.accessibility.id,
    name: props.name,
    disabled: props.disabled,
    required: props.required,
    'aria-required': props.required || undefined,
    'aria-invalid': props.accessibility.ariaInvalid || undefined,
    'aria-describedby': describedBy(props),
    'aria-labelledby': props.accessibility.ariaLabelledBy,
    'aria-readonly': props.readOnly || undefined,
    onBlur: () => props.setTouched(true),
  };
}

function HtmlInput(props: FieldComponentProps, type: InputKind, numeric = false, integer = false, defaultStep?: number) {
  const config = props.field.config as (NumericFieldConfig & DateTimeFieldConfig) | undefined;
  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    ...common(props),
    type,
    placeholder: props.field.placeholder,
    readOnly: props.readOnly,
    value: props.value == null ? '' : String(props.value),
    min: numeric ? config?.min : config?.minDate,
    max: numeric ? config?.max : config?.maxDate,
    step: numeric ? (integer ? 1 : config?.step ?? defaultStep ?? 'any') : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (props.readOnly) return;
      const raw = event.target.value;
      props.setValue(numeric ? (raw === '' ? undefined : Number(raw)) : raw);
    },
  };
  return <HtmlFieldShell props={props}><input {...inputProps} /></HtmlFieldShell>;
}

export const HtmlTextField = (props: FieldComponentProps) => HtmlInput(props, 'text');
export const HtmlPasswordField = (props: FieldComponentProps) => HtmlInput(props, 'password');
export const HtmlEmailField = (props: FieldComponentProps) => HtmlInput(props, 'email');
export const HtmlUrlField = (props: FieldComponentProps) => HtmlInput(props, 'url');
export const HtmlNumberField = (props: FieldComponentProps) => HtmlInput(props, 'number', true);
export const HtmlIntegerField = (props: FieldComponentProps) => HtmlInput(props, 'number', true, true);
export const HtmlDecimalField = (props: FieldComponentProps) => HtmlInput(props, 'number', true);
export const HtmlMonthField = (props: FieldComponentProps) => HtmlInput(props, 'month');
/** Stores a numeric Gregorian year and uses native min/max/step constraints. */
export const HtmlYearField = (props: FieldComponentProps) => HtmlInput(props, 'number', true, false, 1);
