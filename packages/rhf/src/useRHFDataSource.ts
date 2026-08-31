import {
  useDataSource,
  type UseDataSourceOptions,
  type UseDataSourceResult,
} from '@dynamic-form-engine/react';

/** RHF-facing alias for the cancellable Core data-source hook. */
export function useRHFDataSource<T = unknown>(
  fieldName: string,
  options: UseDataSourceOptions<T> = {},
): UseDataSourceResult<T> {
  return useDataSource<T>(fieldName, options);
}

export type { UseDataSourceOptions as UseRHFDataSourceOptions, UseDataSourceResult as UseRHFDataSourceResult };