import {
  MuiTextField,
  type MuiTextFieldProps,
} from "./MuiTextField";

export type MuiUrlFieldProps =
  Omit<MuiTextFieldProps, "type">;

export function MuiUrlField(
  props: MuiUrlFieldProps,
) {
  return (
    <MuiTextField
      {...props}
      type="url"
    />
  );
}