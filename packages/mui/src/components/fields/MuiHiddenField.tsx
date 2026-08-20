import { useField } from "@dynamic-forms/react";

export interface MuiHiddenFieldProps {
  name: string;
}

export function MuiHiddenField({
  name,
}: MuiHiddenFieldProps) {
  const field = useField<string>(name);

  return (
    <input
      type="hidden"
      name={field.name}
      value={field.value ?? ""}
      onChange={(event) => {
        field.setValue(event.target.value);
      }}
    />
  );
}