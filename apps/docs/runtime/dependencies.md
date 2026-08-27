# Dependency processing

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

Dependencies describe value-change reactions, not conditional visibility.

## Graph guarantees

`DependencyGraph` stores field-to-dependency edges, rejects cycles when edges are
set, returns direct dependents, and produces deterministically sorted transitive
dependents.

## Controller behavior

`DependencyController` watches only paths referenced by `dependsOn`. After a
store notification it compares previous/current dependency values with
`Object.is`, then processes transitive dependents:

- reset a dependent when `resetOnDependencyChange` is true;
- invoke the integration callback when the dependent has a data source.

```text
dependency value changes
  -> store listeners run
  -> determine changed watched paths
  -> find transitive dependents
  -> reset and/or request data-source refresh
```

The callback may be asynchronous, but the controller does not await it. The
integration must handle cancellation, stale results, and errors.

## Lifecycle and safety

Dispose the controller to unsubscribe. Cycles throw during graph construction;
validate and test generated schemas before mounting them. Reset cascades can
produce additional store notifications, so dependency rules should be small and
predictable.
