import TextField from "@mui/material/TextField";

import {
  useField
} from "@dynamic-forms/react";

export interface MuiNumberFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiNumberField({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true
}: MuiNumberFieldProps) {
  const field = useField<number | "">(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      label={label}
      placeholder={placeholder}
      type="number"
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      onChange={(event) => {
        const value = event.target.value;

        field.setValue(
          value === "" ? "" : Number(value)
        );
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}