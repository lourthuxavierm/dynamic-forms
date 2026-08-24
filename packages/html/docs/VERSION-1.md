# Dynamic Forms — Native HTML v1 Implementation Checklist

## Target

Build the **Native HTML renderer for v1** with the same **42 field types**, without another UI framework.

---

# Phase 1 — Native Renderer Foundation

* [ ] Define Native HTML renderer architecture
* [ ] Create native field registry
* [ ] Create default native registry
* [ ] Create `FieldRenderer`
* [ ] Create `FormRenderer`
* [ ] Create common `FieldWrapper`
* [ ] Create `FieldLabel`
* [ ] Create `FieldDescription`
* [ ] Create `FieldError`
* [ ] Create `FieldHelperText`
* [ ] Support required indicator
* [ ] Support disabled
* [ ] Support readonly
* [ ] Support hidden
* [ ] Support placeholder
* [ ] Support CSS class customization
* [ ] Support `data-*` attributes
* [ ] Support `aria-*` attributes

---

# Phase 2 — Core Input Controls

## 1. Text

* [ ] `text`
* Native: `<input type="text">`

## 2. Textarea

* [ ] `textarea`
* Native: `<textarea>`

## 3. Password

* [ ] `password`
* Native: `<input type="password">`

## 4. Email

* [ ] `email`
* Native: `<input type="email">`

## 5. URL

* [ ] `url`
* Native: `<input type="url">`

## 6. Number

* [ ] `number`
* Native: `<input type="number">`

## 7. Integer

* [ ] `integer`
* Native: `<input type="number" step="1">`

## 8. Decimal

* [ ] `decimal`
* Native: `<input type="number" step="any">`

## 9. Hidden

* [ ] `hidden`
* Native: `<input type="hidden">`

**Core total: 9**

---

# Phase 3 — Selection Controls

## 10. Select

* [ ] `select`
* Native: `<select>`

## 11. Multi Select

* [ ] `multi-select`
* Native: `<select multiple>`

## 12. Autocomplete

* [ ] `autocomplete`
* Input + suggestion list

## 13. Async Autocomplete

* [ ] `async-autocomplete`
* Input + async DataSource + suggestion list

## 14. Checkbox

* [ ] `checkbox`
* Native: `<input type="checkbox">`

## 15. Checkbox Group

* [ ] `checkbox-group`
* Multiple native checkboxes

## 16. Radio

* [ ] `radio`
* Native: `<input type="radio">`

## 17. Radio Group

* [ ] `radio-group`
* `<fieldset>` + radio inputs

## 18. Switch

* [ ] `switch`
* Native checkbox + switch presentation

## 19. Toggle Button Group

* [ ] `toggle-button-group`
* Native buttons/radio inputs

## 20. Tree Select

* [ ] `tree-select`
* Accessible custom tree using native elements

**Selection total: 11**

---

# Phase 4 — Date & Time Controls

## 21. Date

* [ ] `date`
* `<input type="date">`

## 22. Time

* [ ] `time`
* `<input type="time">`

## 23. DateTime

* [ ] `datetime`
* `<input type="datetime-local">`

## 24. Date Range

* [ ] `date-range`
* Start date + end date

## 25. Time Range

* [ ] `time-range`
* Start time + end time

## 26. DateTime Range

* [ ] `datetime-range`
* Start datetime + end datetime

## 27. Month

* [ ] `month`
* `<input type="month">`

## 28. Year

* [ ] `year`
* Numeric/select year control

**Date/time total: 8**

---

# Phase 5 — Specialized Controls

## 29. Currency

* [ ] `currency`
* Numeric input
* Currency formatting
* Currency symbol
* Locale support

## 30. Percentage

* [ ] `percentage`
* Numeric input
* Percentage formatting

## 31. Slider

* [ ] `slider`
* `<input type="range">`

## 32. Range Slider

* [ ] `range-slider`
* Two range inputs
* Min/max handling

## 33. Rating

* [ ] `rating`
* Accessible radio/button implementation

## 34. Phone

* [ ] `phone`
* `<input type="tel">`

## 35. OTP

* [ ] `otp`
* Segmented inputs
* Auto-focus next
* Backspace navigation
* Paste support

## 36. PIN

* [ ] `pin`
* Segmented secure inputs
* Numeric restrictions

## 37. Mask

* [ ] `mask`
* Input masking
* Raw value support
* Formatted value support

