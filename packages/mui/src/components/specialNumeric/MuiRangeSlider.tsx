import {
  FormControl,
  FormHelperText,
  FormLabel,
  Slider,
} from "@mui/material";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiRangeSliderProps {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  marks?: boolean;
  valueLabelDisplay?: "auto" | "on" | "off";
  orientation?: "horizontal" | "vertical";
}

export function MuiRangeSlider({
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
}: MuiRangeSliderProps) {
  const field = useField<[number, number]>(name);

  const value: [number, number] =
    Array.isArray(field.value) &&
      field.value.length === 2
      ? field.value
      : [min, max];

  const handleChange = (
    _event: Event,
    newValue: number | number[],
  ) => {
    if (
      !Array.isArray(newValue) ||
      newValue.length !== 2
    ) {
      return;
    }

    field.setValue([
      newValue[0],
      newValue[1],
    ]);
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