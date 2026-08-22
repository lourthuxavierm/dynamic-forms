import { Box, Button, CircularProgress, FormControl, FormHelperText, InputLabel, ListSubheader, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import type { FieldOption, FieldSchema } from '@dynamic-forms/core';
import { useDataSource, useField } from '@dynamic-forms/react';
import { useMemo, type Ref } from 'react';
import { normalizeFieldOptions } from './optionNormalization';

export interface MuiSelectProps {
  name: string;
  field?: FieldSchema;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  options?: readonly FieldOption[];
  inputRef?: Ref<HTMLElement>;
}

export function MuiSelect({ name, field: schemaField, label, placeholder, disabled = false, readOnly = false, required = false, fullWidth = true, options = [], inputRef }: MuiSelectProps) {
  const field = useField<string | number | boolean | undefined>(name);
  const hasDataSource = Boolean(schemaField?.dataSource);
  const source = useDataSource<unknown>(name, { enabled: hasDataSource && !disabled && !readOnly, debounceMs: 0 });
  const resolvedOptions = useMemo(() => normalizeFieldOptions(hasDataSource ? source.data : options), [hasDataSource, options, source.data]);
  const grouped = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    let previousGroup: string | undefined;
    for (const option of resolvedOptions) {
      if (option.group && option.group !== previousGroup) nodes.push(<ListSubheader key={`group-${option.group}`}>{option.group}</ListSubheader>);
      previousGroup = option.group;
      nodes.push(<MenuItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>{option.label}</MenuItem>);
    }
    return nodes;
  }, [resolvedOptions]);

  const handleChange = (event: SelectChangeEvent<string | number | boolean>) => {
    if (readOnly) return;
    const selected = resolvedOptions.find((option) => String(option.value) === event.target.value);
    field.setValue(selected?.value ?? event.target.value);
  };
  const sourceMessage = source.loading ? 'Loading options…' : source.error ? source.error.message : hasDataSource && resolvedOptions.length === 0 ? 'No options available.' : undefined;

  return (
    <FormControl fullWidth={fullWidth} disabled={disabled} required={required} error={Boolean(field.error || source.error)} margin="normal">
      {label ? <InputLabel>{label}</InputLabel> : null}
      <Select
        name={name}
        value={field.value ?? ''}
        label={label}
        displayEmpty
        inputRef={inputRef}
        inputProps={{ readOnly, 'aria-readonly': readOnly || undefined }}
        endAdornment={source.loading ? <CircularProgress size={18} sx={{ mr: 4 }} aria-label={`Loading ${label ?? name} options`} /> : undefined}
        onChange={handleChange}
        onBlur={async () => {
          field.setTouched(true);
          await field.validate();
        }}
      >
        {placeholder ? <MenuItem value=""><em>{placeholder}</em></MenuItem> : null}
        {grouped}
        {hasDataSource && !source.loading && resolvedOptions.length === 0 ? <MenuItem disabled>No options available</MenuItem> : null}
      </Select>
      <FormHelperText>{field.error ?? sourceMessage ?? ' '}</FormHelperText>
      {source.error ? <Box><Button size="small" onClick={() => void source.refresh()}>Retry</Button></Box> : null}
    </FormControl>
  );
}
