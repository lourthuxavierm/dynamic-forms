import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

import { useField } from "@dynamic-forms/react";

import type { FieldOption } from "@dynamic-forms/core";

export interface MuiAsyncAutocompleteProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;

  options?: FieldOption[];

  loading?: boolean;

  onSearch?: (value: string) => void | Promise<void>;
}

export function MuiAsyncAutocomplete({
  name,
  label,
  placeholder,
  disabled = false,
  fullWidth = true,
  options = [],
  loading = false,
  onSearch,
}: MuiAsyncAutocompleteProps) {
  const field = useField<string | number | boolean>(name);

  const selectedOption =
    options.find(
      (option) =>
        String(option.value) === String(field.value),
    ) ?? null;

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      error={Boolean(field.error)}
      margin="normal"
    >
      <Autocomplete
        options={options}
        value={selectedOption}
        disabled={disabled}
        loading={loading}
        fullWidth={fullWidth}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) =>
          String(option.value) === String(value.value)
        }
        onInputChange={(_, value, reason) => {
          if (reason === "input") {
            void onSearch?.(value);
          }
        }}
        onChange={(_, option) => {
          field.setValue(option?.value);
        }}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={Boolean(field.error)}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress
                        size={20}
                      />
                    ) : null}

                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      <FormHelperText>
        {field.error ?? " "}
      </FormHelperText>
    </FormControl>
  );
}