**Specialized total: 9**

---

# Phase 6 — File & Media

## 38. File

* [ ] `file`
* `<input type="file">`
* Accept restrictions
* File metadata
* Size validation

## 39. Multi File

* [ ] `multi-file`
* `<input type="file" multiple>`
* Multiple file state
* Remove selected file

## 40. Camera

* [ ] `camera`
* File input with capture support
* Image preview
* Graceful browser fallback

## 41. Signature

* [ ] `signature`
* Canvas-based signature
* Clear
* Reset
* Export value

## 42. Document Preview

* [ ] `document-preview`
* Image preview
* PDF/document preview where supported
* File metadata fallback

**File/media total: 5**

---

# Phase 7 — Structural Types

Don't count these as normal controls.

## Object

* [ ] `object`
* Nested field rendering
* Nested value paths
* Nested errors
* Nested touched/dirty state

## Array

* [ ] `array`
* Add item
* Remove item
* Reorder item
* Duplicate item
* Nested arrays
* Array validation
* Stable item identity

---

# Phase 8 — FormStore Integration

Every control must correctly support:

* [ ] Read initial value
* [ ] Update value
* [ ] Touched state
* [ ] Dirty state
* [ ] Error state
* [ ] Disabled state
* [ ] Readonly state
* [ ] Required state
* [ ] Loading state where applicable
* [ ] Reset
* [ ] Programmatic value changes
* [ ] Programmatic errors
* [ ] Form submission

---

# Phase 9 — Fine-Grained Subscriptions

* [ ] Subscribe by field
* [ ] Subscribe to value
* [ ] Subscribe to error
* [ ] Subscribe to touched
* [ ] Subscribe to dirty
* [ ] Subscribe to disabled
* [ ] Subscribe to required
* [ ] Subscribe to visibility
* [ ] Avoid whole-form rerenders
* [ ] Unsubscribe correctly on destroy/unmount
* [ ] Benchmark subscription overhead

Target behavior:

```text
Change firstName
      ↓
firstName updates
      ↓
dependent fields update
      ↓
unrelated fields do NOT update
```

---

# Phase 10 — Validation

* [ ] Required
* [ ] Min length
* [ ] Max length
* [ ] Pattern
* [ ] Minimum
* [ ] Maximum
* [ ] Email
* [ ] URL
* [ ] Custom validator
* [ ] Cross-field validator
* [ ] Async validator
* [ ] Form-level validation
* [ ] Validate on change
* [ ] Validate on blur
* [ ] Validate on submit
* [ ] Zod adapter compatibility

---

# Phase 11 — Conditions

Every native field should work with:

* [ ] `visible`
* [ ] `hidden`
* [ ] `disabled`
* [ ] `enabled`
* [ ] `required`
* [ ] `readonly`

Test combinations such as:

```text
country === "India"
        ↓
show state

hasCompany === true
        ↓
companyName required
```

---

# Phase 12 — Dependencies

* [ ] Field dependencies
* [ ] Cascading fields
* [ ] Dependency graph
* [ ] Dependency recalculation
* [ ] Dependency execution order
* [ ] Cycle detection
* [ ] Clear dependent values
* [ ] Preserve dependent values when configured

Required v1 example:

```text
Country
   ↓
State
   ↓
City
```

---

# Phase 13 — DataSources

* [ ] Static DataSource
* [ ] Async DataSource
* [ ] API DataSource
* [ ] Search
* [ ] Debounce
* [ ] Pagination
* [ ] Caching
* [ ] Loading state
* [ ] Error state
* [ ] Retry
* [ ] Dependent DataSource
* [ ] Request cancellation
* [ ] Race-condition protection

These primarily affect:

```text
select
multi-select
autocomplete
async-autocomplete
checkbox-group
radio-group
tree-select
```

---

# Phase 14 — Accessibility

This should be a **v1 release requirement**, not a later enhancement.

* [ ] Correct `<label>`
* [ ] Unique field IDs
* [ ] `aria-invalid`
* [ ] `aria-describedby`
* [ ] `aria-required`
* [ ] `<fieldset>`
* [ ] `<legend>`
* [ ] Keyboard navigation
* [ ] Visible focus
* [ ] Error announcements
* [ ] Focus first invalid field
* [ ] Accessible autocomplete
* [ ] Accessible tree-select
* [ ] Accessible rating
* [ ] Accessible OTP/PIN
* [ ] Screen-reader testing

