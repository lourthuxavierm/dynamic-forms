# MUI control inventory

Status: Source-derived snapshot
Owner: MUI maintainers
Last verified: 2026-08-22
Package: `@dynamic-forms/mui@0.1.0`

This file is an implementation inventory, not a feature roadmap. The canonical source is `packages/mui/src/registry/defaultRegistry.ts`; tests establish behavior. Update this snapshot whenever the default registry changes.

“Registered” means the default MUI registry resolves the field type. It does not mean the control has completed public reference documentation or release-readiness review.

## Registered controls

| Family | Field type | Component | Registry status |
| --- | --- | --- | --- |
| Core | `text` | `MuiTextField` | Registered |
| Core | `textarea` | `MuiTextarea` | Registered |
| Core | `password` | `MuiPasswordField` | Registered |
| Core | `email` | `MuiEmailField` | Registered |
| Core | `url` | `MuiUrlField` | Registered |
| Core | `number` | `MuiNumberField` | Registered |
| Core | `integer` | `MuiIntegerField` | Registered |
| Core | `decimal` | `MuiDecimalField` | Registered |
| Core | `hidden` | `MuiHiddenField` | Registered |
| Selection | `select` | `MuiSelect` | Registered |
| Selection | `multi-select` | `MuiMultiSelect` | Registered |
| Selection | `autocomplete` | `MuiAutocomplete` | Registered |
| Selection | `async-autocomplete` | `MuiAsyncAutocomplete` | Registered |
| Selection | `checkbox` | `MuiCheckbox` | Registered |
| Selection | `checkbox-group` | `MuiCheckboxGroup` | Registered |
| Selection | `radio` | `MuiRadio` | Registered |
| Selection | `radio-group` | `MuiRadioGroup` | Registered |
| Selection | `switch` | `MuiSwitch` | Registered |
| Selection | `toggle-button-group` | `MuiToggleButtonGroup` | Registered |
| Selection | `tree-select` | `MuiTreeSelect` | Registered |
| Date/time | `date` | `MuiDateField` | Registered |
| Date/time | `time` | `MuiTimeField` | Registered |
| Date/time | `datetime` | `MuiDateTimeField` | Registered |
| Date/time | `date-range` | `MuiDateRangeField` | Registered |
| Date/time | `time-range` | `MuiTimeRangeField` | Registered |
| Date/time | `datetime-range` | `MuiDateTimeRangeField` | Registered |
| Date/time | `month` | `MuiMonthField` | Registered |
| Date/time | `year` | `MuiYearField` | Registered |
| Specialized | `currency` | `MuiCurrencyField` | Registered |
| Specialized | `percentage` | `MuiPercentageField` | Registered |
| Specialized | `slider` | `MuiSlider` | Registered |
| Specialized | `range-slider` | `MuiRangeSlider` | Registered |
| Specialized | `rating` | `MuiRating` | Registered |
| Specialized | `phone` | `MuiPhoneField` | Registered |
| Specialized | `otp` | `MuiOtpField` | Registered |
| Specialized | `pin` | `MuiPinField` | Registered |
| Specialized | `mask` | `MuiMaskField` | Registered |
| File/media | `file` | `MuiFileUpload` | Registered |
| File/media | `multi-file` | `MuiMultiFileUpload` | Registered |
| File/media | `camera` | `MuiCameraCapture` | Registered |
| File/media | `signature` | `MuiSignaturePad` | Registered |
| File/media | `document-preview` | `MuiDocumentPreview` | Registered |

Total: 42 registered field types.

## Schema types without default MUI registration

| Field type | State |
| --- | --- |
| `toggle-button` | Declared by Core schema typing; no default MUI registry entry. |
| `tree-checkbox` | Declared by Core schema typing; no default MUI registry entry. |
| `object` | Structural schema type; no default MUI structural renderer. |
| `array` | Structural schema type; no default MUI structural renderer. |

## Documentation status

Control reference pages are scheduled for Documentation Phase 4. Until then, this inventory establishes implementation traceability only. Existing runtime and file/media notes under `packages/mui/docs` remain supporting technical documentation.
