import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiIntegerFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiIntegerField({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
}: MuiIntegerFieldProps) {
  const field = useField<number | undefined>(name);

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
          step: 1,
        },
      }}
      onChange={(event) => {
        const value = event.target.value;

        if (value === "") {
          field.setValue(undefined);
          return;
        }

        const parsed = Number(value);

        if (Number.isInteger(parsed)) {
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