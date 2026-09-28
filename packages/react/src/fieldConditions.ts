import {
  evaluateCondition,
  isSamePath,
  normalizePath,
  parsePath,
  type FieldConditionState,
  type FieldSchema,
  type FormErrors,
  type FormSchema,
} from '@dynamic-form-engine/core';
import { findFieldByPath } from './schemaPaths';

export const DEFAULT_CONDITION_STATE: Readonly<FieldConditionState> = Object.freeze({ visible: true, disabled: false, required: false, readOnly: false });

/** Reads a path-keyed state record, matching `items[0]` and `items.0` spellings. */
export function readPathRecord<TValue>(record: Readonly<Record<string, TValue>>, path: string): TValue | undefined {
  if (Object.prototype.hasOwnProperty.call(record, path)) return record[path];
  for (const key in record) if (isSamePath(key, path)) return record[key];
  return undefined;
}

/**
 * Condition state computed purely from the schema and current values. Used for
 * the first render and server rendering, before the provider's
 * `ConditionController` is mounted, so hidden fields are never rendered even
 * momentarily. Mirrors the controller: fields inside array items have no
 * per-item condition state.
 */
export function evaluateFieldConditions(schema: FormSchema | undefined, path: string, values: object): Readonly<FieldConditionState> {
  if (!schema) return DEFAULT_CONDITION_STATE;
  const field: FieldSchema | undefined = findFieldByPath(schema.fields, path);
  if (!field || /(^|\.)\d+(\.|$)/.test(normalizePath(path))) return DEFAULT_CONDITION_STATE;
  return {
    visible: field.visibleWhen ? evaluateCondition(field.visibleWhen, values) : true,
    disabled: Boolean(field.disabled || (field.disabledWhen && evaluateCondition(field.disabledWhen, values))),
    required: Boolean(field.validation?.required || (field.requiredWhen && evaluateCondition(field.requiredWhen, values))),
    readOnly: Boolean(field.readOnly || (field.readOnlyWhen && evaluateCondition(field.readOnlyWhen, values))),
  };
}

/**
 * True when the field at `path`, or any ancestor object/array field, is hidden
 * by `visibleWhen` for these values. Paths that are not schema fields (for
 * example a root `_form` error) are never hidden.
 */
export function isHiddenPath(schema: FormSchema | undefined, path: string, values: object): boolean {
  if (!schema) return false;
  const segments = parsePath(path);
  for (let length = 1; length <= segments.length; length += 1) {
    if (!evaluateFieldConditions(schema, segments.slice(0, length).join('.'), values).visible) return true;
  }
  return false;
}

/** Drops errors for hidden fields, matching Core's schema validator, which skips them. */
export function withoutHiddenFieldErrors(errors: FormErrors, schema: FormSchema | undefined, values: object): FormErrors {
  if (!schema) return errors;
  const visible: FormErrors = {};
  for (const [path, message] of Object.entries(errors)) if (!isHiddenPath(schema, path, values)) visible[path] = message;
  return visible;
}
