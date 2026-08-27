# Native HTML testing contract

- Status: Planned release gate
- Owner: Future Native HTML and quality maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

The standalone integration has no implementation tests because it has no
implementation. The following matrix is the minimum evidence required before
the documentation may present it as available.

| Layer | Required evidence |
| --- | --- |
| Package | Public exports, ESM/CJS policy, dependency-boundary test, clean install |
| Rendering | Mount, update, conditional removal, schema replacement, disposal |
| Values | Every advertised control, programmatic updates, reset, serialization |
| Events | Browser-to-Core ordering, blur/focus, IME, submit, listener cleanup |
| Validation | Sync, async, stale results, accessible errors, invalid submission |
| Custom controls | Registration, override policy, cleanup, error isolation |
| Accessibility | Keyboard, focus, axe checks, manual assistive-technology review |
| Browsers | Supported browser matrix in CI |
| Example | Runnable playground scenario with assertions |

Cross-renderer contract tests should reuse schemas and expected Core values,
while renderer-specific tests must assert real DOM behavior without React test
utilities.
