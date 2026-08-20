import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type {
  FieldOption,
} from "@dynamic-forms/core";

export interface MuiAutocompleteProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: FieldOption[];
}

export function MuiAutocomplete({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  options = [],
}: MuiAutocompleteProps) {
  const field = useField<string | number | boolean>(name);

  const selectedOption =
    options.find(
      (option) =>
        String(option.value) === String(field.value),
    ) ?? null;

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      <Autocomplete
        options={options}
        value={selectedOption}
        disabled={disabled}
        fullWidth={fullWidth}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) =>
          String(option.value) === String(value.value)
        }
        onChange={(_, option) => {
          field.setValue(option?.value);
        }}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={Boolean(field.error)}
          />
        )}
      />

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}