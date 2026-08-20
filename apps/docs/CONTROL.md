# Dynamic Forms — Enterprise Controls Roadmap

> Control inventory and implementation tracker for `@dynamic-forms/mui`.

## Status Legend

- [ ] Planned
- [~] In Progress
- [x] Completed
- [-] Deferred
- [E] Extension / community control

---

# 1. Core Input Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Text | `MuiTextField` | [x] | P0 |
| Textarea | `MuiTextarea` | [x] | P0 |
| Password | `MuiPasswordField` | [x] | P0 |
| Email | `MuiEmailField` | [x] | P0 |
| URL | `MuiUrlField` | [x] | P1 |
| Number | `MuiNumberField` | [x] | P0 |
| Integer | `MuiIntegerField` | [x] | P1 |
| Decimal | `MuiDecimalField` | [x] | P1 |
| Hidden | `MuiHiddenField` | [x] | P1 |

---

# 2. Selection Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Select | `MuiSelect` | [x] | P0 |
| Multi Select | `MuiMultiSelect` | [x] | P0 |
| Autocomplete | `MuiAutocomplete` | [x] | P0 |
| Async Autocomplete | `MuiAsyncAutocomplete` | [x] | P0 |
| Checkbox | `MuiCheckbox` | [x] | P0 |
| Checkbox Group | `MuiCheckboxGroup` | [x] | P0 |
| Radio | `MuiRadio` | [x] | P0 |
| Radio Group | `MuiRadioGroup` | [x] | P0 |
| Switch | `MuiSwitch` | [x] | P0 |
| Toggle Button | `MuiToggleButton` | [x] | P1 |
| Toggle Button Group | `MuiToggleButtonGroup` | [x] | P1 |
| Tree Select | `MuiTreeSelect` | [x] | P2 |
| Tree Checkbox | `MuiTreeCheckbox` | [x] | P2 |

---

# 3. Date & Time Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Date | `MuiDateField` | [x] | P0 |
| Time | `MuiTimeField` | [ ] | P0 |
| DateTime | `MuiDateTimeField` | [ ] | P0 |
| Date Range | `MuiDateRangeField` | [ ] | P1 |
| Time Range | `MuiTimeRangeField` | [ ] | P2 |
| DateTime Range | `MuiDateTimeRangeField` | [ ] | P2 |
| Month | `MuiMonthField` | [ ] | P2 |
| Year | `MuiYearField` | [ ] | P2 |

---

# 4. Specialized Numeric Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Currency | `MuiCurrencyField` | [ ] | P1 |
| Percentage | `MuiPercentageField` | [ ] | P1 |
| Slider | `MuiSlider` | [ ] | P1 |
| Range Slider | `MuiRangeSlider` | [ ] | P2 |
| Rating | `MuiRating` | [ ] | P2 |
| Phone | `MuiPhoneField` | [ ] | P1 |
| OTP | `MuiOtpField` | [ ] | P2 |
| PIN | `MuiPinField` | [ ] | P2 |
| Masked Input | `MuiMaskField` | [ ] | P2 |

---

# 5. File Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| File Upload | `MuiFileUpload` | [ ] | P1 |
| File Dropzone | `MuiFileDropzone` | [ ] | P1 |
| File List | `MuiFileList` | [ ] | P2 |
| Image Upload | `MuiImageUpload` | [ ] | P2 |
| Avatar Upload | `MuiAvatarUpload` | [ ] | P2 |
| Document Upload | `MuiDocumentUpload` | [ ] | P2 |

### File Upload Features

- [ ] Single file
- [ ] Multiple files
- [ ] File size validation
- [ ] File type validation
- [ ] MIME validation
- [ ] Upload progress
- [ ] Upload cancellation
- [ ] Retry failed upload
- [ ] Preview
- [ ] Download
- [ ] Remove
- [ ] Async upload
- [ ] Custom upload provider

---

# 6. Content / Editor Controls

> These should preferably be optional packages because of their dependency size.

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Rich Text | `MuiRichTextEditor` | [ ] | P3 |
| Markdown | `MuiMarkdownEditor` | [ ] | P3 |
| Code Editor | `MuiCodeEditor` | [ ] | P3 |
| JSON Editor | `MuiJsonEditor` | [ ] | P3 |
| HTML Editor | `MuiHtmlEditor` | [ ] | P3 |

