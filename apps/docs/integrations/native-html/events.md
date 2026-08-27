# Native HTML events

- Status: Planned renderer integration; Core events available
- Owner: Core and future Native HTML maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

Core already defines form-level events and subscriptions. The future renderer
must translate browser interaction into those contracts without exposing React
synthetic events.

## Required event contract

The implementation must document which browser events update each control,
when parsing and validation occur, the ordering of Core events, focus and blur
semantics, composition/IME behavior, and listener cleanup. Native `input`,
`change`, `focus`, `blur`, and submit events must not be promised uniformly
until control-specific tests establish the mapping.

Use [runtime events](../../runtime/events.md) for the existing Core event types
and [form lifecycle](../../runtime/form-lifecycle.md) for verified store
ordering. Neither page establishes a DOM event adapter.
