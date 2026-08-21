import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type {
  FieldOption,
} from "@dynamic-forms/core";

export interface MuiMultiSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: FieldOption[];
}

export function MuiMultiSelect({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  options = [],
}: MuiMultiSelectProps) {
  const field = useField<Array<string | number | boolean>>(name);

  const value = field.value ?? [];

  const handleChange = (
    event: SelectChangeEvent<Array<string | number | boolean>>,
  ) => {
    const selectedValues =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;

    const values = selectedValues.map((selectedValue) => {
      const option = options.find(
        (item) => String(item.value) === String(selectedValue),
      );

      return option?.value ?? selectedValue;
    });

    field.setValue(values);
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
        multiple
        value={value.map(String)}
        label={label}
        displayEmpty
        onChange={handleChange}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
        renderValue={(selected) => {
          if (!selected.length) {
            return placeholder ? (
              <em>{placeholder}</em>
            ) : (
              ""
            );
          }

          return selected
            .map((selectedValue) => {
              const option = options.find(
                (item) =>
                  String(item.value) === String(selectedValue),
              );

              return option?.label ?? selectedValue;
            })
            .join(", ");
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
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