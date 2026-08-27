# Troubleshooting

- Status: Maintained
- Owner: Package owners and support maintainers

Search this page using the visible symptom or exact error text. Every entry uses
the same diagnosis contract so a workaround is not mistaken for a confirmed fix.

## Form renders no fields

**Symptom:** The form container appears, but controls are absent.

**Likely cause:** The schema has no supported fields, the selected renderer does
not support a field type, or a condition hides every field.

**How to confirm:** Inspect the schema, check the [control reference](../../controls/),
and temporarily remove field conditions.

**Resolution:** Correct the field definitions or select a supported renderer.

**Preventive guidance:** Validate backend-provided schemas before rendering and test visibility conditions.

**Related API, test, or issue:** [Schema overview](../../schema/) and [conditions](../../schema/conditions).

## Submitted values are stale

**Symptom:** The submission handler receives an earlier value.

**Likely cause:** Application code retained a state snapshot or submission ran before asynchronous validation settled.

**How to confirm:** Log event order without form values and inspect `pending` at submission time.

**Resolution:** Read current state in the submit path and wait for documented validation completion.

**Preventive guidance:** Test edit-to-submit ordering and avoid long-lived state snapshots.

**Related API, test, or issue:** [Submission lifecycle](../../runtime/submission) and [event ordering](../../runtime/events).

## Hydration mismatch

**Symptom:** The console contains `Hydration failed` or content mismatch text.

**Likely cause:** Server and client used different schema, defaults, locale, identifiers, or condition inputs.

**How to confirm:** Compare serialized server inputs with the first client render and remove browser-only inputs.

**Resolution:** Make initial inputs deterministic and defer browser-only behavior until after hydration.

**Preventive guidance:** Run the integration's SSR test for every renderer change.

**Related API, test, or issue:** [React HTML SSR](../../integrations/react-html/ssr) and [Angular HTML SSR](../../integrations/angular-html/ssr).

## Async options never finish loading

**Symptom:** A selection control remains pending or shows obsolete options.

**Likely cause:** A request did not resolve, cancellation was ignored, or a stale response replaced a newer result.

**How to confirm:** Record request identifiers, dependency values, cancellation, and completion order without sensitive data.

**Resolution:** Honor runtime cancellation and discard stale results.

**Preventive guidance:** Test out-of-order responses and rapid dependency changes.

**Related API, test, or issue:** [Cancellation](../../runtime/cancellation), [cache](../../runtime/cache), and [data sources](../../runtime/data-sources).

## Validation message is missing

**Symptom:** An invalid value is rejected, but no accessible message is announced.

**Likely cause:** Error visibility depends on untouched state, a custom control lacks an error association, or output uses an unknown path.

**How to confirm:** Inspect touched and error state, then follow the input's accessible description.

**Resolution:** Map the error to the correct field, expose it through the renderer contract, and preserve focus.

**Preventive guidance:** Include keyboard and screen-reader assertions in custom control tests.

**Related API, test, or issue:** [Form state](../../runtime/form-state) and [accessibility governance](../../enterprise/accessibility-governance).

## Still unresolved

Capture a minimal reproduction and follow the [support feedback loop](../support-feedback).
Do not publish an unverified workaround as normative guidance.
