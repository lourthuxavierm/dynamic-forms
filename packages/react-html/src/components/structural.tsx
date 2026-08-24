import { useSyncExternalStore, type ReactNode } from 'react';
import { evaluateCondition, type FieldSchema } from '@dynamic-forms/core';
import { useFieldArray, useFieldState, useFormContext } from '@dynamic-forms/react';
import type { HtmlFieldRegistry } from '../registry';

export interface HtmlArrayRenderItem {
  id: string;
  index: number;
  content: ReactNode;
}

export interface HtmlArrayItemsRendererProps {
  field: FieldSchema;
  name: string;
  items: readonly HtmlArrayRenderItem[];
}

/** Extension point for windowing large collections without coupling the adapter to a virtualization library. */
export type HtmlArrayItemsRenderer = (props: HtmlArrayItemsRendererProps) => ReactNode;

export interface HtmlStructuralFieldProps {
  field: FieldSchema;
  name: string;
  registry: HtmlFieldRegistry;
  arrayItemsRenderer?: HtmlArrayItemsRenderer;
  renderLeaf: (field: FieldSchema) => ReactNode;
}

export function HtmlStructuralField(props: HtmlStructuralFieldProps) {
  return props.field.type === 'array' ? <HtmlArrayField {...props} /> : <HtmlObjectField {...props} />;
}

function HtmlObjectField({ field, name, registry, arrayItemsRenderer, renderLeaf }: HtmlStructuralFieldProps) {
  const state = useFieldState(name);
  if (!state.visible) return null;
  return (
    <fieldset className="df-structural df-object" disabled={state.disabled || field.disabled} data-df-field={name}>
      <legend>{field.label ?? humanize(field.name)}</legend>
      {field.description ? <p>{field.description}</p> : null}
      {field.fields?.map((child) => (
        <StructuralNode key={child.name} field={child} name={`${name}.${child.name}`} registry={registry} arrayItemsRenderer={arrayItemsRenderer} renderLeaf={renderLeaf} />
      ))}
      {state.error ? <p role="alert">{state.error}</p> : null}
    </fieldset>
  );
}

function HtmlArrayField({ field, name, registry, arrayItemsRenderer, renderLeaf }: HtmlStructuralFieldProps) {
  const array = useFieldArray<unknown>(name);
  const state = useFieldState(name);
  const { store } = useFormContext();
  const storeState = useSyncExternalStore(store.subscribe.bind(store), store.getState.bind(store), store.getState.bind(store));
  if (!state.visible) return null;
  const minimum = field.validation?.minItems ?? 0;
  const maximum = field.validation?.maxItems ?? Number.POSITIVE_INFINITY;
  const primitive = isPrimitiveArray(field);
  const disabled = state.disabled || Boolean(field.disabled);
  const immutable = disabled || state.readOnly || Boolean(field.readOnly);
  const itemErrors = Object.entries(storeState.errors).filter(([path]) => path.startsWith(`${name}[`));
  const items: HtmlArrayRenderItem[] = array.fields.map((item, index) => ({
    id: item.id,
    index,
    content: (
      <fieldset className="df-array-item" data-df-array-key={item.id}>
        <legend>{`${field.metadata?.itemLabel ?? field.label ?? humanize(field.name)} ${index + 1}`}</legend>
        {primitive
          ? renderPrimitive(field, name, index, renderLeaf)
          : field.fields?.map((child) => (
            <ConditionalArrayNode key={child.name} field={child} name={`${name}[${index}].${child.name}`} itemValue={item.value} registry={registry} arrayItemsRenderer={arrayItemsRenderer} renderLeaf={renderLeaf} />
          ))}
        {itemErrors.filter(([path]) => path === `${name}[${index}]`).map(([path, message]) => <p role="alert" key={path}>{message}</p>)}
        <div role="group" aria-label={`Actions for item ${index + 1}`}>
          <button type="button" disabled={immutable || array.fields.length <= minimum} onClick={() => array.remove(index)}>Remove</button>
          <button type="button" disabled={immutable || array.fields.length >= maximum} onClick={() => array.insert(index + 1, cloneValue(item.value))}>Duplicate</button>
          <button type="button" disabled={immutable || index === 0} onClick={() => array.move(index, index - 1)}>Move up</button>
          <button type="button" disabled={immutable || index === array.fields.length - 1} onClick={() => array.move(index, index + 1)}>Move down</button>
        </div>
      </fieldset>
    ),
  }));
  const renderedItems = arrayItemsRenderer ? arrayItemsRenderer({ field, name, items }) : items.map((item) => <div key={item.id}>{item.content}</div>);
  return (
    <fieldset className="df-structural df-array" disabled={disabled} data-df-field={name}>
      <legend>{field.label ?? humanize(field.name)}</legend>
      {field.description ? <p>{field.description}</p> : null}
      <div aria-live="polite">{renderedItems}</div>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="button" disabled={immutable || array.fields.length >= maximum} onClick={() => array.append(createDefaultItem(field, primitive))}>Add item</button>
      {Number.isFinite(maximum) ? <small>{array.fields.length} of {maximum} items</small> : <small>{array.fields.length} items</small>}
    </fieldset>
  );
}

