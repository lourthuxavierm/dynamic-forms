import {
  useEffect,
  useState,
} from "react";

import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiMaskFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  mask: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiMaskField({
  name,
  label,
  placeholder,
  mask,
  disabled = false,
  fullWidth = true,
}: MuiMaskFieldProps) {
  const field = useField<string>(name);

  const [displayValue, setDisplayValue] =
    useState("");

  useEffect(() => {
    setDisplayValue(
      applyMask(
        field.value ?? "",
        mask,
      ),
    );
  }, [field.value, mask]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;

    const value = extractValue(
      rawValue,
      mask,
    );

    field.setValue(value);

    setDisplayValue(
      applyMask(value, mask),
    );
  };

  const handleBlur = async () => {
    field.setTouched(true);
    await field.validate();
  };

  return (
    <TextField
      name={field.name}
      value={displayValue}
      label={label}
      placeholder={
        placeholder ?? mask
      }
      disabled={disabled}
      fullWidth={fullWidth}
      error={Boolean(field.error)}
      helperText={field.error ?? " "}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

/**
 * Mask syntax:
 *
 * 0 = digit
 * A = letter
 * * = letter or digit
 * everything else = literal character
 */
function applyMask(
  value: string,
  mask: string,
): string {
  const characters = value.split("");
  let valueIndex = 0;

  let result = "";

  for (
    let maskIndex = 0;
    maskIndex < mask.length;
    maskIndex++
  ) {
    const maskCharacter =
      mask[maskIndex];

    if (
      maskCharacter === "0" ||
      maskCharacter === "A" ||
      maskCharacter === "*"
    ) {
      while (
        valueIndex < characters.length
      ) {
        const character =
          characters[valueIndex++];

        if (
          isValidCharacter(
            character,
            maskCharacter,
          )
        ) {
          result += character;
          break;
        }
      }

      continue;
    }

    result += maskCharacter;
  }

  return result;
}

function extractValue(
  input: string,
  mask: string,
): string {
  const inputCharacters =
    input.split("");

  let inputIndex = 0;
  let result = "";

  for (
    let maskIndex = 0;
    maskIndex < mask.length;
    maskIndex++
  ) {
    const maskCharacter =
      mask[maskIndex];

    if (
      maskCharacter !== "0" &&
      maskCharacter !== "A" &&
      maskCharacter !== "*"
    ) {
      if (
        inputCharacters[inputIndex] ===
        maskCharacter
      ) {
        inputIndex++;
      }

      continue;
    }

    while (
      inputIndex <
      inputCharacters.length
    ) {
      const character =
        inputCharacters[inputIndex++];

      if (
        isValidCharacter(
          character,
          maskCharacter,
        )
      ) {
        result += character;
        break;
      }
    }
  }

  return result;
}

function isValidCharacter(
  character: string,
  maskCharacter: string,
): boolean {
  if (maskCharacter === "0") {
    return /\d/.test(character);
  }

  if (maskCharacter === "A") {
    return /[A-Za-z]/.test(character);
  }

  if (maskCharacter === "*") {
    return /[A-Za-z0-9]/.test(character);
  }

  return false;
}