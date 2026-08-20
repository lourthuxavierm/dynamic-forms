import {
  FormControl,
  FormHelperText,
  ToggleButton,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type { FieldOption } from "@dynamic-forms/core";

export interface MuiToggleButtonProps {
  name: string;
  option: FieldOption;
  disabled?: boolean;
}

export function MuiToggleButton({
  name,
  option,
  disabled = false,
}: MuiToggleButtonProps) {
  const field = useField<string | number | boolean>(name);

  const selected =
    String(field.value) === String(option.value);

  return (
    <FormControl
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      <ToggleButton
        value={String(option.value)}
        selected={selected}
        disabled={disabled}
        onChange={() => {
          field.setValue(option.value);
        }}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
      >
        {option.label}
      </ToggleButton>

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}