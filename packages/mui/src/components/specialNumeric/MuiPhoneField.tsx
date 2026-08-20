import {
  useEffect,
  useState,
} from "react";

import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiPhoneFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultCountryCode?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiPhoneField({
  name,
  label,
  placeholder,
  defaultCountryCode = "+1",
  disabled = false,
  fullWidth = true,
}: MuiPhoneFieldProps) {
  const field = useField<string>(name);

  const [inputValue, setInputValue] =
    useState(field.value ?? "");

  useEffect(() => {
    setInputValue(field.value ?? "");
  }, [field.value]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    // Keep digits and a leading +
    const sanitized = value
      .replace(/[^\d+]/g, "")
      .replace(
        /^(?!\+).*/,
        (match) => match,
      );

    setInputValue(sanitized);
    field.setValue(sanitized);
  };

  const handleBlur = async () => {
    field.setTouched(true);
    await field.validate();
  };

  const handleCountryPrefix = () => {
    if (!inputValue) {
      setInputValue(defaultCountryCode);
      field.setValue(defaultCountryCode);
    }
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
      type="tel"
      slotProps={{
        htmlInput: {
          inputMode: "tel",
          autoComplete: "tel",
        },
      }}
      onFocus={handleCountryPrefix}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}