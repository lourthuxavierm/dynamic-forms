import { MuiTextField } from "./MuiTextField";
import type { MuiTextFieldProps } from "./MuiTextField";

export type MuiPasswordFieldProps = Omit<MuiTextFieldProps, "type">;

export function MuiPasswordField(props: MuiPasswordFieldProps) {
  return (
    <MuiTextField
      {...props}
      type="password"
    />
  );
}