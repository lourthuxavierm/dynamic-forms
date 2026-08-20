import {
  useEffect,
  useState,
} from "react";

import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiPercentageFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiPercentageField({
  name,
  label,
  placeholder,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  fullWidth = true,
}: MuiPercentageFieldProps) {
  const field = useField<number>(name);

  const [inputValue, setInputValue] =
    useState("");

  useEffect(() => {
    if (
      field.value === undefined ||
      field.value === null
    ) {
      setInputValue("");
      return;
    }

    setInputValue(
      `${field.value}%`,
    );
  }, [field.value]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue =
      event.target.value;

    const numericValue =
      rawValue.replace(/[^0-9.-]/g, "");

    setInputValue(numericValue);

    if (numericValue === "") {
      field.setValue(undefined);
      return;
    }

    const parsedValue =
      Number(numericValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    field.setValue(
      Math.min(
        max,
        Math.max(min, parsedValue),
      ),
    );
  };

  const handleBlur = async () => {
    if (
      field.value !== undefined &&
      field.value !== null
    ) {
      setInputValue(
        `${field.value}%`,
      );
    }

    field.setTouched(true);
    await field.validate();
  };

  return (
    <TextField
      name={field.name}
      value={inputValue}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      slotProps={{
        htmlInput: {
          min,
          max,
          step,
          inputMode: "decimal",
        },
      }}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}