# Documentation standards

Status: Active
Owner: Documentation maintainers
Last verified: 2026-08-22
Applies to: All public documentation in this repository

## Sources of truth

Documentation must be verified in this order:

1. Package manifests for names, versions, dependencies, and entry points.
2. Public exports and exported TypeScript types for API contracts.
3. Runtime registries for available renderer field types.
4. Automated tests and runnable applications for observable behavior.
5. Roadmaps for future intent only.

A roadmap item is never evidence that a feature is available. When these sources disagree, correct the documentation or open an implementation issue; do not silently choose the more favorable claim.

## Maturity labels

| Label | Meaning |
| --- | --- |
| Placeholder | Package or export exists but does not yet provide the advertised integration. |
| Experimental | Implemented behavior may change without migration support. |
| Implemented | Present in source and covered by relevant automated tests. |
| Documented | Implemented and backed by a canonical, verified guide or reference page. |
| Release-ready | Documented and passed accessibility, security, compatibility, and release review appropriate to its scope. |

Version `0.1.0` does not imply that every package or schema field type is implemented.

## Page metadata

Every major page must state:

- status or maturity;
- owning maintainer role;
- last verified date or release;
- applicable packages and versions;
- prerequisites and known limitations.

Until the VitePress platform provides frontmatter conventions, use the visible metadata block demonstrated at the top of this page.

## Writing rules

- Use `@dynamic-forms/*` package names exclusively.
- Prefer current exported names over conceptual aliases.
- Describe present behavior in present tense and roadmap work in future tense.
- Introduce a concept before its configuration details.
- Include the smallest complete example that demonstrates the behavior.
- Cover errors, accessibility, security, and performance where the subject creates those concerns.
- Do not claim support for unpublished frameworks, adapters, controls, or versions.

## Verified-snippet convention

Add `verify` after the TypeScript fence language when a block is a complete compilable module:

```ts verify
interface DocumentationMetadata {
  status: 'Placeholder' | 'Experimental' | 'Implemented' | 'Documented' | 'Release-ready';
  owner: string;
}

const metadata: DocumentationMetadata = {
  status: 'Documented',
  owner: 'Documentation maintainers',
};

void metadata;
```

The documentation verification command extracts these blocks and compiles them with strict TypeScript settings.

## Example verification

- TypeScript and TSX snippets must compile under the repository's strict TypeScript settings.
- Task-oriented examples must have a runnable canonical source.
- Docs should reference or import canonical examples rather than maintain divergent copies.
- Critical adoption and enterprise flows require browser smoke tests.
- Examples must not use private or deep package imports.

## Ownership and review cadence

| Area | Owner role | Required review |
| --- | --- | --- |
| Core concepts and schema | Core maintainers | On public Core API change |
| React integration | React maintainers | On public React API change |
| HTML controls and runtime behavior | HTML maintainers | On registry or control contract change |
| Adapter packages | Adapter owner | Before maturity is raised above Placeholder |
| Getting started and recipes | Documentation maintainers plus relevant API owner | Every release |
| Security and accessibility | Relevant subject owner plus package owner | Every material behavior change |

Every pull request that changes a public API, registry entry, peer dependency, or supported workflow must update its canonical documentation in the same change.

## Page definition of done

A page is complete only when:

- its claims were checked against source and tests;
- its samples compile and runnable examples pass;
- prerequisites, versions, limitations, and failure modes are explicit;
- applicable accessibility, security, and performance implications are covered;
- internal links pass and navigation or search exposes the page;
- owner and verification metadata are current.
