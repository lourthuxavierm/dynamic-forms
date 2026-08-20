import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  FormControl
} from "@mui/material";

import {
  useField
} from "@dynamic-forms/react";

export interface MuiCheckboxProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export function MuiCheckbox({
  name,
  label,
  disabled = false
}: MuiCheckboxProps) {
  const field = useField<boolean>(name);

  return (
    <FormControl
      error={Boolean(field.error)}
      disabled={disabled}
    >
      <FormControlLabel
        control={
          <Checkbox
            name={field.name}
            checked={Boolean(field.value)}
            onChange={(event) => {
              field.setValue(
                event.target.checked
              );
            }}
            onBlur={async () => {
              field.setTouched(true);
              await field.validate();
            }}
          />
        }
        label={label}
      />

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}