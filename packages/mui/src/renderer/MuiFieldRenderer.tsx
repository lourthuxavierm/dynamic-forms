import type { FieldSchema } from '@dynamic-forms/core';
import { MuiFieldErrorBoundary } from '../components/MuiFieldErrorBoundary';
import { warnInMuiDevelopment } from '../development';
import type { MuiFieldRegistry } from '../registry';

export interface MuiFieldRendererProps {
  field: FieldSchema;
  registry: MuiFieldRegistry;
}

/** Renders one Core field through the MUI registry. */
export function MuiFieldRenderer({ field, registry }: MuiFieldRendererProps) {
  const Component = registry[field.type];
  if (!Component) {
    const knownTypes = Object.keys(registry).sort();
    throw new Error(`No MUI component registered for field type "${field.type}". Registered types: ${knownTypes.join(', ') || 'none'}.`);
  }
  if (field.type === 'object' || field.type === 'array') {
    warnInMuiDevelopment(`Field "${field.name}" uses structural type "${field.type}" before a structural renderer is registered.`);
  }

  return (
    <MuiFieldErrorBoundary fieldName={field.name}>
      <Component
        field={field}
        name={field.name}
        label={field.label}
        description={field.description}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readOnly}
        required={field.validation?.required}
        validation={field.validation}
        fullWidth
        options={field.options}
      />
    </MuiFieldErrorBoundary>
  );
}