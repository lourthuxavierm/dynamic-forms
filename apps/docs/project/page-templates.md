# Documentation page templates

- Status: Active Phase 1 baseline
- Owner: Documentation maintainers
- Last verified: 2026-08-26
- Applies to: New and substantially revised documentation pages

Templates establish required content, not mandatory verbosity. Remove sections
that genuinely do not apply, but never omit maturity, limitations, or ownership.

## Common metadata

```md
# Page title

- Status: Implemented, Documented, Experimental, Placeholder, or Planned
- Owner: Maintainer role
- Last verified: YYYY-MM-DD
- Applies to: Package and version
- Prerequisites: Required knowledge or packages
```

## Guide template

```md
# Task-oriented title

<metadata>

## Outcome

State what the reader will have working.

## Prerequisites

List packages, setup, and maturity constraints.

## Implementation

Use the smallest complete, verified sequence.

## Verify the result

Describe observable success.

## Failure modes

List common symptoms and resolutions.

## Next steps

Link to canonical concepts and references.
```

## Integration template

```md
# Integration name

<metadata and availability>

## Responsibility
## Installation
## Minimal integration
## Lifecycle and state
## Validation and submission
## Rendering
## Accessibility
## Server rendering
## Testing
## Performance
## Limitations
## Complete example
## Related Core concepts
```

Planned integrations omit installation and usage snippets. They document only
approved architecture, prerequisites for implementation, and current status.

## Control-reference template

```md
# Control name

<metadata and renderer availability>

## Purpose
## Schema definition
## Default value
## Runtime and submitted value
## Configuration
## Validation
## Accessibility and keyboard behavior
## Native HTML behavior
## React HTML behavior
## Angular HTML status or behavior
## Styling
## Examples
## Known limitations
## Related controls and APIs
```

## API-reference template

```md
# Exported symbol

<metadata>

## Signature
## Purpose
## Parameters or properties
## Return value
## Errors
## State and side effects
## Example
## Compatibility
## Related guides
```

## Recipe template

```md
# Outcome-oriented recipe

<metadata>

## Scenario
## Architecture
## Schema
## Integration implementation
## Validation and error handling
## Security and accessibility considerations
## Test
## Production considerations
## Related guides
```

## Troubleshooting template

```md
# Observable symptom

<metadata>

## Symptom
## Likely causes
## How to confirm
## Resolution
## Prevention
## Related issue, test, or API
```

## Enterprise-guide template

```md
# Enterprise concern

<metadata>

## Decision context
## Recommended architecture
## Trust and ownership boundaries
## Failure modes
## Security
## Accessibility
## Performance and scale
## Observability
## Testing and release gates
## Migration and rollback
## Decision checklist
```

## Quality gate

A page is ready only when claims match source and tests, verified examples pass,
limitations are explicit, internal links resolve, the page is discoverable, and
the accountable owner has reviewed it.
