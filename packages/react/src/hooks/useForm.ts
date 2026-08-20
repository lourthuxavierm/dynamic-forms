import { useMemo } from "react";

import {
  FormStore,
  FieldRegistry
} from "@dynamic-forms/core";

export interface UseFormOptions {
  defaultValues?: Record<string, unknown>;
  registry?: FieldRegistry;
}

export function useForm(options: UseFormOptions = {}) {
  const store = useMemo(
    () => new FormStore(options.defaultValues),
    []
  );

  const registry = useMemo(
    () => options.registry ?? new FieldRegistry(),
    [options.registry]
  );

  return {
    store,
    registry
  };
}
