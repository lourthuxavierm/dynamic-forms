# Design-system integration

Integrate through an application-owned control registry and stable field adapter
contract. Keep business schema types independent from vendor component names so
the design system can evolve without migrating every stored schema.

The adapter owns value normalization, touched/disabled/read-only state, labels,
descriptions, error linkage, focus, localization hooks, and test identifiers.
Design tokens own presentation; schemas should not carry arbitrary CSS, HTML, or
component props across a trust boundary.

## Governance

Version adapters with the supported design-system range. Maintain contract tests
for value round-trips, keyboard behavior, errors, reset, async options, and
server rendering where supported. Publish a deprecation window and migration
mapping before removing a control. Escape hatches require an owner and expiry.
