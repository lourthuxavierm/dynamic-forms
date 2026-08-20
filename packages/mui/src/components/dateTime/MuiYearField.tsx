import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiYearFieldProps {
  name: string;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: number;
  max?: number;
}

export function MuiYearField({
  name,
  label,
  disabled = false,
  fullWidth = true,
  min = 1900,
  max = 2100,
}: MuiYearFieldProps) {
  const field = useField<string>(name);

  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      label={label}
      type="number"
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        htmlInput: {
          min,
          max,
          step: 1,
          inputMode: "numeric",
        },
      }}
      onChange={(event) => {
        const value = event.target.value;

        if (value === "") {
          field.setValue("");
          return;
        }

        field.setValue(value);
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}