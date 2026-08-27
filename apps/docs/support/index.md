# Operational support

- Status: Supported process
- Owner: Documentation maintainers and package owners
- Applies to: All published integrations

Use this section after adoption: diagnose production symptoms, prepare upgrades,
and turn repeated support findings into verified guidance.

## Start here

| Need | Destination |
| --- | --- |
| Diagnose an error or unexpected behavior | [Troubleshooting](./troubleshooting/) |
| Search using console or error text | [Error and symptom index](./troubleshooting/error-index) |
| Upgrade schemas or packages | [Migration overview](../migration/) |
| Prepare a release | [Release readiness](./release-readiness) |
| Record a new support finding | [Support feedback loop](./support-feedback) |

## Incident triage

1. Preserve the schema version, package versions, integration, browser, and the exact error text.
2. Reproduce with the smallest schema possible and compare it with the [playground](../playground/).
3. Determine whether the failure belongs to schema parsing, runtime state, an adapter, or a renderer.
4. Apply a documented resolution and add a regression test before closing a product defect.
5. Convert reusable findings into the troubleshooting index.

Do not place secrets, access tokens, uploaded files, or personal form values in support reports.
