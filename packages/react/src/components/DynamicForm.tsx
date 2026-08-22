import { type FormEvent, type ReactNode } from 'react';
import type { FieldSchema, FormSchema } from '@dynamic-forms/core';
import { useFormContext } from '../context';
import { useFieldArray } from '../hooks/useFieldArray';
import { DynamicField } from './DynamicField';
import { FormErrorSummary } from './FormErrorSummary';

export interface DynamicFormProps {
  schema?: FormSchema;
  children?: ReactNode;
  submitLabel?: ReactNode;
  errorSummary?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export function DynamicForm({ schema: explicitSchema, children, submitLabel = 'Submit', errorSummary = true, onSubmit }: DynamicFormProps) {
  const { schema: contextSchema, submit } = useFormContext();
  const schema = explicitSchema ?? contextSchema;
  if (!schema) throw new Error('DynamicForm requires a schema prop or a schema in FormProvider');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);
    if (!event.defaultPrevented) await submit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorSummary && <FormErrorSummary />}
      {schema.fields.map((field) => <SchemaField key={field.name} field={field} path={field.name} />)}
      {children}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

function SchemaField({ field, path }: { field: FieldSchema; path: string }) {
  if (field.type === 'object' && field.fields) {
    return <fieldset><legend>{field.label ?? field.name}</legend>{field.fields.map((child) => <SchemaField key={child.name} field={child} path={`${path}.${child.name}`} />)}</fieldset>;
  }
  if (field.type === 'array' && field.fields) return <SchemaArray field={field} path={path} />;
  return <DynamicField field={{ ...field, name: path }} />;
}

function SchemaArray({ field, path }: { field: FieldSchema; path: string }) {
  const array = useFieldArray(path);
  const primitive = field.metadata?.primitiveItems === true || (field.fields?.length === 1 && field.fields[0].name === '$value');
  return (
    <fieldset>
      <legend>{field.label ?? field.name}</legend>
      {array.fields.map((item, index) => <fieldset key={item.id}><legend>Item {index + 1}</legend>{primitive
        ? <DynamicField field={{ ...field.fields![0], name: `${path}[${index}]` }} />
        : field.fields!.map((child) => <SchemaField key={child.name} field={child} path={`${path}[${index}].${child.name}`} />)
      }</fieldset>)}
    </fieldset>
  );
}
