import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import type { FieldComponentProps } from '@dynamic-forms/react';
import { HtmlFieldShell } from './HtmlFieldShell';
import { formatCurrency, formatPercentage, normalizeNumericValue, parseLocaleNumber } from './numericFormat';


function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}
function onlyDigits(value: string): string {
  return [...value].filter(isDigit).join('');
}
interface NumericConfig {
  locale?: string;
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  maxRating?: number;
  length?: number;
  mask?: string;
}

function LocalizedNumericField({ props, percentage }: { props: FieldComponentProps; percentage?: boolean }) {
  const config = props.field.config as NumericConfig | undefined;
  const locale = config?.locale ?? 'en-US';
  const currency = config?.currency ?? 'USD';
  const numericValue = typeof props.value === 'number' ? props.value : undefined;
  const format = (value: number) => percentage
    ? formatPercentage(value, locale, config?.precision)
    : formatCurrency(value, locale, currency, config?.precision);
  const [display, setDisplay] = useState(() => numericValue === undefined ? '' : format(numericValue));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDisplay(numericValue === undefined ? '' : format(numericValue));
  }, [numericValue, focused, locale, currency, config?.precision]);

  const blur = () => {
    setFocused(false);
    if (numericValue === undefined) setDisplay('');
    else {
      const normalized = normalizeNumericValue(numericValue, {
        minimum: config?.min ?? (percentage ? 0 : undefined),
        maximum: config?.max ?? (percentage ? 100 : undefined),
        step: config?.step,
        precision: config?.precision,
      });
      if (!Object.is(normalized, numericValue)) props.setValue(normalized);
      setDisplay(format(normalized));
    }
    props.setTouched(true);
  };

  return <HtmlFieldShell props={props}><input
    id={props.accessibility.id} name={props.name} type="text" inputMode="decimal"
    value={display} disabled={props.disabled} readOnly={props.readOnly} required={props.required}
    aria-labelledby={props.accessibility.labelId} aria-invalid={props.accessibility.ariaInvalid || undefined}
    placeholder={props.field.placeholder}
    onFocus={() => { setFocused(true); setDisplay(numericValue === undefined ? '' : String(numericValue)); }}
    onChange={(event) => {
      setDisplay(event.target.value);
      if (props.readOnly) return;
      const parsed = parseLocaleNumber(event.target.value, locale);
      if (parsed !== undefined) props.setValue(parsed);
      else if (!event.target.value.trim()) props.setValue(undefined);
    }}
    onBlur={blur}
  /></HtmlFieldShell>;
}

export const HtmlCurrencyField = (props: FieldComponentProps) => <LocalizedNumericField props={props} />;
export const HtmlPercentageField = (props: FieldComponentProps) => <LocalizedNumericField props={props} percentage />;

function numericConfig(props: FieldComponentProps) {
  const config = props.field.config as NumericConfig | undefined;
  return { min: config?.min ?? 0, max: config?.max ?? 100, step: config?.step ?? 1 };
}
export function HtmlSlider(props: FieldComponentProps) {
  const config = numericConfig(props);
  return <HtmlFieldShell props={props}><input id={props.accessibility.id} name={props.name} type="range"
    min={config.min} max={config.max} step={config.step} value={typeof props.value === 'number' ? props.value : config.min}
    disabled={props.disabled} aria-readonly={props.readOnly || undefined} aria-labelledby={props.accessibility.labelId}
    onChange={(event) => { if (!props.readOnly) props.setValue(Number(event.target.value)); }}
    onBlur={() => props.setTouched(true)} />
    <output htmlFor={props.accessibility.id}>{String(props.value ?? config.min)}</output>
  </HtmlFieldShell>;
}

export function HtmlRangeSlider(props: FieldComponentProps) {
  const config = numericConfig(props);
  const value = Array.isArray(props.value) && props.value.length === 2 ? [Number(props.value[0]), Number(props.value[1])] : [config.min, config.max];
  const lowerId = props.accessibility.id + '-lower';
  const upperId = props.accessibility.id + '-upper';
  return <HtmlFieldShell props={props}><div role="group" aria-labelledby={props.accessibility.labelId}>
    <label htmlFor={lowerId}>Minimum</label><input id={lowerId} name={props.name + '.0'} type="range"
      min={config.min} max={value[1]} step={config.step} value={value[0]} disabled={props.disabled}
      aria-readonly={props.readOnly || undefined}
      onChange={(event) => { if (!props.readOnly) props.setValue([Number(event.target.value), value[1]]); }}
      onBlur={() => props.setTouched(true)} />
    <label htmlFor={upperId}>Maximum</label><input id={upperId} name={props.name + '.1'} type="range"
      min={value[0]} max={config.max} step={config.step} value={value[1]} disabled={props.disabled}
      aria-readonly={props.readOnly || undefined}
      onChange={(event) => { if (!props.readOnly) props.setValue([value[0], Number(event.target.value)]); }}
      onBlur={() => props.setTouched(true)} />
    <output>{value[0] + ' – ' + value[1]}</output>
  </div></HtmlFieldShell>;
}

