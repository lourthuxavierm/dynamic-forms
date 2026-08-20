import type { ReactNode } from "react";

import {
  useFormContext
} from "../context";

export interface DynamicFieldProps {
  name: string;
  type: string;
  render?: (
    props: {
      name: string;
      value: unknown;
      setValue: (value: unknown) => void;
      error?: string;
    }
  ) => ReactNode;
}

export function DynamicField({
  name,
  type,
  render
}: DynamicFieldProps) {
  const { registry, store } = useFormContext();

  const definition = registry.get(type);

  if (!definition && !render) {
    throw new Error(
      `Field type "${type}" is not registered`
    );
  }

  if (!render) {
    return null;
  }

  return (
    <>
      {render({
        name,
        value: store.getValue(name),
        setValue: (value) =>
          store.setValue(name, value),
        error: store.getState().errors[name]
      })}
    </>
  );
}
