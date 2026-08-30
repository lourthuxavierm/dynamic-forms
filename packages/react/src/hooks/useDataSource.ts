import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataSourceManager, type DataSourceConfig, type DataSourceResult, type FieldSchema } from '@lourthuxavierm/dynamic-forms-core';
import { useFormContext } from '../context';
import { useWatch } from './useWatch';

export interface UseDataSourceOptions<T> {
  config?: DataSourceConfig<T>;
  enabled?: boolean;
  initialSearch?: string;
  initialPage?: number;
  initialPageSize?: number;
  debounceMs?: number;
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
  const dependencyKey = JSON.stringify(dependencyValues);
  const manager = useRef(new DataSourceManager()).current;
  const run = useRef(0);
  const [search, setSearchState] = useState(options.initialSearch ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number | undefined>(options.initialPageSize);
  const [state, setState] = useState<DataSourceResult<T>>({ data: [], loading: false });
  const debounceMs = options.debounceMs ?? 250;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [debounceMs, search]);

  const refresh = useCallback(async () => {
    if (!config || options.enabled === false) return [] as T[];
    const currentRun = ++run.current;
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const data = await manager.loadConfig(fieldName, config, { values: store.getValues(), field: fieldName }, { search: debouncedSearch, page, pageSize });
      if (run.current === currentRun) {
        const next = manager.getState<T>(fieldName);
        setState(next?.error ? { data: [], loading: false, error: next.error } : { data, loading: false });
      }
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      if (run.current === currentRun && normalized.name !== 'AbortError') {
        setState((current) => ({ data: current.data, loading: false, error: normalized }));
      }
      return [] as T[];
    }
  }, [config, debouncedSearch, fieldName, manager, options.enabled, page, pageSize, store]);

  useEffect(() => {
    if (!config || options.enabled === false) {
      run.current += 1;
      manager.cancel(fieldName);
      setState((current) => ({ ...current, loading: false }));
      return;
    }
    void refresh();
    return () => {
      run.current += 1;
      manager.cancel(fieldName);
    };
  }, [config, dependencyKey, fieldName, manager, options.enabled, page, pageSize, refresh]);

  const cancel = useCallback(() => {
    run.current += 1;
    manager.cancel(fieldName);
    setState((current) => ({ ...current, loading: false }));
  }, [fieldName, manager]);
  const setSearch = useCallback((next: string) => {
    setPage(1);
    setSearchState(next);
  }, []);

  return { ...state, search, page, pageSize, refresh, cancel, setSearch, setPage, setPageSize };
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
