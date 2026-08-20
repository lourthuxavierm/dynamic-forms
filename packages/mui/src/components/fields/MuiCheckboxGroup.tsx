import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type { FieldOption } from "@dynamic-forms/core";

export interface MuiCheckboxGroupProps {
  name: string;
  label?: string;
  disabled?: boolean;
  options?: FieldOption[];
}

export function MuiCheckboxGroup({
  name,
  label,
  disabled = false,
  options = [],
}: MuiCheckboxGroupProps) {
  const field = useField<Array<string | number | boolean>>(name);

  const value = field.value ?? [];

  const isChecked = (option: FieldOption) =>
    value.some(
      (selectedValue) =>
        String(selectedValue) === String(option.value),
    );

  const handleChange = (option: FieldOption) => {
    const checked = isChecked(option);

    if (checked) {
      field.setValue(
        value.filter(
          (selectedValue) =>
            String(selectedValue) !== String(option.value),
        ),
      );

      return;
    }

    field.setValue([
      ...value,
      option.value,
    ]);
  };

  return (
    <FormControl
      component="fieldset"
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <FormLabel component="legend">
          {label}
        </FormLabel>
      )}

      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            control={
              <Checkbox
                checked={isChecked(option)}
                onChange={() => {
                  handleChange(option);
                }}
                onBlur={async () => {
                  field.setTouched(true);
                  await field.validate();
                }}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}