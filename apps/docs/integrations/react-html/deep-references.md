# React HTML deep-reference catalogue

- Status: Source-verified catalogue
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: `packages/react-html/docs`

The following package-local references remain canonical engineering documents.
This catalogue makes their responsibility and VitePress destination
discoverable without maintaining a second copy of every detailed contract.

| Package-local reference | Subject | VitePress destination |
| --- | --- | --- |
| `VERSION-1.md` | v1 status and 42-control inventory | [Controls](./controls.md) |
| `CONTROL-REFERENCE.md` | stable and experimental controls | [Control reference](../../controls/index.md) |
| `date-time-contracts.md` | temporal values and native picker differences | [Date and time controls](../../controls/date-time.md) |
| `specialized-value-contracts.md` | numeric and specialized values | [Specialized controls](../../controls/specialized.md) |
| `file-media-contracts.md` | file values, uploads, previews, privacy | [File and media controls](../../controls/file-media.md) |
| `structural-rendering-contracts.md` | objects, arrays, and windowing | [Layouts](./layouts.md) |
| `native-layout-system.md` | layout nodes and extension contracts | [Layouts](./layouts.md) |
| `keyboard-interactions.md` | composite-control keyboard model | [Accessibility](./accessibility.md) |
| `accessibility-verification.md` | automated and manual release checks | [Accessibility](./accessibility.md) |
| `styling-and-theming.md` | stylesheet, form settings, and tokens | [Styling](./styling.md) |
| `performance.md` | budgets, splitting, and large forms | [Performance](./performance.md) |
| `MIGRATION-FROM-HTML.md` | compatibility-package migration | [Migration](../../packages/react-html.md#legacy-package-name) |
| `RELEASE.md` | verification, publication, and retirement | [Testing](./testing.md) |

Changes to a package-local reference must update the linked public destination
when user-facing behavior changes. The automated Phase 8 verifier detects added
or removed package-local Markdown files so this catalogue cannot silently drift.
