import TextField from "@mui/material/TextField";

import {
  useField
} from "@dynamic-forms/react";

export interface MuiTextFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: string;
}

export function MuiTextField({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  type = "text"
}: MuiTextFieldProps) {
  const field = useField<string>(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      label={label}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      onChange={(event) => {
        field.setValue(event.target.value);
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}
