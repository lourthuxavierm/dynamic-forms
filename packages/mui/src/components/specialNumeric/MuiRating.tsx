import {
  FormControl,
  FormHelperText,
  FormLabel,
  Rating,
} from "@mui/material";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiRatingProps {
  name: string;
  label?: string;
  max?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
}

export function MuiRating({
  name,
  label,
  max = 5,
  precision = 1,
  disabled = false,
  readOnly = false,
  size = "medium",
}: MuiRatingProps) {
  const field = useField<number>(name);

  const value =
    typeof field.value === "number"
      ? field.value
      : null;

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: number | null,
  ) => {
    if (newValue === null) {
      field.setValue(undefined);
      return;
    }

    field.setValue(newValue);
  };

  const handleBlur = async () => {
    field.setTouched(true);
    await field.validate();
  };

  return (
    <FormControl
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <FormLabel component="legend">
          {label}
        </FormLabel>
      )}

      <Rating
        name={name}
        value={value}
        max={max}
        precision={precision}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}