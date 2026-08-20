import type { FormField } from "@dynamic-forms/core";

import type {
  MuiFieldRegistry
} from "../registry";

export interface MuiFieldRendererProps {
  field: FormField;
  registry: MuiFieldRegistry;
}
export function MuiFieldRenderer({
  field,
  registry,
}: MuiFieldRendererProps) {
  console.log(
    "Field type:",
    field.type,
  );

  console.log(
    "Registered types:",
    Object.keys(registry),
  );

  const Component = registry[field.type];

  if (!Component) {
    throw new Error(
      `No MUI component registered for field type "${field.type}"`
    );
  }

  return (
    <Component
      name={field.name}
      label={field.label}
      placeholder={field.placeholder}
      disabled={field.disabled}
      fullWidth
      options={field.options}
    />
  );
}