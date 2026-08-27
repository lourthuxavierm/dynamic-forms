# React HTML styling and theming

- Status: Implemented
- Owner: React HTML and design-system maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-forms/react-html/styles.css`

The renderer remains semantic without CSS. Import the optional stylesheet for
the default layer, or pass `unstyled` for a form-level opt-out. `colorScheme`
supports the exported color-scheme contract, `density` selects spacing density,
and `dir` is forwarded to the form.

CSS custom properties use the exported `--df-` token prefix. Treat documented
tokens and semantic hooks as integration surfaces; avoid selectors coupled to
incidental nesting. The package-local styling reference is indexed under
[deep references](./deep-references.md).
