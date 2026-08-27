# Playground

- Status: Implemented applications; documentation integration in progress
- Owner: Example and renderer maintainers
- Last verified: 2026-08-26
- Applies to: Repository workspace playgrounds

The repository contains playground applications used to exercise schemas,
controls, form state, validation, structural fields, layouts, and submission
behavior.

## Current role

- Provide runnable evidence for documentation examples.
- Exercise the React HTML renderer and shared example schemas.
- Capture deterministic screenshots for documentation.
- Expose form and submitted values during development.

## Documentation contract

A playground example is documentation evidence only when its schema and initial
values are reproducible, its behavior is covered by tests, and its screenshot
matches the current application. Generated mockups must not be presented as
proof of runtime behavior.

The complete executable-example catalogue will be delivered in the playground
and examples phase.
