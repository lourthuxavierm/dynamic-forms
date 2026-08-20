import TextField from "@mui/material/TextField";

import {
  useField
} from "@dynamic-forms/react";

export interface MuiTextareaProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiTextarea({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true
}: MuiTextareaProps) {
  const field = useField<string>(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      multiline
      minRows={4}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      onChange={(event) => {
        field.setValue(
          event.target.value
        );
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}