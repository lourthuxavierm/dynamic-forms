# Large-form performance and lazy loading

Set budgets from measured user journeys rather than field-count claims. Capture
schema fetch/parse, form creation, initial render, interaction latency, validation,
memory, submission serialization, and bundle cost on representative devices.

## Scaling strategy

- Partition large workflows into meaningful steps and mount only active regions.
- Lazy-load rare control implementations through an allowlisted registry.
- Cache immutable schemas and option data with tenant- and permission-safe keys.
- Subscribe components to the smallest state slice and batch dependent updates.
- Virtualize only when focus, error navigation, browser find, and assistive
  technology behavior remain correct.
- Cancel stale async validation and data-source requests.

Add CI budgets and production percentiles, then investigate regressions by schema
version, renderer, browser, and device class. Never trade away validation,
accessibility, or authorization to meet a rendering target.
