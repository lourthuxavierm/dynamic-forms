import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiDateTimeRangeFieldProps {
  name: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiDateTimeRangeField({
  name,
  label,
  startLabel = "Start Date & Time",
  endLabel = "End Date & Time",
  disabled = false,
  fullWidth = true,
}: MuiDateTimeRangeFieldProps) {
  const field = useField<[string, string]>(name);

  const value = field.value ?? ["", ""];

  const [startDateTime, endDateTime] = value;

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
          value={startDateTime}
          label={startLabel}
          type="datetime-local"
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
              endDateTime,
            );
          }}
          onBlur={handleBlur}
        />

        <TextField
          name={`${field.name}.end`}
          value={endDateTime}
          label={endLabel}
          type="datetime-local"
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
              startDateTime,
              event.target.value,
            );
          }}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}