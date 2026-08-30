import type { InputHTMLAttributes, ReactNode } from 'react';
import type { FieldComponentProps } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlFieldShell } from './HtmlFieldShell';
import { normalizeTemporalValue, type TemporalKind } from './temporalValues';

interface TemporalConfig {
  min?: string;
  max?: string;
  minDate?: string;
  maxDate?: string;
  step?: number;
}

export interface HtmlTemporalEnhancementContext {
  kind: TemporalKind;
  props: FieldComponentProps;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}
export type HtmlTemporalEnhancer = (context: HtmlTemporalEnhancementContext) => ReactNode;

export function createHtmlTemporalField(kind: TemporalKind, enhance?: HtmlTemporalEnhancer) {
  return function HtmlTemporalField(props: FieldComponentProps) {
    const config = props.field.config as TemporalConfig | undefined;
    const inputProps: InputHTMLAttributes<HTMLInputElement> = {
      id: props.accessibility.id,
      name: props.name,
      type: kind,
      value: typeof props.value === 'string' ? props.value : '',
      min: config?.min ?? config?.minDate,
      max: config?.max ?? config?.maxDate,
      step: config?.step,
      disabled: props.disabled,
      readOnly: props.readOnly,
      required: props.required,
      'aria-labelledby': props.accessibility.labelId,
      'aria-invalid': props.accessibility.ariaInvalid || undefined,
      onChange: (event) => {
        if (props.readOnly) return;
        props.setValue(normalizeTemporalValue(kind, event.currentTarget.value));
      },
      onBlur: () => props.setTouched(true),
    };
    return <HtmlFieldShell props={props}>{enhance ? enhance({ kind, props, inputProps }) : <input {...inputProps} />}</HtmlFieldShell>;
  };
}

export const HtmlDateField = createHtmlTemporalField('date');
export const HtmlTimeField = createHtmlTemporalField('time');
export const HtmlDateTimeField = createHtmlTemporalField('datetime-local');

interface RangeProps { props: FieldComponentProps; kind: TemporalKind; }
function HtmlTemporalRange({ props, kind }: RangeProps) {
  const config = props.field.config as TemporalConfig | undefined;
  const value = Array.isArray(props.value) ? props.value as readonly unknown[] : [];
  const start = typeof value[0] === 'string' ? value[0] : '';
  const end = typeof value[1] === 'string' ? value[1] : '';
  const startId = props.accessibility.id + '-start';
  const endId = props.accessibility.id + '-end';
  const setStart = (raw: string) => {
    const next = normalizeTemporalValue(kind, raw);
    if (!next) { props.setValue([undefined, end || undefined]); return; }
    props.setValue([next, end && next > end ? next : end || undefined]);
  };
  const setEnd = (raw: string) => {
    const next = normalizeTemporalValue(kind, raw);
    if (!next) { props.setValue([start || undefined, undefined]); return; }
    props.setValue([start && next < start ? next : start || undefined, next]);
  };
  return <HtmlFieldShell props={props} hideLabel><fieldset disabled={props.disabled}>
    <legend id={props.accessibility.labelId}>{props.field.label ?? props.name}</legend>
    <label htmlFor={startId}>Start</label><input id={startId} name={props.name + '.0'} type={kind}
      value={start} min={config?.min ?? config?.minDate} max={end || (config?.max ?? config?.maxDate)}
      step={config?.step} readOnly={props.readOnly} required={props.required}
      onChange={(event) => { if (!props.readOnly) setStart(event.target.value); }} onBlur={() => props.setTouched(true)} />
    <label htmlFor={endId}>End</label><input id={endId} name={props.name + '.1'} type={kind}
      value={end} min={start || (config?.min ?? config?.minDate)} max={config?.max ?? config?.maxDate}
      step={config?.step} readOnly={props.readOnly} required={props.required}
      onChange={(event) => { if (!props.readOnly) setEnd(event.target.value); }} onBlur={() => props.setTouched(true)} />
  </fieldset></HtmlFieldShell>;
}
export const HtmlDateRangeField = (props: FieldComponentProps) => <HtmlTemporalRange props={props} kind="date" />;
export const HtmlTimeRangeField = (props: FieldComponentProps) => <HtmlTemporalRange props={props} kind="time" />;
export const HtmlDateTimeRangeField = (props: FieldComponentProps) => <HtmlTemporalRange props={props} kind="datetime-local" />;
