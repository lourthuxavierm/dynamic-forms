# Angular DynamicHtmlForm

- Status: Experimental
- Owner: Angular HTML maintainers
- Last verified: 2026-08-27
- Applies to: `DynamicHtmlFormComponent`

`<df-html-form>` accepts required `schema` and `form` inputs plus a submit label.
It renders a native form, validates through the facade, delegates configured
Core submission, and emits `submittedValues` after a valid submit.

The component uses OnPush change detection and Angular's built-in control-flow
template syntax. It renders an error-summary alert after an invalid submitted
state only when the application opts into that state input; automatic first-
invalid focus remains incomplete.
