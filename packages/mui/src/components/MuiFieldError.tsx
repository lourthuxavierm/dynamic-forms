import { FormHelperText } from '@mui/material';

export interface MuiFieldErrorProps {
  id: string;
  message?: string;
}

/** Accessible field error message with a stable relationship to its input. */
export function MuiFieldError({ id, message }: MuiFieldErrorProps) {
  if (!message) return null;
  return <FormHelperText id={id} role="alert" aria-live="polite">{message}</FormHelperText>;
}