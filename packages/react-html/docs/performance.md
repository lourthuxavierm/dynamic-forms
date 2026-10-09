# Performance verification

Run `pnpm --filter @dynamic-form-engine/react-html performance` (also run in CI). It builds the package and fails when the `core` entry reaches 10 KB gzip or the independently importable `controls/text` entry reaches 2 KB gzip. Each entry is measured together with every chunk it statically imports; lazy `import()` targets are excluded. The command prints the size of every entry and the stylesheet.

Before 1.0.0-rc, the command measured only each entry's stub file and did not count shared chunks, so `controls/text` actually cost 3.4 KB: it pulled in the temporal helpers through `baseline`. The plain input controls now live in their own module, and the entry costs about 1.3 KB.

The root entry remains a compatibility convenience containing the complete default registry. Production applications should import registry primitives from `@dynamic-form-engine/react-html/core` and controls from the `controls/*` entry points. Heavy controls can be code-split by merging `createLazyHtmlRegistry()` into the application registry; `HtmlFieldRenderer` supplies the Suspense boundary.

`phase13.test.tsx` enforces unrelated-field render isolation, measures a 500-field render, and verifies a windowed 1,000-row array mounts only its viewport. Initial-render timing is reported rather than enforced because CI hardware varies.

Document and image previews use native lazy loading, and images decode asynchronously. Schema-path lookups are cached per immutable schema field collection. Condition and dependency controllers recalculate only affected fields.
