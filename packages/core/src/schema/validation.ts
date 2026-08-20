import type { FormSchema, FieldSchema } from './types';

export interface SchemaValidationError {
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

/**
 * Validates the structural integrity of a form schema.
 */
export function validateSchema(schema: FormSchema): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const names = new Set<string>();

  function validateFields(fields: FieldSchema[], path = ''): void {
    for (const field of fields) {
      const fieldPath = path ? `${path}.${field.name}` : field.name;

      // Check for unique names at the same level (or globally if we want to enforce it)
      // Actually, names only need to be unique within their parent object/array.
      // But for simplicity in many form libraries, global uniqueness is sometimes preferred.
      // The Stability Checklist says "Unique field names". Let's enforce uniqueness per level.
      
      if (names.has(fieldPath)) {
        errors.push({
          path: fieldPath,
          message: `Duplicate field name: ${field.name}`,
        });
      }
      names.add(fieldPath);

      if (field.fields) {
        validateFields(field.fields, fieldPath);
      }
    }
  }

  validateFields(schema.fields);

  return {
    valid: errors.length === 0,
    errors,
  };
}
