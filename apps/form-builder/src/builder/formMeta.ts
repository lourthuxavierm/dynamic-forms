import type { FormSchema } from '@dynamic-form-engine/core';

interface FormMeta { title?: string; description?: string }
type MetaSchema = FormSchema & { builder?: FormMeta & Record<string, unknown> };

export function humanizeId(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()) || 'Untitled form';
}

export const formTitle = (schema: FormSchema) => (schema as MetaSchema).builder?.title || humanizeId(schema.id);
export const formDescription = (schema: FormSchema) => (schema as MetaSchema).builder?.description ?? '';

export function setFormMeta(schema: FormSchema, patch: FormMeta): FormSchema {
  const current = schema as MetaSchema;
  return { ...current, builder: { ...current.builder, ...patch } } as FormSchema;
}
