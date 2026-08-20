import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiDecimalFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiDecimalField({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
}: MuiDecimalFieldProps) {
  const field = useField<number>(name);

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
      slotProps={{
        htmlInput: {
          step: "any",
        },
      }}
      onChange={(event) => {
        const value = event.target.value;

        if (value === "") {
          field.setValue(0);
          return;
        }

        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
          field.setValue(parsed);
        }
      }}
      onBlur={async () => {
        field.setTouched(true);
        await field.validate();
      }}
    />
  );
}