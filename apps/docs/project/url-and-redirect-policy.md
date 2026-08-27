# URL and redirect policy

- Status: Active Phase 1 baseline
- Owner: Documentation maintainers
- Last verified: 2026-08-26
- Applies to: All published documentation routes

Stable documentation URLs are part of the user experience. Renaming a page
without preserving its route breaks bookmarks, issues, release notes, and search
results.

## Canonical URL rules

- Use lowercase kebab-case paths.
- Use nouns for references and task phrases for guides.
- Do not include package versions in normal page paths.
- Do not include implementation phases in public URLs.
- Keep one canonical URL for each concept.
- Prefer `/integrations/react-html/` over ambiguous `/html/` paths.
- Use `/project/` for maturity, compatibility, terminology, and governance.
- Use `/api/` only for exact public contracts.

## Route examples

| Content | Canonical route |
| --- | --- |
| Installation | `/getting-started/installation` |
| Core runtime concept | `/concepts/core-runtime` |
| React HTML integration | `/integrations/react-html/` |
| Text control reference | `/controls/text` |
| Framework compatibility | `/project/framework-compatibility` |
| FormStore API | `/api/core/form-store` |

## Redirect requirements

A redirect is required when:

- a published page moves;
- a package or integration is renamed;
- a compatibility package is replaced by its canonical package;
- two duplicate pages are consolidated;
- a release changes a commonly linked route.

Redirects must point directly to the final canonical page. Redirect chains are
not permitted.

## Redirect record

Every redirect must record:

| Field | Requirement |
| --- | --- |
| Old route | Previously published route |
| New route | Final canonical route |
| Reason | Move, rename, consolidation, or migration |
| Introduced | Release or date |
| Removal | Never for externally published routes unless the hosting platform requires it |

## Link-writing policy

- Internal Markdown links use relative source paths so repository verification
  can resolve them.
- External links use HTTPS.
- Links target canonical pages rather than redirects.
- Heading links are verified when committed.
- Package-local references link to their canonical site page once that page
  exists.

## Current migration constraint

`@dynamic-forms/html` documentation must point new users to React HTML. This is
a package migration, not evidence of a standalone Native HTML renderer.
