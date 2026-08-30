import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import type { FieldOption } from '@lourthuxavierm/dynamic-forms-core';
import { useDataSource, type FieldComponentProps } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlFieldShell } from './HtmlFieldShell';
import { HtmlRadio } from './baseline';

function selectedValues(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}
function includes(values: readonly unknown[], value: unknown): boolean {
  return values.some((item) => Object.is(item, value));
}
function describedBy(props: FieldComponentProps): string | undefined {
  return props.accessibility.ariaDescribedBy;
}
function normalizeOptions(values: readonly unknown[] | undefined): FieldOption[] {
  return (values ?? []).flatMap((item): FieldOption[] => {
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return [{ label: String(item), value: item }];
    if (!item || typeof item !== 'object') return [];
    const value = (item as Record<string, unknown>).value;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return [];
    const candidate = item as Record<string, unknown>;
    return [{
      label: typeof candidate.label === 'string' ? candidate.label : String(value),
      value,
      disabled: Boolean(candidate.disabled),
      group: typeof candidate.group === 'string' ? candidate.group : undefined,
      children: Array.isArray(candidate.children) ? normalizeOptions(candidate.children) : undefined,
    }];
  });
}
function flatten(options: readonly FieldOption[], depth = 0): Array<{ option: FieldOption; depth: number }> {
  return options.flatMap((option) => [{ option, depth }, ...flatten(option.children ?? [], depth + 1)]);
}

export function HtmlCheckboxGroup(props: FieldComponentProps) {
  const values = selectedValues(props.value);
  return <HtmlFieldShell props={props} hideLabel><fieldset disabled={props.disabled} aria-describedby={describedBy(props)} aria-invalid={props.accessibility.ariaInvalid || undefined} aria-required={props.required || undefined} aria-readonly={props.readOnly || undefined}>
    <legend id={props.accessibility.labelId}>{props.field.label ?? props.name}{props.required ? ' *' : ''}</legend>
    {(props.field.options ?? []).map((option, index) => {
      const id = props.accessibility.id + '-' + index;
      return <label key={id} htmlFor={id}><input id={id} type="checkbox" name={props.name}
        disabled={option.disabled} checked={includes(values, option.value)} aria-readonly={props.readOnly || undefined}
        onBlur={() => props.setTouched(true)}
        onChange={(event) => {
          if (props.readOnly) return;
          props.setValue(event.target.checked ? [...values, option.value] : values.filter((value) => !Object.is(value, option.value)));
        }} />{option.label}</label>;
    })}
  </fieldset></HtmlFieldShell>;
}

export const HtmlRadioGroup = HtmlRadio;

export function HtmlSwitch(props: FieldComponentProps) {
  return <HtmlFieldShell props={props} hideLabel><label id={props.accessibility.labelId}>
    <input id={props.accessibility.id} name={props.name} type="checkbox" role="switch"
      checked={Boolean(props.value)} disabled={props.disabled} required={props.required}
      aria-required={props.required || undefined} aria-readonly={props.readOnly || undefined}
      aria-describedby={describedBy(props)} aria-invalid={props.accessibility.ariaInvalid || undefined}
      onBlur={() => props.setTouched(true)}
      onChange={(event) => { if (!props.readOnly) props.setValue(event.target.checked); }} />
    {props.field.label ?? props.name}{props.required ? ' *' : ''}
  </label></HtmlFieldShell>;
}

interface ComboboxProps extends FieldComponentProps {
  asyncOptions?: boolean;
}