function StructuralNode(props: HtmlStructuralFieldProps) {
  const resolved = { ...props.field, name: props.name };
  return resolved.type === 'object' || resolved.type === 'array'
    ? <HtmlStructuralField {...props} field={resolved} />
    : <>{props.renderLeaf(resolved)}</>;
}

function ConditionalArrayNode({ field, name, itemValue, ...rest }: HtmlStructuralFieldProps & { itemValue: unknown }) {
  const { store } = useFormContext();
  const values = { ...store.getValues(), ...(isRecord(itemValue) ? itemValue : {}) };
  if (field.visibleWhen && !evaluateCondition(field.visibleWhen, values)) return null;
  const resolved: FieldSchema = {
    ...field,
    name,
    disabled: Boolean(field.disabled || (field.disabledWhen && evaluateCondition(field.disabledWhen, values))),
    readOnly: Boolean(field.readOnly || (field.readOnlyWhen && evaluateCondition(field.readOnlyWhen, values))),
    validation: { ...field.validation, required: Boolean(field.validation?.required || (field.requiredWhen && evaluateCondition(field.requiredWhen, values))) },
    visibleWhen: undefined,
    disabledWhen: undefined,
    readOnlyWhen: undefined,
    requiredWhen: undefined,
  };
  return resolved.type === 'object' || resolved.type === 'array'
    ? <HtmlStructuralField {...rest} field={resolved} name={name} />
    : <>{rest.renderLeaf(resolved)}</>;
}

function renderPrimitive(field: FieldSchema, name: string, index: number, renderLeaf: (field: FieldSchema) => ReactNode): ReactNode {
  const item = field.fields?.[0];
  if (!item) return null;
  return renderLeaf({ ...item, name: `${name}[${index}]`, label: item.label ?? `${field.label ?? humanize(field.name)} ${index + 1}` });
}

function isPrimitiveArray(field: FieldSchema): boolean {
  return field.metadata?.primitiveItems === true || (field.fields?.length === 1 && field.fields[0].name === '$value');
}

function createDefaultItem(field: FieldSchema, primitive: boolean): unknown {
  if (primitive) return cloneValue(field.fields?.[0]?.defaultValue ?? '');
  return Object.fromEntries((field.fields ?? []).map((child) => [child.name, cloneValue(child.defaultValue ?? defaultForType(child.type))]));
}

function defaultForType(type: string): unknown {
  if (type === 'array') return [];
  if (type === 'object') return {};
  if (type === 'checkbox' || type === 'switch') return false;
  if (type === 'multi-select' || type === 'checkbox-group') return [];
  return '';
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function humanize(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
