# Performance verification

Run `pnpm --filter @dynamic-form-engine/react-html performance` on a production build. The command fails when the `core` entry reaches 10 KB gzip, the independently importable text control reaches 2 KB gzip, or synthetic keystroke work reaches 16 ms.

The root entry remains a compatibility convenience containing the complete default registry. Production applications should import registry primitives from `@dynamic-form-engine/react-html/core` and controls from the `controls/*` entry points. Heavy controls can be code-split by merging `createLazyHtmlRegistry()` into the application registry; `HtmlFieldRenderer` supplies the Suspense boundary.

`phase13.test.tsx` enforces unrelated-field render isolation, measures a 500-field render, and verifies a windowed 1,000-row array mounts only its viewport. Initial-render timing is reported rather than enforced because CI hardware varies.

Document and image previews use native lazy loading, and images decode asynchronously. Schema-path lookups are cached per immutable schema field collection. Condition and dependency controllers recalculate only affected fields.
