import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiTimeFieldProps {
  name: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiTimeField({
  name,
  label,
  disabled = false,
  fullWidth = true,
}: MuiTimeFieldProps) {
  const field = useField<string>(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      label={label}
      type="time"
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      onChange={(event) => {
        field.setValue(
          event.target.value,
        );
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}