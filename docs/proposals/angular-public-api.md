# Proposal: Angular public API

- Status: Draft proposal; not implemented or installable
- Owners: Future Angular maintainers
- Last reviewed: 2026-08-27
- Depends on: Angular adapter ADR acceptance

This document provides concrete review vocabulary. Every package name, symbol,
selector, and signature below is provisional. It must not be copied into user
installation or production guidance.

## Proposed headless package

Proposed package: `@lourthuxavierm/dynamic-forms-angular`.

| Area | Candidate API | Responsibility |
| --- | --- | --- |
| Setup | `provideDynamicForms(options?)` | Application defaults and registry contributions |
| Form scope | `DynamicFormProvider` | Own one Core store and schema lifecycle |
| Injection | `injectDynamicForm()` | Read typed signals and commands for the current form |
| Field state | `injectDynamicField(path)` | Focused value/state signals and field commands |
| Events | `injectFormEvents()` | Opt-in Observable view of Core events |
| Rendering | `DynamicFieldOutlet` | Renderer-neutral field resolution boundary |
| Interop | `DynamicFormsValueAccessor` | Whole-form CVA bridge |
| Interop | `createFormGroupBridge()` | Explicit bidirectional Reactive Forms projection |
| Registry | `provideDynamicField()` | Typed multi-provider registration |

## Proposed Angular HTML package

Proposed package: `@lourthuxavierm/dynamic-forms-angular-html`.

| Area | Candidate API | Responsibility |
| --- | --- | --- |
| Setup | `provideDynamicFormsHtml(options?)` | Default browser-native registry and renderer settings |
| Form | `DynamicHtmlForm` | Native form, layout, validation, and value submission |
| Field | `DynamicHtmlField` | Browser-native field outlet and error boundary |
| Registry | `provideHtmlField()` | Custom or lazy HTML control contribution |
| Layout | `provideHtmlLayout()` | Custom layout-node contribution |
| Styling | `dynamic-forms.css` | Optional static style entry |

## Candidate form facade

The injected facade should expose readonly signals for values, form state,
errors, submission state, and schema-derived field state. Commands should cover
Core mutations, validation, submit, reset, field reset, and disposal-safe event
observation. It must not expose mutable signals that bypass Core.

## Candidate field contract

A renderer control needs the resolved schema field and path; readonly signals
for value, error, touched, dirty, pending, visible, disabled, read-only, and
required state; commands for value, touch, validation, and focus registration;
and stable accessibility identifiers. Generic value typing must flow from the
field registration into the component contract.

## Provider precedence

Form-level overrides win over application defaults. Later explicit registry
contributions win only when an override flag is present; accidental duplicate
field types are development errors. Lazy registrations participate in the same
collision rules.

## Reactive Forms behavior

The whole-form CVA writes complete values into Core and emits immutable complete
values outward. Disabled state maps to the form scope. Touched state becomes
true after a documented descendant interaction or submission policy. Core
validation errors are exposed through a namespaced Angular validation error;
Angular external errors do not mutate Core unless an explicit bridge policy is
configured.

The optional `FormGroup` bridge must define source-of-change tokens to prevent
feedback loops, batched updates, async pending mapping, enable/disable mapping,
`updateOn` interaction, nested paths, array identity, and teardown.

## Compatibility surface

No deep imports are proposed. Public APIs must come from the package root or
documented control/style subpaths. Angular, TypeScript, RxJS, and optional
`@angular/forms` ranges will be selected from tested matrices immediately before
the first prerelease rather than frozen in this proposal.

## Questions requiring approval

1. Component versus directive naming for the form scope.
2. Whether the whole-form CVA ships in the root entry or an `interop/forms` entry.
3. Whether the Observable event bridge belongs in the root or `interop/rxjs`.
4. Registry duplicate behavior in production builds.
5. Initial server data-source transfer format and ownership.
6. Minimum Angular version and support cadence.

No implementation should stabilize these candidate names until those questions
and the architecture ADR are approved.
