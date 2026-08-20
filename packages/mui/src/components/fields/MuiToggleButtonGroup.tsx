import {
  FormControl,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type { FieldOption } from "@dynamic-forms/core";

export interface MuiToggleButtonGroupProps {
  name: string;
  label?: string;
  options?: FieldOption[];
  multiple?: boolean;
  disabled?: boolean;
}

export function MuiToggleButtonGroup({
  name,
  label,
  options = [],
  multiple = false,
  disabled = false,
}: MuiToggleButtonGroupProps) {
  const field = useField<
    string | number | boolean | Array<string | number | boolean>
  >(name);

  const value = field.value ?? (multiple ? [] : "");

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    selected: string | string[] | null,
  ) => {
    if (selected === null) {
      if (multiple) {
        field.setValue([]);
      }

      return;
    }

    if (multiple) {
      const selectedValues = Array.isArray(selected)
        ? selected
        : [selected];

      const values = selectedValues.map((selectedValue) => {
        const option = options.find(
          (item) =>
            String(item.value) === String(selectedValue),
        );

        return option?.value ?? selectedValue;
      });

      field.setValue(values);

      return;
    }

    const option = options.find(
      (item) =>
        String(item.value) === String(selected),
    );

    field.setValue(
      option?.value ?? selected,
    );
  };

  return (
    <FormControl
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <span>{label}</span>
      )}

      <ToggleButtonGroup
        value={
          multiple
            ? (value as Array<string | number | boolean>).map(String)
            : String(value)
        }
        exclusive={!multiple}
        disabled={disabled}
        onChange={handleChange}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={String(option.value)}
            value={String(option.value)}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}