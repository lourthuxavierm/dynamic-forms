# Documentation ownership

- Status: Active governance policy
- Owner: Documentation maintainers
- Last verified: 2026-08-28
- Applies to: All public documentation in this repository

Ownership identifies the maintainer role responsible for technical correctness.
It does not require one person to write every page.

## Ownership map

| Area | Accountable owner | Required reviewers | Review trigger |
| --- | --- | --- | --- |
| Core schema and types | Core maintainers | Documentation maintainers | Public schema or type change |
| Store, validation, conditions, dependencies, data sources, and events | Core maintainers | Documentation maintainers | Behavioral or public API change |
| Headless React | React maintainers | Core and documentation maintainers as applicable | Public React API or lifecycle change |
| React HTML controls and values | React HTML maintainers | Accessibility reviewer for interaction changes | Registry, value, validation, or interaction change |
| React HTML layouts and styles | React HTML maintainers | Accessibility and documentation reviewers | Layout, CSS token, or semantic change |
| `@lourthuxavierm/dynamic-forms-html` compatibility | React HTML maintainers | Release maintainer | Forwarded export, lifecycle, or migration change |
| Example schemas and playgrounds | Example maintainers | Relevant package owner | Example behavior or supported workflow change |
| Getting started | Documentation maintainers | Core, React, and renderer owners | Every release or installation change |
| Accessibility | Accessibility reviewer | Relevant package owner | Semantic, keyboard, focus, or error behavior change |
| Security | Relevant package owner | Security reviewer when assigned | Data, file, HTML, or trust-boundary change |
| Performance | Relevant package owner | Performance reviewer when assigned | Subscription, rendering, async, or threshold change |
| Placeholder adapters | Assigned adapter owner | Core and documentation maintainers | Before maturity rises above Placeholder |
| Experimental Angular adapter | Angular maintainers | Core and documentation maintainers | Public API, architecture, or implementation change |
| Experimental Angular HTML | Angular HTML maintainers | Angular, accessibility, and documentation reviewers | Renderer API, control, or implementation change |
| Documentation platform | Documentation maintainers | Developer-experience maintainer | VitePress, verification, navigation, or CI change |

## Required update rules

- A public export change updates its API documentation in the same pull request.
- A registry change updates control compatibility and the relevant reference.
- A peer dependency or support-policy change updates installation and compatibility pages.
- A new example is owned by the package whose behavior it demonstrates.
- A breaking change includes migration guidance before release.
- A planned package cannot be promoted without implementation, tests, examples,
  ownership, and an explicit compatibility policy.

## Review cadence

| Cadence | Review |
| --- | --- |
| Every pull request | Claims, examples, links, maturity, and ownership metadata |
| Every release | Public API, compatibility, installation, and migration audit |
| Quarterly | Broken links, stale pages, screenshots, and example drift |
| Twice yearly | Information architecture and enterprise adoption guidance |
| Before a major release | Full documentation, accessibility, compatibility, and migration review |

Repository path ownership is enforced by `.github/CODEOWNERS`. This role map is
the accountable review policy; CODEOWNERS maps those responsibilities to current
GitHub maintainers.
