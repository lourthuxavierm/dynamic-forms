import { validateSchema, type FormSchema, type SchemaValidationError } from '@dynamic-form-engine/core';
export function validateBuilderSchema(schema: FormSchema): SchemaValidationError[] {
  const errors = [...validateSchema(schema).errors];
  if (!schema.id.trim()) errors.unshift({ path: 'id', message: 'Schema ID is required' });
  return errors;
}
export function parseSchema(text: string): { schema?: FormSchema; errors: SchemaValidationError[] } {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || !Array.isArray((value as FormSchema).fields) || typeof (value as FormSchema).id !== 'string') return { errors: [{ path: 'schema', message: 'JSON must contain a string id and fields array' }] };
    const schema = value as FormSchema; return { schema, errors: validateBuilderSchema(schema) };
  } catch (error) { return { errors: [{ path: 'json', message: error instanceof Error ? error.message : 'Invalid JSON' }] }; }
}
