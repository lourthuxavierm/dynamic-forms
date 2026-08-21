import {
  useEffect,
  useState,
} from "react";

import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiCurrencyFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  currency?: string;
  locale?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiCurrencyField({
  name,
  label,
  placeholder,
  currency = "USD",
  locale = "en-US",
  disabled = false,
  fullWidth = true,
}: MuiCurrencyFieldProps) {
  const field = useField<number | undefined>(name);

  const [inputValue, setInputValue] =
    useState("");

  const formatCurrency = (
    value: number,
  ) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  };

  useEffect(() => {
    if (
      field.value === undefined ||
      field.value === null
    ) {
      setInputValue("");
      return;
    }

    setInputValue(
      formatCurrency(field.value),
    );
  }, [
    field.value,
    currency,
    locale,
  ]);

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

    if (Number.isFinite(parsedValue)) {
      field.setValue(parsedValue);
    }
  };

  const handleBlur = async () => {
    if (
      field.value !== undefined &&
      field.value !== null
    ) {
      setInputValue(
        formatCurrency(field.value),
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
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}