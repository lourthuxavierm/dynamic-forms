# Changelog

Notable changes to published `@dynamic-form-engine/*` packages. Stability tiers
and what counts as breaking are defined in `packages/core/STABILITY.md`.

## Unreleased

### @dynamic-form-engine/core

**Added**

- Public API report (`packages/core/api-report.json`) with stable and
  experimental tiers, enforced by `pnpm check:api` in CI, and the
  `STABILITY.md` versioning and deprecation policy shipped in the package.
- Experimental runtime diagnostics: `FormRuntime.explainFieldState`, the opt-in
  `FormRuntime.diagnostics` trace, `explainCondition`, and
  `DataSourceManagerOptions.onRequest`.

**Fixed**

- Type declarations were unresolvable for Node ESM consumers using
  `moduleResolution: node16`/`nodenext`: every export appeared missing. Published
  declarations now use fully specified relative imports.
- `resetOnDependencyChange` and dependent data-source refreshes now fire when a
  dependency changes through an ancestor replacement (`setValue('profile', …)`)
  or a descendant edit (`items[0].code` for a dependency on `items`), and for
  either array-path spelling.
- Data-source `$path` URL parameters accept bracket array segments
  (`$items[0].code`).
- Dirty, touched, and error state are tracked consistently for nested paths and
  for equivalent `items[0]` / `items.0` spellings.
- `VERSION` now reports the package version (`1.0.0-rc.1`) instead of `0.1.0`.
- `FormStore.subscribeToField` subscribers are now notified when an ancestor
  path is replaced (`setValue('profile', …)` notifies `profile.city`), and
  subscriptions match either array-path spelling.

**Deprecated**

- `InferSchemaType`: use `InferFormValues`. Removal: 2.0.0.

### @dynamic-form-engine/react

**Added**

- `FormProvider` props `disabled`, `readOnly`, `disableWhileSubmitting`,
  `onReset`, and `onEvent`; `onDataSourceRefresh` receives the abort context.
- `useField` returns Core condition state (`visible`, `disabled`, `required`,
  `readOnly`); `useFormState(selector, equality?)` and `shallowEqual`.
- Public API report and packed-release verification, as for Core.

**Fixed**

- Conditionally hidden fields were rendered during server rendering and on the
  first client render; conditions now apply before the controllers mount.
- Field validation changed the provider context, re-rendering every consumer;
  inline callbacks recreated actions and, for `onDataSourceRefresh`, the Core
  controllers on every render.
- Form-level `disabled` and submitting state never reached field props.
- Object-returning `useFormState` selectors produced a new snapshot on every
  read; inline `useDataSource` configs refetched in a loop.
- Abort signals are passed to composed validators and dependency refreshes;
  validator failures reach `onError`.
- Invalid-submit focus follows document order and skips disabled or hidden
  controls; field state is read for either array-path spelling.
- Published declarations were unresolvable under `moduleResolution: nodenext`,
  and test declaration files were published.
- `FormProvider.submit()` without an `onSubmit` now validates and runs
  invalid-submit handling instead of returning immediately.

### @dynamic-form-engine/react-html and @dynamic-form-engine/html

**Added**

- `HtmlForm` `onError` for errors thrown by `onSubmit`.
- Public API report, and a release check covering every subpath in ESM,
  CommonJS, and bundler/Node ESM/Node CommonJS types for both packages.

**Fixed**

- `HtmlForm` submission now runs through the store: no submits while disabled
  or already submitting (including during async validation), `submitting` is
  set so controls lock, a `submit` event is emitted, and without an `onSubmit`
  prop it delegates to `FormProvider.submit()` instead of ignoring the
  provider's handler.
- Array fields subscribed to the whole form state and re-rendered on every
  change; they now subscribe only to their item errors. Array-item conditions
  now update when a referenced form field changes.
- Form-level `disabled` and `readOnly` now reach object and array fieldsets and
  array actions.
- `controls/text` imported the temporal helpers and cost 3.4 KB gzip against a
  2 KB budget; it is now 1.3 KB. The performance budgets now include shared
  chunks.
- `verify:react-html-release` could never pass (it expected `dist/index.mjs`).
- `HTML_ADAPTER_VERSION` reported `0.1.0`.
- Published declarations were unresolvable under `moduleResolution: nodenext`.
