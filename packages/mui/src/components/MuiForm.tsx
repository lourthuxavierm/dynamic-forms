import type { FormEvent } from "react";

import type {
  FormSchema
} from "@dynamic-forms/core";

import {
  useFormContext
} from "@dynamic-forms/react";

import {
  MuiFieldRenderer
} from "../renderer";

import {
  createDefaultMuiRegistry
} from "../registry";

import type {
  MuiFieldRegistry
} from "../registry";

export interface MuiFormProps {
  schema: FormSchema;
  registry?: MuiFieldRegistry;

  onSubmit?: (
    values: Record<string, unknown>
  ) => void;
}

export function MuiForm({
  schema,
  registry,
  onSubmit
}: MuiFormProps) {
  const {
    store,
    validateField
  } = useFormContext();

  const fieldRegistry =
    registry ?? createDefaultMuiRegistry();

  console.log(
    "MUI REGISTRY:",
    Object.keys(fieldRegistry)
  );

  console.log(
    "URL COMPONENT:",
    fieldRegistry.url
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * Validate every field in the schema.
     */
    const results = await Promise.all(
      schema.fields.map(async (field) => {
        store.setTouched(field.name, true);

        return validateField(field.name);
      })
    );

    /*
     * Stop submission if at least one field is invalid.
     */
    const isValid = results.every(
      (result) => result
    );

    if (!isValid) {
      return;
    }

    /*
     * Only submit valid values.
     */
    const values = store.getState().values;

    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <MuiFieldRenderer
          key={field.name}
          field={field}
          registry={fieldRegistry}
        />
      ))}

      <button type="submit">
        Submit
      </button>
    </form>
  );
}