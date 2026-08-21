import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataSourceManager, type DataSourceConfig, type DataSourceResult, type FieldSchema } from '@dynamic-forms/core';
import { useFormContext } from '../context';
import { useWatch } from './useWatch';

export interface UseDataSourceOptions<T> {
  config?: DataSourceConfig<T>;
  enabled?: boolean;
  initialSearch?: string;
  initialPage?: number;
  initialPageSize?: number;
}

export interface UseDataSourceResult<T> extends DataSourceResult<T> {
  search: string;
  page: number;
  pageSize?: number;
  refresh: () => Promise<T[]>;
  cancel: () => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number | undefined) => void;
}

export function useDataSource<T = unknown>(fieldName: string, options: UseDataSourceOptions<T> = {}): UseDataSourceResult<T> {
  const { schema, store } = useFormContext();
  const field = useMemo(() => schema ? findField(schema.fields, fieldName) : undefined, [fieldName, schema]);
  const config = options.config ?? field?.dataSource as DataSourceConfig<T> | undefined;
  const dependsOn = field?.dependsOn ?? [];
  const dependencyValues = useWatch<unknown>(dependsOn);
  const manager = useRef(new DataSourceManager()).current;
  const [search, setSearch] = useState(options.initialSearch ?? '');
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number | undefined>(options.initialPageSize);
  const [state, setState] = useState<DataSourceResult<T>>({ data: [], loading: false });

  const refresh = useCallback(async () => {
    if (!config) return [] as T[];
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const data = await manager.loadConfig(fieldName, config, { values: store.getValues(), field: fieldName }, { search, page, pageSize });
      const next = manager.getState<T>(fieldName) ?? { data, loading: false };
      setState(next);
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState({ data: [], loading: false, error: normalized });
      throw normalized;
    }
  }, [config, fieldName, manager, page, pageSize, search, store]);

  useEffect(() => {
    if (!config || options.enabled === false) return;
    void refresh().catch(() => undefined);
    return () => manager.cancel(fieldName);
  }, [config, dependencyValues, fieldName, manager, options.enabled, page, pageSize, refresh, search]);

  return { ...state, search, page, pageSize, refresh, cancel: () => manager.cancel(fieldName), setSearch, setPage, setPageSize };
}

function findField(fields: readonly FieldSchema[], name: string, parent = ''): FieldSchema | undefined {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    if (path === name) return field;
    const nested = field.fields ? findField(field.fields, name, path) : undefined;
    if (nested) return nested;
  }
  return undefined;
}
