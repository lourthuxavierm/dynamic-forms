import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { forwardRef, useId, type ForwardedRef, type ReactNode } from 'react';
import { useField } from '@dynamic-forms/react';
import { MuiFieldError } from './MuiFieldError';
import { MuiFieldLoading } from './MuiFieldLoading';

export interface MuiFieldShellProps {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  children: (accessibility: MuiFieldAccessibility) => ReactNode;
}

export interface MuiFieldAccessibility {
  id: string;
  descriptionId?: string;
  errorId?: string;
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
  inputRef: ForwardedRef<HTMLElement>;
}

/** Composable label, loading, description, error, and focus-ref treatment for MUI controls. */
export const MuiFieldShell = forwardRef<HTMLElement, MuiFieldShellProps>(function MuiFieldShell(
  { name, label, description, required = false, disabled = false, loading = false, loadingLabel, children },
  inputRef,
) {
  const field = useField(name);
  const reactId = useId().replace(/:/g, '');
  const id = `dynamic-forms-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}-${reactId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = field.error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FormControl component="fieldset" disabled={disabled || loading} error={Boolean(field.error)} fullWidth margin="normal" aria-busy={loading || undefined}>
      {label ? <FormLabel component="legend" required={required}>{label}</FormLabel> : null}
      {loading
        ? <MuiFieldLoading label={loadingLabel} />
        : children({ id, descriptionId, errorId, ariaDescribedBy, ariaInvalid: Boolean(field.error), inputRef })}
      {descriptionId ? <FormHelperText id={descriptionId}>{description}</FormHelperText> : null}
      {errorId ? <MuiFieldError id={errorId} message={field.error} /> : null}
    </FormControl>
  );
});
