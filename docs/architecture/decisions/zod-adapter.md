# ADR: Zod validation adapter boundary

- Status: Accepted for implementation
- Date: 2026-08-28
- Owners: Core and adapter maintainers

## Context

`@dynamic-form-engine/core` exposes framework-neutral `FormValidator` and
`Validator` functions. The existing `@dynamic-form-engine/zod` package exports only
`ZOD_ADAPTER = true`; it is not a usable adapter.

Zod schemas may validate asynchronously and may transform input into a different
output type. Core form validation returns errors only and does not replace store
values with parsed output.

## Decision

1. Zod remains an adapter package depending on Core. Zod code and types do not
   enter Core or renderer packages.
2. The first release is validation-only. Coercions, defaults, and transforms are
   evaluated by Zod for validity but parsed output is not written into FormStore.
3. Form validation maps Zod issue paths into Core paths: string segments use dot
   notation and numeric segments use brackets, for example
   `contacts[0].email`.
4. An issue with an empty path maps to the reserved `_form` error key.
5. The default error mode keeps the first issue for each path. An explicit
   `all` mode may join messages with a caller-owned formatter.
6. Validation uses `safeParseAsync` so synchronous and asynchronous refinements
   share one deterministic contract.
7. The candidate compatibility range is Zod `^3.25.5 || ^4.0.0`. It is not
   certified until both-major build, type, and behavior tests pass.
8. The public adapter will accept a deliberately narrow structural schema
   contract. It will not expose Zod 3 or Zod 4 concrete classes in generated
   declarations unless implementation evidence proves that necessary.

## Consequences

- React, Angular, and HTML renderers consume the same Core validator.
- Applications that need transformed values must parse explicitly outside the
  validation callback.
- Core's single-message `FormErrors` contract requires a documented
  first-or-joined policy.
- Core currently provides no cancellation signal to a form validator. Obsolete
  async-result handling remains a runtime/application concern.
- The placeholder maturity remains unchanged until implementation, tests,
  examples, documentation, and release verification exist.
- Zod 3.25.0 through 3.25.4 are excluded because their published packages do
  not provide the declaration files referenced by their package metadata.

## Rejected alternatives

- Adding Zod to Core would violate dependency boundaries.
- Applying transformed data during validation would create hidden state writes.
- Binding declarations to one major's `ZodType` would undermine dual-major
  compatibility.
- Advertising the manifest peer range as support without a compatibility matrix
  would overstate product maturity.

## Release gates

- Tested lowest and latest selected Zod 3 and Zod 4 versions
- ESM, CommonJS, and declaration consumers
- Nested objects, arrays, root issues, cross-field issues, and async refinements
- Explicit transform behavior
- Package boundary, API reference, documentation, and example verification
- Phase 12 cross-renderer browser release gate covering invalid and corrected submissions
