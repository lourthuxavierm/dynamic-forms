# Native HTML custom controls

- Status: Planned
- Owner: Future Native HTML maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

There is no standalone DOM control registry or custom-control interface today.
The React HTML registry is React-specific and is not a Native HTML API.

## Contract required before publication

A future extension API must define control registration and collision rules,
DOM ownership, value reading and writing, disabled and read-only behavior,
validation display, focus, cleanup, asynchronous work, styling hooks, and
accessibility responsibilities. It also needs TypeScript contracts and tests
showing more than one independently registered control.

Do not build against names or signatures inferred from this requirements list.
For current React-based customization, use the React HTML documentation.
