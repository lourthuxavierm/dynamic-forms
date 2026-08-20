import {
  createContext,
  useContext,
  type ReactNode
} from "react";

import {
  FormStore,
  FieldRegistry,
  createFieldValidators,
  validateField,
  type FormSchema
} from "@dynamic-forms/core";

export interface FormContextValue {
  store: FormStore;
  registry: FieldRegistry;
  schema?: FormSchema;

  validateField: (
    name: string
  ) => Promise<boolean>;
}

const FormContext =
  createContext<FormContextValue | null>(null);

export interface FormProviderProps {
  store: FormStore;
  registry: FieldRegistry;
  schema?: FormSchema;
  children: ReactNode;
}

export function FormProvider({
  store,
  registry,
  schema,
  children
}: FormProviderProps) {

  const validateFieldByName = async (
    name: string
  ): Promise<boolean> => {
    if (!schema) {
      return true;
    }

    const field = schema.fields.find(
      (item) => item.name === name
    );

    if (!field) {
      return true;
    }

    const values =
      store.getState().values;

    const validators =
      createFieldValidators(field);

    const result =
      await validateField(
        name,
        values[name],
        values,
        validators
      );

    if (!result.valid) {
      store.setError(
        name,
        result.errors[0].message
      );

      return false;
    }

    store.clearError(name);

    return true;
  };

  return (
    <FormContext.Provider
      value={{
        store,
        registry,
        schema,
        validateField:
          validateFieldByName
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext():
  FormContextValue {

  const context =
    useContext(FormContext);

  if (!context) {
    throw new Error(
      "useFormContext must be used inside <FormProvider>"
    );
  }

  return context;
}