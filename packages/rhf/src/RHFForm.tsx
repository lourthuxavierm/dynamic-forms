import {
  type ComponentType,
  type FormEventHandler,
  type ReactNode,
} from 'react';
import type { FieldSchema, FormSchema } from '@dynamic-form-engine/core';
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldArrayPath,
  FieldPath,
  FieldValues,
  UseFieldArrayReturn,
  UseFormStateReturn,
} from 'react-hook-form';
import { RHFField, type RHFDynamicFieldState } from './RHFField';
import { useDynamicFormRHF } from './provider';
import { useRHFFieldArray } from './useRHFFieldArray';
import { warnRHF } from './development';

export type TypedRHFFormSchema<TFieldValues extends FieldValues> = FormSchema & {
  /** Type-only marker used to infer RHF values; it is never read at runtime. */
  readonly __rhfValues?: TFieldValues;
};

export type InferRHFValues<TSchema> =
  TSchema extends TypedRHFFormSchema<infer TFieldValues> ? TFieldValues : never;

/** Adds a value-type marker to a schema without changing its runtime shape. */
export function defineRHFSchema<TFieldValues extends FieldValues>(
  schema: FormSchema,
): TypedRHFFormSchema<TFieldValues> {
  return schema;
}

export interface RHFControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  schemaField: FieldSchema;
  name: TName;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
  dynamicState: RHFDynamicFieldState;
}

export type RHFControlComponent<TFieldValues extends FieldValues = FieldValues> =
  ComponentType<RHFControlProps<TFieldValues, FieldPath<TFieldValues>>>;

export type RHFControlRegistry<TFieldValues extends FieldValues = FieldValues> =
  Readonly<Record<string, RHFControlComponent<TFieldValues> | undefined>>;

export interface RHFArrayActionsProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldArrayPath<TFieldValues>;
  array: UseFieldArrayReturn<TFieldValues, FieldArrayPath<TFieldValues>>;
}

export interface RHFFormProps<TFieldValues extends FieldValues = FieldValues> {
  schema?: TypedRHFFormSchema<TFieldValues> | FormSchema;
  registry: RHFControlRegistry<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  onInvalid?: Parameters<ReturnType<typeof useDynamicFormRHF<TFieldValues>>['methods']['handleSubmit']>[1];
  children?: ReactNode;
  submitLabel?: ReactNode;
  noValidate?: boolean;
  className?: string;
  onNativeSubmit?: FormEventHandler<HTMLFormElement>;
  renderArrayActions?: (props: RHFArrayActionsProps<TFieldValues>) => ReactNode;
}

/** Renders a complete schema through renderer-neutral RHF control components. */
export function RHFForm<TFieldValues extends FieldValues = FieldValues>({
  schema: explicitSchema,
  registry,
  onSubmit,
  onInvalid,
  children,
  submitLabel = 'Submit',
  noValidate = true,
  className,
  onNativeSubmit,
  renderArrayActions,
}: RHFFormProps<TFieldValues>) {
  const context = useDynamicFormRHF<TFieldValues>();
  const schema = explicitSchema ?? context.schema;
  if (!schema) {
    warnRHF('RHFForm requires a schema prop or a schema on DynamicFormRHFProvider.');
    throw new Error('RHFForm requires a schema');
  }
  const submit = context.methods.handleSubmit(onSubmit, onInvalid);
  return <form
    className={className}
    noValidate={noValidate}
    onSubmit={(event) => {
      onNativeSubmit?.(event);
      if (!event.defaultPrevented) void submit(event);
    }}
  >
    {schema.fields.map((field) => (
      <RHFSchemaNode<TFieldValues>
        key={field.name}
        field={field}
        path={field.name}
        registry={registry}
        renderArrayActions={renderArrayActions}
      />
    ))}
    {children}
    <button type="submit">{submitLabel}</button>
  </form>;
}

interface SchemaNodeProps<TFieldValues extends FieldValues> {
  field: FieldSchema;
  path: string;
  registry: RHFControlRegistry<TFieldValues>;
  renderArrayActions?: (props: RHFArrayActionsProps<TFieldValues>) => ReactNode;
}

function RHFSchemaNode<TFieldValues extends FieldValues>({
  field,
  path,
  registry,
  renderArrayActions,
}: SchemaNodeProps<TFieldValues>) {
  if (field.type === 'object' && field.fields) {
    return <fieldset>
      <legend>{field.label ?? field.name}</legend>
      {field.fields.map((child) => (
        <RHFSchemaNode
          key={child.name}
          field={child}
          path={path + '.' + child.name}
          registry={registry}
          renderArrayActions={renderArrayActions}
        />
      ))}
    </fieldset>;
  }
  if (field.type === 'array' && field.fields) {
    return <RHFSchemaArray
      field={field}
      path={path}
      registry={registry}
      renderArrayActions={renderArrayActions}
    />;
  }
  const schemaField = { ...field, name: path };
  const Control = registry[field.type];
  if (!Control) {
    const known = Object.keys(registry).filter((type) => registry[type]).sort();
    const message = 'No RHF control registered for field type "' + field.type
      + '" used by field "' + path + '". Registered types: '
      + (known.join(', ') || 'none') + '.';
    warnRHF(message);
    throw new Error(message);
  }
  const name = path as FieldPath<TFieldValues>;
  return <RHFField<TFieldValues>
    name={name}
    render={({ field: controllerField, fieldState, formState, dynamicState }) => (
      <Control
        schemaField={schemaField}
        name={name}
        field={controllerField}
        fieldState={fieldState}
        formState={formState}
        dynamicState={dynamicState}
      />
    )}
  />;
}

function RHFSchemaArray<TFieldValues extends FieldValues>({
  field,
  path,
  registry,
  renderArrayActions,
}: SchemaNodeProps<TFieldValues>) {
  const name = path as FieldArrayPath<TFieldValues>;
  const array = useRHFFieldArray<TFieldValues, FieldArrayPath<TFieldValues>>({ name });
  const primitive = field.metadata?.primitiveItems === true
    || (field.fields?.length === 1 && field.fields[0].name === '$value');
  return <fieldset>
    <legend>{field.label ?? field.name}</legend>
    {renderArrayActions?.({ name, array })}
    {array.fields.map((item, index) => (
      <fieldset key={item.id}>
        <legend>Item {index + 1}</legend>
        {primitive
          ? <RHFSchemaNode
              field={field.fields![0]}
              path={path + '.' + index}
              registry={registry}
              renderArrayActions={renderArrayActions}
            />
          : field.fields!.map((child) => (
              <RHFSchemaNode
                key={child.name}
                field={child}
                path={path + '.' + index + '.' + child.name}
                registry={registry}
                renderArrayActions={renderArrayActions}
              />
            ))}
      </fieldset>
    ))}
  </fieldset>;
}
