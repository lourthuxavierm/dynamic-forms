import { type FormEvent, type ReactNode } from 'react';
import type { FieldSchema, FormSchema } from '@dynamic-forms/core';
import { useFormContext } from '../context';
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
      {schema.fields.map((field) => <SchemaField key={field.name} field={field} />)}
      {children}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

function SchemaField({ field }: { field: FieldSchema }) {
  if ((field.type === 'object' || field.type === 'array') && field.fields) {
    return <>{field.fields.map((child) => <SchemaField key={child.name} field={{ ...child, name: `${field.name}.${child.name}` }} />)}</>;
  }
  return <DynamicField field={field} />;
}
