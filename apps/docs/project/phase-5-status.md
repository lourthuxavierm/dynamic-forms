# Phase 5 control reference status

- Status: Implemented and verified
- Owner: React HTML and documentation maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/react-html` 0.1.0

## Delivered

- Canonical control landing page and compatibility summary
- Text and hidden control contracts
- Numeric control contracts
- Selection and composite interaction contracts
- Date, time, range, month, and year contracts
- Currency, percentage, slider, rating, formatted text, OTP, PIN, and mask contracts
- File, camera, signature, upload, preview, privacy, and security contracts
- Object and array structural rendering contracts
- Experimental extension and deferred-control policy

## Inventory result

The dedicated verifier reads `V1_HTML_FIELD_TYPES` from source and confirms:

- exactly 42 stable leaf controls;
- six non-overlapping canonical documentation groups;
- every stable type appears in one group;
- no documented stable type is absent from the exported tuple;
- object and array are documented separately as structural fields;
- `searchable-select` and `tree-checkbox` remain experimental;
- standalone `toggle-button` remains outside the default React HTML registry.

## Verification evidence

- Control verification passes for all 42 stable controls.
- Documentation verification passes for 65 Markdown pages and 30 compiled
  TypeScript/TSX snippets.
- Production VitePress build passes.
- Eighteen Chromium documentation tests pass, including catalogue totals, typed
  selection values, file privacy boundaries, and experimental separation.

## Remaining repository constraints

The broad Markdown ignore rule and sandbox-blocked updates to existing tracked
configuration still prevent normal Git visibility, script aggregation, and live
sidebar integration for the new control pages in this session.