---

# 7. Address & Location Controls

| Control | Component | Status | Priority |
|---|---|---:|---:|
| Address | `MuiAddressField` | [ ] | P2 |
| Country | `MuiCountryField` | [ ] | P1 |
| State | `MuiStateField` | [ ] | P1 |
| City | `MuiCityField` | [ ] | P1 |
| Postal Code | `MuiPostalCodeField` | [ ] | P1 |
| Location | `MuiLocationField` | [ ] | P2 |

## Dependency Example

```text
Country
   ↓
State
   ↓
City
   ↓
Postal Code

8. Entity / Enterprise Selectors

These should generally be extension controls rather than hardcoded business-specific controls.

Control	Component	Status	Priority
User Selector	MuiUserSelector	[E]	P2
Customer Selector	MuiCustomerSelector	[E]	P2
Employee Selector	MuiEmployeeSelector	[E]	P2
Product Selector	MuiProductSelector	[E]	P2
Organization Selector	MuiOrganizationSelector	[E]	P2
Role Selector	MuiRoleSelector	[E]	P2
Permission Selector	MuiPermissionSelector	[E]	P2

Custom controls must be supported through the Field Registry.

Example:

registry.register({
  type: "customer",
  component: CustomerSelector,
  valueType: "object",
});
9. Tree / Hierarchical Controls
Control	Component	Status	Priority
Tree Select	MuiTreeSelect	[ ]	P2
Tree View	MuiTreeViewField	[ ]	P2
Tree Checkbox	MuiTreeCheckbox	[ ]	P2
Hierarchy Select	MuiHierarchySelect	[ ]	P3
10. Array / Collection Controls

Requires nested state support in Core.

Control	Component	Status	Priority
Array Field	MuiArrayField	[ ]	P2
Object Field	MuiObjectField	[ ]	P2
Repeater	MuiRepeater	[ ]	P2
Editable List	MuiEditableList	[ ]	P2
Key/Value Editor	MuiKeyValueField	[ ]	P3

Example:

Products
──────────────────────────────────
Product       Quantity      Price
──────────────────────────────────
Laptop           2          ₹80,000
Mouse            5          ₹1,000


[ + Add Product ]
11. Data Grid / Table Controls

Advanced feature. Do not implement until array/nested-object support is stable.

Control	Component	Status	Priority
Data Grid Field	MuiDataGridField	[ ]	P3
Editable Grid	MuiEditableGrid	[ ]	P3
Table Field	MuiTableField	[ ]	P3

Potential features:

 Editable cells
 Add row
 Remove row
 Reorder rows
 Row validation
 Cell validation
 Pagination
 Sorting
 Filtering
 Async data
 Virtualization
12. Read-Only / Display Controls
Control	Component	Status	Priority
Display	MuiDisplayField	[ ]	P1
Text Display	MuiTextDisplay	[ ]	P1
Number Display	MuiNumberDisplay	[ ]	P1
Currency Display	MuiCurrencyDisplay	[ ]	P1
Date Display	MuiDateDisplay	[ ]	P1
Status Display	MuiStatusDisplay	[ ]	P1
Link	MuiLinkField	[ ]	P2
13. Form Layout Components

These are schema/layout nodes, not normal fields.

Component	Status	Priority
MuiForm	[x]	P0
MuiFormSection	[ ]	P0
MuiFormGroup	[ ]	P0
MuiFormRow	[ ]	P0
MuiFormGrid	[ ]	P0
MuiFormDivider	[ ]	P1
MuiFormCard	[ ]	P1
MuiFormTabs	[ ]	P2
MuiFormAccordion	[ ]	P2
MuiFormStepper	[ ]	P2
14. Wizard / Multi-Step Forms
Component	Status	Priority
MuiWizardForm	[ ]	P2
MuiFormStep	[ ]	P2
MuiFormNavigation	[ ]	P2
MuiReviewStep	[ ]	P2
MuiSubmitStep	[ ]	P2

Example:

Personal
   ↓
Address
   ↓
Documents
   ↓
Review
   ↓
Submit
15. Enterprise Workflow Controls
Control	Component	Status	Priority
Signature	MuiSignatureField	[ ]	P3
Approval	MuiApprovalField	[ ]	P3
Comment	MuiCommentField	[ ]	P2
Priority	MuiPriorityField	[ ]	P3
Status	MuiStatusField	[ ]	P2
Tags	MuiTagField	[ ]	P2
Color	MuiColorField	[ ]	P3
16. Enterprise Capabilities

Controls should support these through Core rather than implementing the logic individually.

Conditional Visibility
 visibleWhen
 disabledWhen
 requiredWhen
Dependencies
 dependsOn
 Cascading dependencies
 Dependency invalidation
 Dependency cycle detection
 Dependency scheduling
Data Sources
 Static options
 Async function
 REST
 Custom provider
 Loading state
 Error state
 Caching
 Pagination
 Search
 Dependent parameters
Validation
 Required
 Min/max
 Min/max length
 Pattern
 Custom validation
 Async validation
 Cross-field validation
 Zod adapter
Permissions
 Read permission
 Edit permission
 Visibility permission
 Read-only mode
 Permission context
State
 Value
 Default value
 Dirty
 Touched
 Focused
 Error
 Loading
 Disabled
 Read-only
 Visible
17. Current Implementation
Completed
[x] MuiTextField
[x] MuiSelect
[x] MuiNumberField
[x] MuiCheckbox
[x] MuiRadio
[x] MuiDateField
[x] MuiTextarea
[x] MuiForm
Next recommended controls
[ ] MuiPasswordField
[ ] MuiEmailField
[ ] MuiAutocomplete
[ ] MuiMultiSelect
[ ] MuiCheckboxGroup
[ ] MuiRadioGroup
[ ] MuiSwitch
[ ] MuiTimeField
[ ] MuiDateTimeField
[ ] MuiHiddenField
18. Recommended Implementation Order
Phase 1 — Basic Controls
[x] Text
[x] Textarea
[x] Number
[x] Select
[x] Checkbox
[x] Radio
[x] Date


[ ] Password
[ ] Email
[ ] URL
[ ] Autocomplete
[ ] MultiSelect
[ ] CheckboxGroup
[ ] RadioGroup
[ ] Switch
[ ] Time
[ ] DateTime
[ ] Hidden
Phase 2 — Dynamic Controls
[ ] Async Autocomplete
[ ] Dependent Select
[ ] Dependent Autocomplete
[ ] Currency
[ ] Percentage
[ ] Phone
[ ] Date Range
[ ] Slider
[ ] Rating
Phase 3 — Enterprise
[ ] File Upload
[ ] Dropzone
[ ] Tree Select
[ ] Address
[ ] Array Field
[ ] Object Field
[ ] Repeater
[ ] Form Sections
[ ] Form Grid
[ ] Tabs
[ ] Accordion
[ ] Wizard
Phase 4 — Advanced
[ ] Data Grid
[ ] Rich Text
[ ] Code Editor
[ ] JSON Editor
[ ] Signature
[ ] Approval
[ ] Enterprise Selectors
19. Architecture Rule

The MUI package must not contain business logic that belongs in Core.

                  Dynamic Core
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Registry      Conditions     Dependencies
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                  MUI Renderer
                       │
                       ▼
                  MUI Controls

A control should primarily be responsible for:

Render
↓
Receive value
↓
Emit value
↓
Display state

The Core should handle:

State
Conditions
Dependencies
Validation
Events
Data Sources
20. Definition of Enterprise Ready

The library should not be considered enterprise-ready just because it has many controls.

Enterprise readiness means:

 Type-safe schema
 Stable public API
 Framework-independent Core
 Fine-grained subscriptions
 Dependency graph
 Conditional logic
 Async data sources
 Validation adapters
 Accessibility
 Keyboard navigation
 Error handling
 Loading states
 Permission support
 Nested forms
 Arrays
 Performance benchmarks
 Unit tests
 Integration tests
 Documentation
 Examples
 Semantic versioning
 CI/CD
 Tree-shakable packages
 SSR compatibility
 React Strict Mode compatibility
Current Target

The first milestone is not 100 controls.

The first milestone is:

Dynamic Core
     +
React Binding
     +
MUI Renderer
     +
15–20 excellent controls
     +
Conditions
     +
Dependencies
     +
Data Sources
     +
Validation
     +
Tests

Target release:

@dynamic-forms/core    0.1.0
@dynamic-forms/react   0.1.0
@dynamic-forms/mui     0.1.0