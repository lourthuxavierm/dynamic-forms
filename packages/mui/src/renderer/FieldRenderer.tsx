import type { ComponentType } from "react";

import {
  useFormContext
} from "@dynamic-forms/react";

import type {
  MuiFieldRegistry
} from "../registry";

export interface FieldRendererProps {
  name: string;
  type: string;
  registry?: MuiFieldRegistry;
  [key: string]: unknown;
}

export function FieldRenderer({
  name,
  type,
  registry,
  ...props
}: FieldRendererProps) {
  useFormContext();

  if (!registry) {
    throw new Error(
      "FieldRenderer requires a MuiFieldRegistry."
    );
  }

  const Component = registry[type] as
    | ComponentType<any>
    | undefined;

  if (!Component) {
    throw new Error(
      `No MUI component registered for field type "${type}"`
    );
  }

  return (
    <Component
      name={name}
      {...props}
    />
  );
}
