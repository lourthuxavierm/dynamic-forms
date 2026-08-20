import {
  useSyncExternalStore
} from "react";

import type {
  FormStore,
  FormState
} from "@dynamic-forms/core";

export function useFormStore(
  store: FormStore
): FormState {
  return useSyncExternalStore(
    (listener) => store.subscribe(() => listener()),
    () => store.getState(),
    () => store.getState()
  );
}
