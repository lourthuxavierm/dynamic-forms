import TextField from "@mui/material/TextField";

import {
  useField,
} from "@dynamic-forms/react";

export interface MuiDateRangeFieldProps {
  name: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function MuiDateRangeField({
  name,
  label,
  startLabel = "Start Date",
  endLabel = "End Date",
  disabled = false,
  fullWidth = true,
}: MuiDateRangeFieldProps) {
  const field = useField<[string, string]>(name);

  const value = field.value ?? ["", ""];

  const [startDate, endDate] = value;

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
          value={startDate}
          label={startLabel}
          type="date"
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
              endDate,
            );
          }}
          onBlur={handleBlur}
        />

        <TextField
          name={`${field.name}.end`}
          value={endDate}
          label={endLabel}
          type="date"
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
              startDate,
              event.target.value,
            );
          }}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}