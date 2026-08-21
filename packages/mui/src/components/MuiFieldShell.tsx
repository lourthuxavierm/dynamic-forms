import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { useId, type ReactNode } from 'react';
import { useField } from '@dynamic-forms/react';
import { MuiFieldError } from './MuiFieldError';

export interface MuiFieldShellProps {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  children: (accessibility: MuiFieldAccessibility) => ReactNode;
}

export interface MuiFieldAccessibility {
  id: string;
  descriptionId?: string;
  errorId?: string;
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
}

/** Composable label, description and error treatment for custom MUI controls. */
export function MuiFieldShell({ name, label, description, required = false, disabled = false, children }: MuiFieldShellProps) {
  const field = useField(name);
  const reactId = useId().replace(/:/g, '');
  const id = `dynamic-forms-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}-${reactId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = field.error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FormControl component="fieldset" disabled={disabled} error={Boolean(field.error)} fullWidth margin="normal">
      {label ? <FormLabel component="legend" required={required}>{label}</FormLabel> : null}
      {children({ id, descriptionId, errorId, ariaDescribedBy, ariaInvalid: Boolean(field.error) })}
      {descriptionId ? <FormHelperText id={descriptionId}>{description}</FormHelperText> : null}
      {errorId ? <MuiFieldError id={errorId} message={field.error} /> : null}
    </FormControl>
  );
}