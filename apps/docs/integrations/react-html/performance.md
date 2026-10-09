# React HTML performance

- Status: Automated budget and behavior checks
- Owner: React HTML maintainers
- Last verified: 2026-09-28
- Applies to: React HTML production builds

The package performance command (run in CI) enforces gzip budgets below 10 KB
for the `core` entry and below 2 KB for the independently importable
`controls/text` entry. Each entry is measured with every chunk it statically
imports, so shared code counts against the entry that loads it. The command
also reports every other entry and the stylesheet.

Render cost is enforced with deterministic render counts rather than timings:
in a 500-field `HtmlForm`, editing one control re-renders only that control,
and editing a field outside an array re-renders none of the array's items.

For production composition, import registry primitives from
`@dynamic-form-engine/react-html/core` and controls from `controls/*`. Merge
`createLazyHtmlRegistry()` for uncommon heavy controls. Array virtualization is
application-owned through `arrayItemsRenderer`; tests exercise a 1,000-row
collection with only its viewport mounted.
