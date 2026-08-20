import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiTimeRangeFieldProps {
  name: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiTimeRangeField({
  name,
  label,
  startLabel = "Start Time",
  endLabel = "End Time",
  disabled = false,
  fullWidth = true,
}: MuiTimeRangeFieldProps) {
  const field = useField<[string, string]>(name);

  const value = field.value ?? ["", ""];

  const [startTime, endTime] = value;

  const setRange = (
    start: string,
    end: string,
  ) => {
    field.setValue([
      start,
      end,
    ]);
  };

  const handleBlur = async () => {
    field.setTouched(true);
    await field.validate();
  };

  return (
    <div>
      {label && (
        <div style={{ marginBottom: 8 }}>
          {label}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 16,
        }}
      >
        <TextField
          name={`${field.name}.start`}
          value={startTime}
          label={startLabel}
          type="time"
          disabled={disabled}
          fullWidth={fullWidth}
          error={Boolean(field.error)}
          helperText={field.error ?? " "}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          onChange={(event) => {
            setRange(
              event.target.value,
              endTime,
            );
          }}
          onBlur={handleBlur}
        />

        <TextField
          name={`${field.name}.end`}
          value={endTime}
          label={endLabel}
          type="time"
          disabled={disabled}
          fullWidth={fullWidth}
          error={Boolean(field.error)}
          helperText={field.error ?? " "}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          onChange={(event) => {
            setRange(
              startTime,
              event.target.value,
            );
          }}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}