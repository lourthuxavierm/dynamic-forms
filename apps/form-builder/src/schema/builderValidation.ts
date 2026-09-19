import { circularDependencyIssues } from '../builder/rules/rules';
import { validateSchema, type FormSchema, type SchemaDiagnostic } from '@dynamic-form-engine/core';
export function validateBuilderSchema(schema: FormSchema): SchemaDiagnostic[] {
  const errors: SchemaDiagnostic[] = [
    ...validateSchema(schema).errors.map((error) => ({ ...error, severity: 'error' as const })),
    ...circularDependencyIssues(schema).map((error) => ({ ...error, code: 'DEPENDENCY_CYCLE' as const, severity: 'error' as const })),
  ];
  if (!schema.id.trim()) errors.unshift({ code: 'SCHEMA_INVALID', severity: 'error', path: 'id', message: 'Schema ID is required' });
  return errors;
}
export function parseSchema(text: string): { schema?: FormSchema; errors: SchemaDiagnostic[] } {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || !Array.isArray((value as FormSchema).fields) || typeof (value as FormSchema).id !== 'string') return { errors: [{ code: 'SCHEMA_INVALID', severity: 'error', path: 'schema', message: 'JSON must contain a string id and fields array' }] };
    const schema = value as FormSchema; return { schema, errors: validateBuilderSchema(schema) };
  } catch (error) { return { errors: [{ code: 'SCHEMA_INVALID', severity: 'error', path: 'json', message: error instanceof Error ? error.message : 'Invalid JSON' }] }; }
}
