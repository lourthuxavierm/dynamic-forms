# Native HTML styling

- Status: Planned
- Owner: Future Native HTML and design-system maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

No standalone Native HTML stylesheet, class contract, CSS custom-property set,
or theming package exists. The stylesheet exported by
`@lourthuxavierm/dynamic-forms-react-html` belongs to the React HTML renderer; the
`@lourthuxavierm/dynamic-forms-html/styles.css` path only forwards that compatibility surface.

## Required styling contract

The eventual renderer must publish stable hooks for controls, labels, help,
errors, required state, disabled/read-only state, layout, focus, and validation.
It must specify stylesheet opt-in, cascade layers or specificity expectations,
right-to-left behavior, forced-colors behavior, and design-system integration.

React HTML class names are not reserved as the future DOM renderer contract.
