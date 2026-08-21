import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from "@mui/material";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiOtpFieldProps {
  name: string;
  label?: string;
  length?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  autoFocus?: boolean;
}

export function MuiOtpField({
  name,
  label,
  length = 6,
  disabled = false,
  fullWidth = true,
  autoFocus = false,
}: MuiOtpFieldProps) {
  const field = useField<string>(name);

  const [values, setValues] = useState<string[]>(
    () =>
      splitValue(
        field.value ?? "",
        length,
      ),
  );

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  useEffect(() => {
    setValues(
      splitValue(
        field.value ?? "",
        length,
      ),
    );
  }, [field.value, length]);

  const updateValue = (
    nextValues: string[],
  ) => {
    setValues(nextValues);

    field.setValue(
      nextValues.join(""),
    );
  };

  const handleChange = (
    index: number,
    rawValue: string,
  ) => {
    const value = rawValue
      .replace(/\D/g, "")
      .slice(-1);

    const nextValues = [...values];

    nextValues[index] = value;

    updateValue(nextValues);

    if (
      value &&
      index < length - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent,
  ) => {
    if (
      event.key === "Backspace" &&
      !values[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent,
  ) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pastedValue) {
      return;
    }

    const nextValues = splitValue(
      pastedValue,
      length,
    );

    updateValue(nextValues);

    const nextIndex = Math.min(
      pastedValue.length,
      length - 1,
    );

    inputRefs.current[nextIndex]?.focus();
  };

  const handleBlur = async () => {
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

      <Box
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        {values.map((value, index) => (
          <TextField
            key={index}
            value={value}
            disabled={disabled}
            autoFocus={
              autoFocus && index === 0
            }
            error={Boolean(field.error)}
            onChange={(event) => {
              handleChange(
                index,
                event.target.value,
              );
            }}
            onKeyDown={(event) => {
              handleKeyDown(
                index,
                event,
              );
            }}
            onPaste={handlePaste}
            onBlur={handleBlur}
            inputRef={(element) => {
              inputRefs.current[index] =
                element;
            }}
            slotProps={{
              htmlInput: {
                maxLength: 1,
                inputMode: "numeric",
                autoComplete:
                  index === 0
                    ? "one-time-code"
                    : undefined,
                "aria-label": `${label ?? name} digit ${index + 1}`,
              },
            }}
            sx={{
              width: 48,
            }}
          />
        ))}
      </Box>

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}

function splitValue(
  value: string,
  length: number,
): string[] {
  return Array.from(
    { length },
    (_, index) => value[index] ?? "",
  );
}