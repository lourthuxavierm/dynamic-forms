import type { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { DateTimeFieldConfig, FieldComponentProps, FieldOption, NumericFieldConfig } from './types-internal';
import { HtmlFieldShell } from './HtmlFieldShell';

type InputKind = 'text' | 'password' | 'email' | 'url' | 'number' | 'date' | 'time' | 'datetime-local' | 'month';

function describedBy(props: FieldComponentProps): string | undefined {
  const ids = [];
  if (props.field.description) ids.push(props.accessibility.descriptionId);
  if (props.error) ids.push(props.accessibility.errorId);
  return ids.length ? ids.join(' ') : undefined;
}

function common(props: FieldComponentProps) {
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

function HtmlInput(props: FieldComponentProps, type: InputKind, numeric = false, integer = false) {
  const config = props.field.config as (NumericFieldConfig & DateTimeFieldConfig) | undefined;
  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    ...common(props),
    type,
    placeholder: props.field.placeholder,
    readOnly: props.readOnly,
    value: props.value == null ? '' : String(props.value),
    min: numeric ? config?.min : config?.minDate,
    max: numeric ? config?.max : config?.maxDate,
    step: numeric ? (integer ? 1 : config && 'step' in config ? config.step : 'any') : undefined,
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
export const HtmlDateField = (props: FieldComponentProps) => HtmlInput(props, 'date');
export const HtmlTimeField = (props: FieldComponentProps) => HtmlInput(props, 'time');
export const HtmlDateTimeField = (props: FieldComponentProps) => HtmlInput(props, 'datetime-local');
export const HtmlMonthField = (props: FieldComponentProps) => HtmlInput(props, 'month');

export function HtmlTextarea(props: FieldComponentProps) {
  const config = props.field.config as { rows?: number } | undefined;
  const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> = {
    ...common(props),
    placeholder: props.field.placeholder,
    readOnly: props.readOnly,
    rows: config?.rows,
    value: props.value == null ? '' : String(props.value),
    onChange: (event) => { if (!props.readOnly) props.setValue(event.target.value); },
  };
  return <HtmlFieldShell props={props}><textarea {...textareaProps} /></HtmlFieldShell>;
}

export function HtmlHiddenField(props: FieldComponentProps) {
  return <input type="hidden" id={props.accessibility.id} name={props.name} disabled={props.disabled} value={props.value == null ? '' : String(props.value)} />;
}

export function HtmlCheckbox(props: FieldComponentProps) {
  return <HtmlFieldShell props={props} hideLabel><label id={props.accessibility.labelId}>
    <input {...common(props)} type="checkbox" checked={Boolean(props.value)}
      onChange={(event) => { if (!props.readOnly) props.setValue(event.target.checked); }} />
    {props.field.label ?? props.name}{props.required ? ' *' : ''}
  </label></HtmlFieldShell>;
}

function optionIndex(options: readonly FieldOption[], value: unknown): string {
  const index = options.findIndex((option) => Object.is(option.value, value));
  return index < 0 ? '' : String(index);
}

export function HtmlRadio(props: FieldComponentProps) {
  const options = props.field.options ?? [];
  return <HtmlFieldShell props={props} hideLabel><fieldset disabled={props.disabled} aria-describedby={describedBy(props)} aria-invalid={props.accessibility.ariaInvalid || undefined}>
    <legend id={props.accessibility.labelId}>{props.field.label ?? props.name}{props.required ? ' *' : ''}</legend>
    {options.map((option, index) => {
      const id = props.accessibility.id + '-' + index;
      return <label key={index} htmlFor={id}>
        <input {...props.accessibility.dataAttributes} id={id} type="radio" name={props.name} value={index}
          checked={Object.is(props.value, option.value)} disabled={option.disabled} required={props.required}
          aria-readonly={props.readOnly || undefined} onBlur={() => props.setTouched(true)}
          onChange={() => { if (!props.readOnly) props.setValue(option.value); }} />
        {option.label}
      </label>;
    })}
  </fieldset></HtmlFieldShell>;
}

export function HtmlSelect(props: FieldComponentProps) {
  const options = props.field.options ?? [];
  const selectProps: SelectHTMLAttributes<HTMLSelectElement> = {
    ...common(props),
    value: optionIndex(options, props.value),
    onChange: (event) => { if (!props.readOnly) props.setValue(options[Number(event.target.value)]?.value); },
  };
  return <HtmlFieldShell props={props}><select {...selectProps}>
    <option value="" disabled={props.required}>Select an option</option>
    {options.map((option, index) => <option key={index} value={index} disabled={option.disabled}>{option.label}</option>)}
  </select></HtmlFieldShell>;
}

export function HtmlMultiSelect(props: FieldComponentProps) {
  const options = props.field.options ?? [];
  const selected = Array.isArray(props.value) ? props.value : [];
  return <HtmlFieldShell props={props}><select {...common(props)} multiple
    value={options.flatMap((option, index) => selected.some((value) => Object.is(value, option.value)) ? [String(index)] : [])}
    onChange={(event) => {
      if (props.readOnly) return;
      props.setValue(Array.from(event.target.selectedOptions, (option) => options[Number(option.value)]?.value));
    }}>
    {options.map((option, index) => <option key={index} value={index} disabled={option.disabled}>{option.label}</option>)}
  </select></HtmlFieldShell>;
}

export function HtmlFileField(props: FieldComponentProps) {
  const config = props.field.config as { accept?: string } | undefined;
  return <HtmlFieldShell props={props}><input {...common(props)} type="file" accept={config?.accept}
    onChange={(event) => { if (!props.readOnly) props.setValue(event.target.files?.[0] ?? null); }} /></HtmlFieldShell>;
}
