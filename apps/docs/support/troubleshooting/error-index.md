# Error and symptom index

Use browser search with the exact text. Framework or browser text can vary by
major version, so every row also includes a stable symptom.

| Search text or symptom | First check | Guidance |
| --- | --- | --- |
| `Hydration failed` | Server/client inputs differ | [Hydration mismatch](./#hydration-mismatch) |
| `No FormStore available` | Provider boundary is absent | [React FormProvider](../../integrations/react/form-provider) |
| `Unknown field type` | Registry and control availability | [Controls](../../controls/) |
| `Cannot find control with path` | Angular form/schema paths differ | [Reactive Forms](../../integrations/angular/reactive-forms) |
| `ExpressionChangedAfterItHasBeenCheckedError` | State changed during Angular checking | [Change detection](../../architecture/angular/change-detection) |
| form renders no fields | Schema, conditions, renderer support | [Troubleshooting](./#form-renders-no-fields) |
| submitted values are stale | Snapshot and event ordering | [Troubleshooting](./#submitted-values-are-stale) |
| options remain pending | Cancellation and stale responses | [Troubleshooting](./#async-options-never-finish-loading) |
| validation message is missing | Error mapping and accessibility | [Troubleshooting](./#validation-message-is-missing) |

If exact text is not emitted by Dynamic Forms, treat it as a search aid, not a
guaranteed package diagnostic. Confirm the cause before applying a resolution.
