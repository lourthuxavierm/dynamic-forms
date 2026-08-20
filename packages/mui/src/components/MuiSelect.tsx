import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent
} from "@mui/material";

import {
  useField
} from "@dynamic-forms/react";

import type {
  FieldOption
} from "@dynamic-forms/core";

export interface MuiSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: FieldOption[];
}

export function MuiSelect({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  options = []
}: MuiSelectProps) {
  const field = useField<string | number | boolean>(name);

  const handleChange = (
    event: SelectChangeEvent<string | number | boolean>
  ) => {
    const selected = options.find(
      (option) => String(option.value) === event.target.value
    );

    field.setValue(
      selected?.value ?? event.target.value
    );
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <InputLabel>{label}</InputLabel>
      )}

      <Select
        name={name}
        value={field.value ?? ""}
        label={label}
        displayEmpty
        onChange={handleChange}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
      >
        {placeholder && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}

        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={String(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}