# @dynamic-form-engine/react-html

Accessible native HTML rendering for Dynamic Forms. The package depends on the
headless React contract and contains no third-party component framework or runtime CSS-in-JS.

## Status

The adapter includes native controls, composite and specialized fields, file and
media workflows, structural arrays, declarative layouts, and opt-in theming.
The stable v1 contract contains exactly 42 leaf controls, exported through
V1_HTML_FIELD_TYPES, plus the object and array structural types. See
docs/CONTROL-REFERENCE.md for their value and behavior contracts.

## Install

    pnpm add @dynamic-form-engine/core @dynamic-form-engine/react @dynamic-form-engine/react-html react react-dom

## Quickstart

    import { FormProvider } from '@dynamic-form-engine/react';
    import { HtmlForm } from '@dynamic-form-engine/react-html';
    import '@dynamic-form-engine/react-html/styles.css';

    <FormProvider schema={schema}>
      <HtmlForm
        colorScheme="auto"
        density="standard"
        schema={schema}
        onSubmit={save}
      />
    </FormProvider>

The stylesheet import is optional. Omit it for completely unstyled native markup,
or pass `unstyled` when the stylesheet is present but one form must opt out.

React 18 and 19 are supported; CI runs this package's tests on React 18.3 and
19.2. Native controls target WCAG 2.2 AA and evergreen browsers as defined by
ADR 0001.

## Submission

`HtmlForm` validates through the provider and submits through the store: it
ignores submits while the form is disabled or already submitting (including
during async validation), sets `submitting` so controls are disabled while the
handler runs, and emits a `submit` event. Errors thrown by `onSubmit` go to
`onError`. Without an `onSubmit` prop, it delegates to `FormProvider.submit()`.
Form-level `disabled` and `readOnly` from `FormProvider` apply to every control
and to object and array fieldsets.

## Packaging and stability

Every subpath (`.`, `core`, `controls/*`, `styles.css`) ships ESM, CommonJS,
and declarations that resolve for bundler, Node ESM, and Node CommonJS
consumers; `pnpm verify:react-html-release` checks the packed artifacts in CI.
The public API is recorded in `api-report.json` under Core's stability policy.
Import `core` and individual `controls/*` entries to keep bundles small: the
`core` entry is about 1 KB and `controls/text` about 1.3 KB gzip, including
shared chunks (see docs/performance.md).

Applications still using `@dynamic-form-engine/html` can follow the
[package-name migration guide](./docs/MIGRATION-FROM-HTML.md). The compatibility
package remains available throughout v1 but must not be adopted by new code.
