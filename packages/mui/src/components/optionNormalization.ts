import type { FieldOption } from '@dynamic-forms/core';

export function normalizeFieldOptions(values: readonly unknown[] | undefined): FieldOption[] {
  if (!values) return [];
  return values.flatMap((value): FieldOption[] => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return [{ label: String(value), value }];
    }
    if (!value || typeof value !== 'object') return [];
    const candidate = value as Record<string, unknown>;
    const optionValue = candidate.value;
    if (typeof optionValue !== 'string' && typeof optionValue !== 'number' && typeof optionValue !== 'boolean') return [];
    return [{
      label: typeof candidate.label === 'string' ? candidate.label : String(optionValue),
      value: optionValue,
      disabled: Boolean(candidate.disabled),
      group: typeof candidate.group === 'string' ? candidate.group : undefined,
      children: Array.isArray(candidate.children) ? normalizeFieldOptions(candidate.children) : undefined,
    }];
  });
}

export function flattenFieldOptions(options: readonly FieldOption[]): FieldOption[] {
  return options.flatMap((option) => option.children?.length ? [option, ...flattenFieldOptions(option.children)] : [option]);
}
