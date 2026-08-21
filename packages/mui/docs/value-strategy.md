# Date, time, and numeric value strategy

`@dynamic-forms/mui` uses native HTML date/time inputs for the v1 baseline. This keeps the base package free of a mandatory date-library runtime and preserves keyboard and mobile browser behavior. An optional MUI X adapter can be introduced later as a lazy custom registry override.

Canonical form-state values are:

- `date`: `YYYY-MM-DD`
- `time`: `HH:mm` or `HH:mm:ss`, depending on the configured step
- `datetime`: local ISO form `YYYY-MM-DDTHH:mm` (no implicit timezone conversion)
- Ranges: tuples of the corresponding canonical values; a completely empty range is `undefined`
- Month: `YYYY-MM`
- Year: JavaScript `number`
- Empty temporal inputs: `undefined`
- Currency and percentage: JavaScript `number`; formatting never enters form state
- Empty numeric inputs: `undefined`

`minDate` and `maxDate` from `DateTimeFieldConfig` map to native `min` and `max`. Currency/number `min`, `max`, and `step` are taken from field config unless component props override them. Currency and percentage values are clamped on blur; validation remains responsible for reporting schema violations.

A local datetime is intentionally not converted to UTC because the schema does not currently carry timezone semantics. Applications requiring instants should convert at their API boundary or register a timezone-aware custom control.
