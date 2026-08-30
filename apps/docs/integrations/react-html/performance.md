# React HTML performance

- Status: Automated budget and behavior checks
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: React HTML production builds

The package performance command enforces gzip budgets below 10 KB for the core
entry and below 2 KB for the independently importable text control, plus a
16-millisecond synthetic keystroke budget. Initial-render time is reported
because CI hardware varies.

For production composition, import registry primitives from
`@lourthuxavierm/dynamic-forms-react-html/core` and controls from `controls/*`. Merge
`createLazyHtmlRegistry()` for uncommon heavy controls. Array virtualization is
application-owned through `arrayItemsRenderer`; tests exercise a 1,000-row
collection with only its viewport mounted.
