# Executable example catalogue

- Status: Implemented and source verified
- Owner: Example and renderer maintainers
- Last verified: 2026-08-27
- Applies to: Shared examples 1.0.0, React HTML, and Angular HTML Experimental

The catalogue uses schemas and initial values from `@dynamic-forms/examples`.
Select an example in the React HTML playground or open it directly with
`?example=<id>`. The debug panel exposes live values, errors, touched/dirty
state, validity, submission, events, validation, and reset.

![Executable Basic form with live state and event log](/examples/basic-form.png)

## Catalogue and renderer support

| Example ID | Topic | React HTML | Angular HTML | Evidence |
| --- | --- | --- | --- | --- |
| `basic-form` | Basic form | Runnable | Runnable | Browser interaction |
| `core-controls` | Core controls | Runnable | Runnable | Cross-renderer submission |
| `text-numeric` | Text and numeric controls | Runnable | Not advertised | Browser render |
| `selection-controls` | Selection controls | Runnable | Not advertised | Browser render |
| `date-time` | Date and time controls | Runnable | Not advertised | Browser render |
| `validation-errors` | Validation and error states | Runnable | Not advertised | Validation state |
| `conditional-dependencies` | Conditional fields and dependencies | Runnable | Not advertised | Runtime conditions |
| `async-data` | Async data sources | Runnable | Not advertised | Deterministic service simulation |
| `nested-objects-arrays` | Nested objects and arrays | Runnable | Not advertised | Structural renderer |
| `file-media` | File and media fields | Runnable | Not advertised | Safe metadata state |
| `schema-loading` | Schema loading | Runnable | Runnable | Versioned repository simulation |
| `multi-step-workflow` | Multi-step workflow | Runnable | Not advertised | Workflow-state simulation |
| `draft-autosave` | Draft and autosave | Runnable | Not advertised | Revision/autosave event simulation |
| `enterprise-profile` | Enterprise profile form | Runnable | Not advertised | Representative large form |

“Not advertised” is deliberate: Angular HTML remains a 15-type Experimental
baseline. The matrix does not imply parity where its renderer lacks structural,
specialized, or workflow controls.

## Deterministic screenshots

The checked-in images are captured from fixed schemas and initial values at a
fixed viewport:

![Basic form deterministic state](/examples/basic-form.png)

![Validation errors deterministic state](/examples/validation-errors.png)

![Enterprise profile deterministic state](/examples/enterprise-profile.png)

Run `pnpm docs:examples:capture` to regenerate them. Browser tests verify every
catalogue route; the screenshot capture script uses the same query contract.

## Application-service simulations

Schema loading, asynchronous data, workflow transitions, and autosave normally
cross application or backend boundaries. Their catalogue entries label this as
`simulated-application-service`; they demonstrate integration state rather than
claiming that the form renderer owns persistence or workflow authorization.
