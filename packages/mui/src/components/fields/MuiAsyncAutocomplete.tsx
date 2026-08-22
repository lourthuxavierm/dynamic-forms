import { Autocomplete, Box, Button, CircularProgress, FormControl, FormHelperText, TextField } from '@mui/material';
import type { FieldOption, FieldSchema } from '@dynamic-forms/core';
import { useDataSource, useField } from '@dynamic-forms/react';
import { useMemo, type Ref } from 'react';
import { normalizeFieldOptions } from '../optionNormalization';

export interface MuiAsyncAutocompleteProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  options?: readonly FieldOption[];
  loading?: boolean;
  debounceMs?: number;
  inputRef?: Ref<HTMLElement>;
  onSearch?: (value: string) => void | Promise<void>;
}

export function MuiAsyncAutocomplete({
  name,
  field: schemaField,
  label,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  options = [],
  loading = false,
  debounceMs = 250,
  inputRef,
  onSearch,
}: MuiAsyncAutocompleteProps) {
  const field = useField<string | number | boolean | undefined>(name);
  const hasDataSource = Boolean(schemaField?.dataSource);
  const source = useDataSource<unknown>(name, { enabled: hasDataSource && !disabled && !readOnly, debounceMs });
  const resolvedOptions = useMemo(() => normalizeFieldOptions(hasDataSource ? source.data : options), [hasDataSource, options, source.data]);
  const hasGroups = resolvedOptions.some((option) => Boolean(option.group));
  const selectedOption = resolvedOptions.find((option) => String(option.value) === String(field.value))
    ?? (field.value === undefined ? null : { label: String(field.value), value: field.value });
  const isLoading = loading || source.loading;

  return (
    <FormControl fullWidth={fullWidth} disabled={disabled} required={required} error={Boolean(field.error || source.error)} margin="normal">
      <Autocomplete
        options={resolvedOptions}
        value={selectedOption}
        disabled={disabled}
        readOnly={readOnly}
        loading={isLoading}
        fullWidth={fullWidth}
        noOptionsText={source.error ? 'Unable to load options' : 'No options available'}
        groupBy={hasGroups ? (option) => option.group ?? 'Other' : undefined}
        getOptionLabel={(option) => option.label}
        getOptionDisabled={(option) => Boolean(option.disabled)}
        isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
        onInputChange={(_, value, reason) => {
          if (reason === 'input') {
            source.setSearch(value);
            void onSearch?.(value);
          }
        }}
        onChange={(_, option) => field.setValue(option?.value)}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            label={label}
            placeholder={placeholder}
            required={required}
            error={Boolean(field.error || source.error)}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: <>{isLoading ? <CircularProgress size={20} aria-label={`Loading ${label ?? name} options`} /> : null}{params.InputProps.endAdornment}</>,
              },
            }}
          />
        )}
      />
      <FormHelperText>{field.error ?? source.error?.message ?? ' '}</FormHelperText>
      {source.error ? <Box><Button size="small" onClick={() => void source.refresh()}>Retry</Button></Box> : null}
    </FormControl>
  );
}
