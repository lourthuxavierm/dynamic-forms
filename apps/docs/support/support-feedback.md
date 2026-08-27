# Support feedback loop

Repeated support findings must become searchable, tested documentation rather
than remaining in chat history or a private incident timeline.

## Intake record

Record the exact symptom and sanitized error text; package, framework, browser,
and schema versions; the smallest non-sensitive reproduction; confirmed cause
and evidence; affected versions; and a regression test or tracked issue.

## Publication workflow

1. Triage ownership to Core, adapter, renderer, or consumer application.
2. Reproduce and distinguish a confirmed cause from a hypothesis.
3. Fix product defects and add a regression test where applicable.
4. Add a troubleshooting entry with Symptom, Likely cause, How to confirm,
   Resolution, Preventive guidance, and Related API, test, or issue.
5. Add migration guidance when the resolution changes a version or contract.
6. Run `pnpm docs:verify` and the support browser tests.
7. Review repeated findings during each release documentation audit.

## Privacy rule

Use synthetic schemas and values. Remove credentials, secret-bearing URLs,
tenant identifiers, uploaded content, and personal data from logs and reproductions.