function HtmlCombobox(props: ComboboxProps) {
  const source = useDataSource<unknown>(props.name, {
    enabled: Boolean(props.asyncOptions && props.field.dataSource && !props.disabled && !props.readOnly),
  });
  const options = useMemo(
    () => normalizeOptions(props.asyncOptions && props.field.dataSource ? source.data : props.field.options),
    [props.asyncOptions, props.field.dataSource, props.field.options, source.data],
  );
  const selected = options.find((option) => Object.is(option.value, props.value));
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const visible = props.asyncOptions ? options : options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  const choose = (option: FieldOption | undefined) => {
    if (!option || option.disabled || props.readOnly) return;
    props.setValue(option.value);
    setQuery(option.label);
    setOpen(false);
    setActive(-1);
  };
  const nextEnabled = (start: number, direction: 1 | -1): number => {
    if (!visible.length) return -1;
    let candidate = Math.max(0, Math.min(start, visible.length - 1));
    while (visible[candidate]?.disabled && candidate + direction >= 0 && candidate + direction < visible.length) candidate += direction;
    return visible[candidate]?.disabled ? -1 : candidate;
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((value) => nextEnabled(value < 0 ? 0 : value + 1, 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive((value) => nextEnabled(value < 0 ? visible.length - 1 : value - 1, -1)); }
    else if (event.key === 'Home') { event.preventDefault(); setOpen(true); setActive(nextEnabled(0, 1)); }
    else if (event.key === 'End') { event.preventDefault(); setOpen(true); setActive(nextEnabled(visible.length - 1, -1)); }
    else if (event.key === 'Enter' && open && active >= 0) { event.preventDefault(); choose(visible[active]); }
    else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
  };
  return <HtmlFieldShell props={props}><div>
    <input id={props.accessibility.id} name={props.name} role="combobox" autoComplete="off"
      value={query} placeholder={props.field.placeholder} disabled={props.disabled} readOnly={props.readOnly} required={props.required}
      aria-required={props.required || undefined} aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
      aria-activedescendant={open && active >= 0 && visible[active] ? listId + '-option-' + active : undefined}
      aria-labelledby={props.accessibility.labelId} aria-describedby={describedBy(props)} aria-invalid={props.accessibility.ariaInvalid || undefined}
      onFocus={() => setOpen(true)} onBlur={() => { props.setTouched(true); setTimeout(() => { setOpen(false); setActive(-1); }, 0); }}
      onKeyDown={keyDown} onChange={(event) => { if (props.readOnly) return; setQuery(event.target.value); setOpen(true); setActive(-1); source.setSearch(event.target.value); }} />
    {source.loading && <span role="status" aria-live="polite">Loading options</span>}
    {source.error && <span role="alert">Unable to load options <button type="button" onClick={() => void source.refresh()}>Retry</button></span>}
    {open && <ul id={listId} role="listbox" aria-labelledby={props.accessibility.labelId}>
      {visible.map((option, index) => <li id={listId + '-option-' + index} role="option"
        aria-selected={Object.is(option.value, props.value)} aria-disabled={option.disabled || undefined}
        key={String(option.value)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>
        {option.label}
      </li>)}
      {!source.loading && visible.length === 0 && <li role="option" aria-disabled="true">No options available</li>}
    </ul>}
  </div></HtmlFieldShell>;
}

export const HtmlAutocomplete = (props: FieldComponentProps) => <HtmlCombobox {...props} />;
export const HtmlAsyncAutocomplete = (props: FieldComponentProps) => <HtmlCombobox {...props} asyncOptions />;
export const HtmlSearchableSelect = HtmlAutocomplete;

export function HtmlTreeSelect(props: FieldComponentProps) {
  const options = flatten(props.field.options ?? []);
  const selected = options.findIndex(({ option }) => Object.is(option.value, props.value));
  return <HtmlFieldShell props={props}><select id={props.accessibility.id} name={props.name}
    value={selected < 0 ? '' : String(selected)} disabled={props.disabled} required={props.required}
    aria-required={props.required || undefined} aria-readonly={props.readOnly || undefined} aria-invalid={props.accessibility.ariaInvalid || undefined}
    aria-describedby={describedBy(props)} aria-labelledby={props.accessibility.labelId} onBlur={() => props.setTouched(true)}
    onChange={(event) => { if (!props.readOnly) props.setValue(options[Number(event.target.value)]?.option.value); }}>
    <option value="">Select an option</option>
    {options.map(({ option, depth }, index) => <option key={index} value={index} disabled={option.disabled}>
      {'-- '.repeat(depth) + option.label}
    </option>)}
  </select></HtmlFieldShell>;
}

function TreeChecks({ options, props, parent = '' }: { options: readonly FieldOption[]; props: FieldComponentProps; parent?: string }) {
  const values = selectedValues(props.value);
  return <>{options.map((option, index) => {
    const id = props.accessibility.id + '-' + parent + index;
    return <div key={id}><label htmlFor={id}><input id={id} type="checkbox" name={props.name}
      checked={includes(values, option.value)} disabled={props.disabled || option.disabled} aria-readonly={props.readOnly || undefined}
      onBlur={() => props.setTouched(true)} onChange={(event) => {
        if (props.readOnly) return;
        props.setValue(event.target.checked ? [...values, option.value] : values.filter((value) => !Object.is(value, option.value)));
      }} />{option.label}</label>
      {option.children?.length ? <div role="group" aria-label={option.label}><TreeChecks options={option.children} props={props} parent={parent + index + '-'} /></div> : null}
    </div>;
  })}</>;
}
export function HtmlTreeCheckbox(props: FieldComponentProps) {
  return <HtmlFieldShell props={props} hideLabel><fieldset disabled={props.disabled} aria-describedby={describedBy(props)} aria-invalid={props.accessibility.ariaInvalid || undefined} aria-required={props.required || undefined} aria-readonly={props.readOnly || undefined}>
    <legend id={props.accessibility.labelId}>{props.field.label ?? props.name}{props.required ? ' *' : ''}</legend>
    <TreeChecks options={props.field.options ?? []} props={props} />
  </fieldset></HtmlFieldShell>;
}

export function HtmlToggleButtonGroup(props: FieldComponentProps) {
  const multiple = Boolean((props.field.config as { multiple?: boolean } | undefined)?.multiple);
  const values = selectedValues(props.value);
  return <HtmlFieldShell props={props}><div role="group" aria-labelledby={props.accessibility.labelId} aria-describedby={describedBy(props)} aria-required={props.required || undefined} aria-readonly={props.readOnly || undefined}>
    {(props.field.options ?? []).map((option) => {
      const pressed = multiple ? includes(values, option.value) : Object.is(props.value, option.value);
      return <button type="button" key={String(option.value)} aria-pressed={pressed}
        disabled={props.disabled || option.disabled} onBlur={() => props.setTouched(true)}
        onClick={() => {
          if (props.readOnly) return;
          props.setValue(multiple ? (pressed ? values.filter((value) => !Object.is(value, option.value)) : [...values, option.value]) : option.value);
        }}>{option.label}</button>;
    })}
  </div></HtmlFieldShell>;
}
