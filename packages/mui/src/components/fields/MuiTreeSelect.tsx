import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type { FieldOption } from "@dynamic-forms/core";

export interface MuiTreeOption extends FieldOption {
  children?: MuiTreeOption[];
}

export interface MuiTreeSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: MuiTreeOption[];
}

export function MuiTreeSelect({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  options = [],
}: MuiTreeSelectProps) {
  const field = useField<string | number | boolean>(name);

  const flattenOptions = (
    items: MuiTreeOption[],
  ): MuiTreeOption[] => {
    return items.flatMap((item) => [
      item,
      ...(item.children
        ? flattenOptions(item.children)
        : []),
    ]);
  };

  const flatOptions = flattenOptions(options);

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <FormLabel>
          {label}
        </FormLabel>
      )}

      <Select
        name={name}
        value={field.value ?? ""}
        displayEmpty
        disabled={disabled}
        onChange={(event) => {
          const selected = flatOptions.find(
            (option) =>
              String(option.value) ===
              event.target.value,
          );

          field.setValue(
            selected?.value ?? event.target.value,
          );
        }}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
        renderValue={(value) => {
          if (!value) {
            return placeholder ? (
              <em>{placeholder}</em>
            ) : (
              ""
            );
          }

          const selected = flatOptions.find(
            (option) =>
              String(option.value) ===
              String(value),
          );

          return selected?.label ?? String(value);
        }}
      >
        {flatOptions.map((option) => (
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