export function HtmlRating(props: FieldComponentProps) {
  const maximum = (props.field.config as NumericConfig | undefined)?.maxRating ?? 5;
  return <HtmlFieldShell props={props}><div role="radiogroup" aria-labelledby={props.accessibility.labelId}>
    {Array.from({ length: maximum }, (_, index) => index + 1).map((rating) => {
      const id = props.accessibility.id + '-' + rating;
      return <label key={id} htmlFor={id}><input id={id} type="radio" name={props.name}
        value={rating} checked={props.value === rating} disabled={props.disabled}
        aria-label={rating + ' of ' + maximum}
        onChange={() => { if (!props.readOnly) props.setValue(rating); }}
        onBlur={() => props.setTouched(true)} />{'★'}</label>;
    })}
  </div></HtmlFieldShell>;
}

export function HtmlPhoneField(props: FieldComponentProps) {
  return <HtmlFieldShell props={props}><input id={props.accessibility.id} name={props.name} type="tel"
    inputMode="tel" autoComplete="tel" value={props.value == null ? '' : String(props.value)}
    disabled={props.disabled} readOnly={props.readOnly} required={props.required}
    aria-labelledby={props.accessibility.labelId}
    onChange={(event) => { if (!props.readOnly) props.setValue(event.target.value); }}
    onBlur={() => props.setTouched(true)} /></HtmlFieldShell>;
}

function SegmentedCode({ props, secret }: { props: FieldComponentProps; secret?: boolean }) {
  const length = (props.field.config as NumericConfig | undefined)?.length ?? (secret ? 4 : 6);
  const value = onlyDigits(String(props.value ?? '')).slice(0, length);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const update = (next: string) => props.setValue(onlyDigits(next).slice(0, length));
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = onlyDigits(event.clipboardData.getData('text')).slice(0, length);
    if (pasted) { update(pasted); refs.current[Math.min(pasted.length, length - 1)]?.focus(); }
  };
  return <HtmlFieldShell props={props} hideLabel><fieldset disabled={props.disabled}>
    <legend id={props.accessibility.labelId}>{props.field.label ?? props.name}</legend>
    {Array.from({ length }, (_, index) => <input key={index} ref={(element) => { refs.current[index] = element; }}
      type={secret ? 'password' : 'text'} inputMode="numeric" maxLength={1}
      autoComplete={index === 0 && !secret ? 'one-time-code' : 'off'}
      value={value[index] ?? ''} aria-label={(props.field.label ?? props.name) + ' digit ' + (index + 1)}
      readOnly={props.readOnly}
      onPaste={paste}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        if (props.readOnly) return;
        const digit = onlyDigits(event.target.value).slice(-1);
        const characters = value.padEnd(length, ' ').split('');
        characters[index] = digit || ' ';
        update(characters.join('').replaceAll(' ', ''));
        if (digit) refs.current[index + 1]?.focus();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !value[index]) refs.current[index - 1]?.focus();
        if (event.key === 'ArrowLeft') refs.current[index - 1]?.focus();
        if (event.key === 'ArrowRight') refs.current[index + 1]?.focus();
      }}
      onBlur={() => props.setTouched(true)} />)}
  </fieldset></HtmlFieldShell>;
}
export const HtmlOtpField = (props: FieldComponentProps) => <SegmentedCode props={props} />;
export const HtmlPinField = (props: FieldComponentProps) => <SegmentedCode props={props} secret />;

/** Mask syntax: 0 digit, A letter, and * alphanumeric. Other characters are literals. */
export function applyMask(value: string, mask: string): string {
  let source = 0;
  let result = '';
  for (const token of mask) {
    if (token === '0' || token === 'A' || token === '*') {
      while (source < value.length) {
        const character = value[source++];
        if ((token === '0' && isDigit(character)) || (token === 'A' && /[A-Za-z]/.test(character)) || (token === '*' && /[A-Za-z0-9]/.test(character))) {
          result += character;
          break;
        }
      }
      if (source >= value.length && result.length === 0) break;
    } else if (value.length && (result || source < value.length)) result += token;
  }
  return result;
}
export function extractMaskValue(input: string, mask: string): string {
  let index = 0;
  let result = '';
  for (const token of mask) {
    if (token !== '0' && token !== 'A' && token !== '*') {
      if (input[index] === token) index += 1;
      continue;
    }
    while (index < input.length) {
      const character = input[index++];
      if ((token === '0' && isDigit(character)) || (token === 'A' && /[A-Za-z]/.test(character)) || (token === '*' && /[A-Za-z0-9]/.test(character))) {
        result += character;
        break;
      }
    }
  }
  return result;
}
export function HtmlMaskField(props: FieldComponentProps) {
  const mask = (props.field.config as NumericConfig | undefined)?.mask;
  const raw = String(props.value ?? '');
  const display = mask ? applyMask(raw, mask) : raw;
  return <HtmlFieldShell props={props}><input id={props.accessibility.id} name={props.name} type="text"
    value={display} disabled={props.disabled} readOnly={props.readOnly}
    placeholder={props.field.placeholder ?? mask}
    aria-labelledby={props.accessibility.labelId} aria-invalid={Boolean(props.error || !mask) || undefined}
    onChange={(event) => { if (!props.readOnly && mask) props.setValue(extractMaskValue(event.target.value, mask) || undefined); }}
    onBlur={() => props.setTouched(true)} />
    {!mask && <div role="alert">Mask configuration is required.</div>}
  </HtmlFieldShell>;
}
