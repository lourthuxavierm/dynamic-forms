import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

export interface MuiSwitchProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export function MuiSwitch({
  name,
  label,
  disabled = false,
}: MuiSwitchProps) {
  const field = useField<boolean>(name);

  return (
    <FormControl
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      <FormControlLabel
        control={
          <Switch
            name={field.name}
            checked={field.value ?? false}
            disabled={disabled}
            onChange={(event) => {
              field.setValue(event.target.checked);
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