---

# Phase 15 — Styling Contract

Keep the renderer UI-library independent.

Provide predictable hooks such as:

```text
df-form
df-field
df-field-label
df-field-control
df-field-description
df-field-error
df-field-required
df-field-disabled
df-field-readonly
df-field-invalid
```

Also:

* [ ] CSS variables
* [ ] Custom class names
* [ ] Data attributes
* [ ] No third-party component-framework dependency
* [ ] No Bootstrap dependency
* [ ] No Tailwind dependency
* [ ] Usable without custom CSS
* [ ] Easy for applications to theme

---

# Phase 16 — Registry

Create the native default registry:

```text
text
    → NativeTextField

email
    → NativeEmailField

select
    → NativeSelect

date
    → NativeDateField

...

signature
    → NativeSignaturePad
```

Required:

* [ ] Default registry
* [ ] Register custom field
* [ ] Override default field
* [ ] Remove field
* [ ] Unknown-field error
* [ ] Registry typing
* [ ] Registry tests

---

# Phase 17 — Playground

Use the 21-page playground you've designed to prove the implementation.

At minimum before v1:

* [ ] Dashboard
* [ ] Getting Started
* [ ] All Fields
* [ ] Input Controls
* [ ] Selection Controls
* [ ] Date & Time
* [ ] Advanced Controls
* [ ] Validation
* [ ] Conditions
* [ ] Dependencies
* [ ] Data Sources
* [ ] Nested Fields
* [ ] Arrays
* [ ] Wizard
* [ ] Layouts
* [ ] Permissions
* [ ] Form State
* [ ] Events
* [ ] Dependency Graph
* [ ] Performance
* [ ] DevTools

---

# Phase 18 — Tests

Every registered control should have:

* [ ] Render test
* [ ] Initial value test
* [ ] Change test
* [ ] Blur/touched test
* [ ] Dirty test
* [ ] Validation test
* [ ] Error rendering test
* [ ] Required test
* [ ] Disabled test
* [ ] Readonly test
* [ ] Reset test
* [ ] Conditional visibility test
* [ ] Accessibility test

Complex controls additionally need dedicated interaction tests.

---

# Phase 19 — Performance

Benchmark:

* [ ] 10 fields
* [ ] 100 fields
* [ ] 500 fields
* [ ] 1,000 fields

Measure:

* [ ] Initial render
* [ ] Single field update
* [ ] Validation
* [ ] Condition evaluation
* [ ] Dependency recalculation
* [ ] DataSource updates
* [ ] Subscription count
* [ ] Rerender/update count
* [ ] Memory usage

---

# Phase 20 — Documentation

* [ ] Installation
* [ ] Getting Started
* [ ] Schema reference
* [ ] FormStore
* [ ] Registry
* [ ] Validation
* [ ] Conditions
* [ ] Dependencies
* [ ] DataSources
* [ ] Arrays
* [ ] Nested fields
* [ ] Layouts
* [ ] Events
* [ ] Permissions
* [ ] Accessibility
* [ ] Performance
* [ ] Custom controls

Then create reference documentation for all **42 controls**.

---

# v1 Definition of Done

Do **not** define v1 completion as:

> 42 components exist.

Define it as:

> 42 controls behave consistently through the same Core contracts.

Before calling v1 stable:

* [ ] 42 field types registered
* [ ] `object` structural rendering works
* [ ] `array` structural rendering works
* [ ] Validation works
* [ ] Conditions work
* [ ] Dependencies work
* [ ] DataSources work
* [ ] Nested values work
* [ ] Fine-grained subscriptions work
* [ ] Events work
* [ ] Permissions work
* [ ] Accessibility passes review
* [ ] Tests pass
* [ ] Performance benchmarks pass
* [ ] Playground demonstrates features
* [ ] Documentation exists
* [ ] Public APIs are reviewed
* [ ] No third-party component-framework dependency
* [ ] No framework-specific behavior leaks into Core

## Recommended implementation order

**Foundation → 9 Core → 11 Selection → 8 Date/Time → 9 Specialized → 5 File/Media → Object/Array → Conditions → Dependencies → DataSources → Accessibility → Tests → Performance → Documentation**

That gives you a concrete **42-control Native HTML v1 target** without losing focus on the engine itself.
