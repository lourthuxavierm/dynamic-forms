import type { DynamicFormValues, DynamicPath, FormValues, Path } from '@dynamic-form-engine/core';

/** Dot and bracket paths accepted by typed React form hooks. */
export type FieldPath<TValues extends FormValues = DynamicFormValues> = Path<TValues>;

/** Explicitly typed or runtime-branded paths accepted by schema-driven hooks. */
export type TypedFieldPath<TValues extends FormValues> = Path<TValues> | DynamicPath;