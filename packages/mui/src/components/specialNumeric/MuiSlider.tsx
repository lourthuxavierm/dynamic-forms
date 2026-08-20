import {
  FormControl,
  FormHelperText,
  FormLabel,
  Slider,
} from "@mui/material";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiSliderProps {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number | null;
  disabled?: boolean;
  fullWidth?: boolean;
  marks?: boolean;
  valueLabelDisplay?: "auto" | "on" | "off";
  orientation?: "horizontal" | "vertical";
}

export function MuiSlider({
  name,
  label,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  fullWidth = true,
  marks = false,
  valueLabelDisplay = "auto",
  orientation = "horizontal",
}: MuiSliderProps) {
  const field = useField<number>(name);

  const value =
    typeof field.value === "number"
      ? field.value
      : min;

  const handleChange = (
    _event: Event,
    newValue: number | number[],
  ) => {
    if (typeof newValue !== "number") {
      return;
    }

    field.setValue(newValue);
  };

  const handleChangeCommitted = async () => {
    field.setTouched(true);
    await field.validate();
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      {label && (
        <FormLabel component="legend">
          {label}
        </FormLabel>
      )}

      <Slider
        name={name}
        value={value}
        min={min}
        max={max}
        step={step}
        marks={marks}
        disabled={disabled}
        orientation={orientation}
        valueLabelDisplay={valueLabelDisplay}
        onChange={handleChange}
        onChangeCommitted={
          handleChangeCommitted
        }
      />

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}