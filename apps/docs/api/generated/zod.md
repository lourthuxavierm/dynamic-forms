# @dynamic-forms/zod API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Release-ready
- Source: TypeScript public exports
- Internal symbols: excluded

Release-ready validation-only adapter mapping Zod form and field issues into framework-neutral Core contracts.

Related: [guide](../../integrations/zod) · [controls/examples](../../project/zod-compatibility)

## Public exports

This page contains 20 exports. Signatures are regenerated from the package entry point.

### createZodFieldValidator

- Kind: function
- Source: `packages/zod/src/fieldValidator.ts`

Adapts one Zod schema to the Core Validator contract; Core associates its issue with the owning field.

```ts
export declare function createZodFieldValidator<TValue, TOutput = TValue>(schema: ZodSchemaLike<TValue, TOutput>, options?: ZodFieldValidatorOptions): Validator<TValue>
```

### createZodFormValidator

- Kind: function
- Source: `packages/zod/src/formValidator.ts`

Adapts a complete Zod object schema to the Core FormValidator contract; use this for cross-field and root rules.

```ts
export declare function createZodFormValidator<TValues extends Record<string, unknown>, TOutput = TValues>(schema: ZodSchemaLike<TValues, TOutput>, options?: ZodAdapterOptions): FormValidator<TValues>
```

### NormalizedZodIssue

- Kind: interface
- Source: `packages/zod/src/issues.ts`

Normalized issue mapping result with its Core field path and source issue.

```ts
export interface NormalizedZodIssue;
```

### normalizeZodIssue

- Kind: function
- Source: `packages/zod/src/issues.ts`

Public function exported by @dynamic-forms/zod.

```ts
export declare function normalizeZodIssue(issue: ZodIssueLike, rootErrorPath?: string): NormalizedZodIssue
```

### ZodAdapterOptions

- Kind: interface
- Source: `packages/zod/src/types.ts`

Options shared by issue mapping and form-level validation.

```ts
export interface ZodAdapterOptions;
```

### ZodErrorLike

- Kind: interface
- Source: `packages/zod/src/types.ts`

Minimum error surface consumed by the adapter.

```ts
export interface ZodErrorLike;
```

### ZodErrorMode

- Kind: type
- Source: `packages/zod/src/types.ts`

Public type exported by @dynamic-forms/zod.

```ts
export type ZodErrorMode;
```

### ZodFailure

- Kind: interface
- Source: `packages/zod/src/types.ts`

Public interface exported by @dynamic-forms/zod.

```ts
export interface ZodFailure;
```

### ZodFieldValidatorFactory

- Kind: type
- Source: `packages/zod/src/fieldValidator.ts`

Public type exported by @dynamic-forms/zod.

```ts
export type ZodFieldValidatorFactory;
```

### ZodFieldValidatorOptions

- Kind: type
- Source: `packages/zod/src/types.ts`

Options for reducing a field schema's issues to one Core issue.

```ts
export type ZodFieldValidatorOptions;
```

### ZodFormValidatorFactory

- Kind: type
- Source: `packages/zod/src/formValidator.ts`

Public type exported by @dynamic-forms/zod.

```ts
export type ZodFormValidatorFactory;
```

### ZodIssueLike

- Kind: interface
- Source: `packages/zod/src/types.ts`

Minimum issue surface consumed by the adapter across supported Zod majors.

```ts
export interface ZodIssueLike;
```

### zodIssuesToFormErrors

- Kind: function
- Source: `packages/zod/src/issues.ts`

Maps ordered Zod issues to Core field paths and deterministic first-or-all messages.

```ts
export declare function zodIssuesToFormErrors(issues: readonly ZodIssueLike[], options?: ZodAdapterOptions): FormErrors
```

### zodIssueToValidationIssue

- Kind: function
- Source: `packages/zod/src/issues.ts`

Public function exported by @dynamic-forms/zod.

```ts
export declare function zodIssueToValidationIssue(issue: ZodIssueLike): ValidationIssue
```

### ZodPathMapping

- Kind: interface
- Source: `packages/zod/src/paths.ts`

Public interface exported by @dynamic-forms/zod.

```ts
export interface ZodPathMapping;
```

### ZodPathSegment

- Kind: type
- Source: `packages/zod/src/types.ts`

A segment in a Zod issue path. Numeric segments represent array indexes.

```ts
export type ZodPathSegment;
```

### zodPathToFieldPath

- Kind: function
- Source: `packages/zod/src/paths.ts`

Maps Zod path segments to Core dot and bracket path notation.

```ts
export declare function zodPathToFieldPath(path: readonly ZodPathSegment[], rootErrorPath?: string): string
```

### ZodSafeParseResult

- Kind: type
- Source: `packages/zod/src/types.ts`

Public type exported by @dynamic-forms/zod.

```ts
export type ZodSafeParseResult;
```

### ZodSchemaLike

- Kind: interface
- Source: `packages/zod/src/types.ts`

Structural async schema contract. It avoids exposing a concrete Zod-major class in this package's declarations.

```ts
export interface ZodSchemaLike;
```

### ZodSuccess

- Kind: interface
- Source: `packages/zod/src/types.ts`

Public interface exported by @dynamic-forms/zod.

```ts
export interface ZodSuccess;
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

