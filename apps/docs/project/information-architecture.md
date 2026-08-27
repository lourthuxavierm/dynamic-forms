# Documentation information architecture

- Status: Active Phase 1 baseline
- Owner: Documentation maintainers
- Last verified: 2026-08-26
- Applies to: Repository version 0.1.0

The documentation is organized around reader goals. Package boundaries remain
visible, but they do not determine the top-level navigation.

## Primary navigation

```text
Guides | Integrations | Controls | Enterprise | API | Playground
```

| Section | Primary audience | Question answered |
| --- | --- | --- |
| Guides | New users and application developers | How do I build a form workflow? |
| Integrations | Framework developers | How do I connect Dynamic Forms to my application stack? |
| Controls | Form authors and design-system teams | Which field types exist and what values do they produce? |
| Enterprise | Architects, security, accessibility, and platform teams | How should this be governed and operated at scale? |
| API | Library and adapter developers | What is the exact public contract? |
| Playground | All readers | Can I inspect and run the behavior? |

Project status, maturity, terminology, ownership, contribution, and release
information live under Project Information rather than competing for primary
navigation space.

## Canonical section map

```text
apps/docs/
|-- index.md
|-- getting-started/
|-- guides/
|-- concepts/
|-- schema/
|-- runtime/
|-- integrations/
|   |-- native-html/
|   |-- react/
|   |-- react-html/
|   |-- angular/       (planned)
|   `-- angular-html/  (planned)
|-- controls/
|-- validation/
|-- layout/
|-- styling/
|-- customization/
|-- accessibility/
|-- enterprise/
|-- recipes/
|-- testing/
|-- security/
|-- performance/
|-- api/
|-- migrations/
|-- troubleshooting/
|-- playground/
|-- packages/
`-- project/
```

Directories in this map may be introduced only when they contain a useful
landing page or canonical content. Empty navigation groups are not published.

## Content ownership boundaries

### Core concepts

Schemas, state, validation, conditions, dependencies, data sources, events, and
framework-neutral registries are explained once. Integration pages link to the
canonical concept instead of restating it.

### Integrations

Integration pages cover installation, lifecycle, framework state bindings,
rendering, SSR, testing, and framework-specific limitations. They do not redefine
Core semantics.

### Controls

Control pages own value contracts, configuration, validation, accessibility,
and renderer differences. Package pages summarize scope and link to control
references.

### API

API pages describe exact exported types and signatures. Guides explain intent
and workflows. Generated signatures must not replace task-oriented prose.

## Reader paths

### New user

```text
Home -> Choose an integration -> Installation -> Quick start -> Validation -> Playground
```

### Application developer

```text
Guides -> Schema -> Runtime -> Controls -> Customization -> Testing
```

### Enterprise architect

```text
Enterprise -> Architecture -> Security -> Accessibility -> Operations -> Migration
```

### Adapter developer

```text
Architecture -> Core API -> Adapter contracts -> Compatibility -> Testing -> Contribution
```

## Page placement rules

1. A task belongs in Guides or Recipes.
2. Framework lifecycle behavior belongs in Integrations.
3. Field behavior belongs in Controls.
4. Exact symbols belong in API.
5. Cross-cutting adoption policy belongs in Enterprise.
6. Maturity, ownership, compatibility, and release policy belong in Project.
7. Package pages remain concise entry points and do not duplicate references.

## Phase 1 acceptance checks

- Each top-level section answers a distinct reader question.
- Each existing page has one canonical destination.
- Shared Core behavior is not copied into renderer sections.
- Planned integrations are visible as plans but cannot be mistaken for support.
- Navigation publishes only useful, non-empty destinations.
