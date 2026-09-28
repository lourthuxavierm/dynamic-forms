import type { SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { FieldComponentProps, FieldOption } from './types-internal';
import { HtmlFieldShell } from './HtmlFieldShell';

export { HtmlTextField, HtmlPasswordField, HtmlEmailField, HtmlUrlField, HtmlNumberField, HtmlIntegerField, HtmlDecimalField, HtmlMonthField, HtmlYearField } from './inputs';
import { common, describedBy } from './inputs';

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

export { HtmlDateField, HtmlTimeField, HtmlDateTimeField } from './temporal';
