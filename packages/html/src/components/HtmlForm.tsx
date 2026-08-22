import { useMemo, type FormEvent, type ReactNode } from 'react';
import type { FormSchema } from '@dynamic-forms/core';
import { useFormContext } from '@dynamic-forms/react';
import { createDefaultHtmlRegistry, type HtmlFieldRegistryOverrides } from '../registry';
import { HtmlFieldRenderer } from '../renderer';

export interface HtmlFormProps {
  schema?: FormSchema;
  registry?: HtmlFieldRegistryOverrides;
  submitLabel?: ReactNode;
  onSubmit?: (values: Readonly<Record<string, unknown>>) => void | Promise<void>;
  children?: ReactNode;
  className?: string;
}

export function HtmlForm({ schema: explicitSchema, registry, submitLabel = 'Submit', onSubmit, children, className }: HtmlFormProps) {
  const { schema: providerSchema, store, validateForm } = useFormContext();
  const schema = explicitSchema ?? providerSchema;
  if (!schema) throw new Error('HtmlForm requires a schema prop or a schema supplied to FormProvider.');
  const resolvedRegistry = useMemo(() => createDefaultHtmlRegistry(registry), [registry]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!await validateForm()) return;
    await onSubmit?.(store.getValues());
  };

  return (
    <form noValidate className={className} onSubmit={handleSubmit}>
      {schema.fields.map((field) => <HtmlFieldRenderer key={field.name} field={field} registry={resolvedRegistry} />)}
      {children}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
