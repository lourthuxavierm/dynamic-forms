import type { FormEvent } from 'react';
import { Button } from '@mui/material';
import type { FormSchema } from '@dynamic-forms/core';
import { useFormContext } from '@dynamic-forms/react';
import { createDefaultMuiRegistry, type MuiFieldRegistry, type MuiFieldRegistryOverrides } from '../registry';
import { MuiFormRenderer, type MuiLayoutNode } from '../renderer';

export interface MuiFormProps {
  schema: FormSchema;
  /** Additional or replacement controls merged over the standard MUI registry. */
  registry?: MuiFieldRegistryOverrides;
  layout?: readonly MuiLayoutNode[];
  submitLabel?: string;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
}

/** Form element, schema renderer, and default registry integration for MUI forms. */
export function MuiForm({ schema, registry, layout, submitLabel = 'Submit', onSubmit }: MuiFormProps) {
  const { store, validateForm } = useFormContext();
  const fieldRegistry: MuiFieldRegistry = createDefaultMuiRegistry(registry);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!await validateForm()) return;
    await onSubmit?.(store.getState().values);
  };

  return <form noValidate onSubmit={handleSubmit}>
    <MuiFormRenderer schema={schema} registry={fieldRegistry} layout={layout} />
    <Button type="submit" variant="contained">{submitLabel}</Button>
  </form>;
}