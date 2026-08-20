import {
  MuiTextField,
  type MuiTextFieldProps,
} from "./MuiTextField";

export type MuiEmailFieldProps = Omit<MuiTextFieldProps, "type">;

export function MuiEmailField(props: MuiEmailFieldProps) {
  return (
    <MuiTextField
      {...props}
      type="email"
    />
  );
}