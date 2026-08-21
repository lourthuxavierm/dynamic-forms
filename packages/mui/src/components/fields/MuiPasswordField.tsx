import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import { useField } from '@dynamic-forms/react';

export interface MuiPasswordFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  autoComplete?: string;
}

/** Password input with an accessible visibility toggle and password-manager friendly autocomplete. */
export function MuiPasswordField({
  name, label, placeholder, disabled = false, fullWidth = true, autoComplete = 'current-password',
}: MuiPasswordFieldProps) {
  const field = useField<string>(name);
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? 'Hide password' : 'Show password';

  return <TextField
    name={field.name}
    value={field.value ?? ''}
    label={label}
    placeholder={placeholder}
    type={visible ? 'text' : 'password'}
    autoComplete={autoComplete}
    disabled={disabled}
    fullWidth={fullWidth}
    error={Boolean(field.error)}
    helperText={field.error ?? ' '}
    onChange={(event) => field.setValue(event.target.value)}
    onBlur={async () => { field.setTouched(true); await field.validate(); }}
    slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={toggleLabel} edge="end" onClick={() => setVisible((current) => !current)}>{visible ? 'visibility_off' : 'visibility'}</IconButton></InputAdornment> } }}
  />;
}