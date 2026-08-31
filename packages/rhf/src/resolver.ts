import {
  createFieldValidators,
  evaluateCondition,
  getByPath,
  validateField,
  type FieldSchema,
  type FormErrors,
  type FormSchema,
  type FormValidator,
  type ValidationIssue,
} from '@dynamic-form-engine/core';
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverResult,
} from 'react-hook-form';

export type RHFErrorInput = Readonly<Record<string, string | ValidationIssue | readonly ValidationIssue[]>>;

export interface CreateRHFResolverOptions<TFieldValues extends FieldValues> {
  formValidator?: FormValidator<TFieldValues>;
  rootErrorPath?: string;
}

/** Converts flat Core paths into RHF's nested object/array error structure. */
export function toRHFErrors<TFieldValues extends FieldValues = FieldValues>(input: RHFErrorInput): FieldErrors<TFieldValues> {
  const output: Record<string, unknown> = {};
  for (const [path, source] of Object.entries(input)) {
    const issues = normalizeIssues(source);
    if (!issues.length) continue;
    setNestedError(output, path, toFieldError(issues));
  }
  return output as FieldErrors<TFieldValues>;
}

/** Creates a code-preserving, nested-error RHF resolver from a Dynamic Forms schema. */
export function createRHFResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: FormSchema,
  options: CreateRHFResolverOptions<TFieldValues> = {},
): Resolver<TFieldValues> {
  let generation = 0;
  let latestTask: Promise<ResolverResult<TFieldValues>> | undefined;

  return async (values, _context, resolverOptions) => {
    const run = ++generation;
    const task = resolveValues(schema, values, options, resolverOptions.criteriaMode === 'all');
    latestTask = task;
    const result = await task;
    if (run === generation) return result;
    return latestTask;
  };
}

async function resolveValues<TFieldValues extends FieldValues>(
  schema: FormSchema,
  values: TFieldValues,
  options: CreateRHFResolverOptions<TFieldValues>,
  collectAll: boolean,
): Promise<ResolverResult<TFieldValues>> {
  const issues: Record<string, ValidationIssue[]> = {};
  await validateFields(schema.fields, '', values, issues, collectAll);

  if (options.formValidator) {
    const formErrors = await options.formValidator(values);
    mergeFormErrors(issues, formErrors, options.rootErrorPath ?? 'root');
  }

  if (Object.keys(issues).length === 0) return { values, errors: {} };
  return { values: {}, errors: toRHFErrors<TFieldValues>(issues) };
}

async function validateFields(
  fields: readonly FieldSchema[],
  parentPath: string,
  values: FieldValues,
  output: Record<string, ValidationIssue[]>,
  collectAll: boolean,
): Promise<void> {
  for (const field of fields) {
    const path = parentPath ? `${parentPath}.${field.name}` : field.name;
    if (field.visibleWhen && !evaluateCondition(field.visibleWhen, values)) continue;
    if (field.disabled || (field.disabledWhen && evaluateCondition(field.disabledWhen, values))) continue;
    const value = getByPath(values, path);
    const conditionallyRequired = field.requiredWhen ? evaluateCondition(field.requiredWhen, values) : false;
    const result = await validateField(
      path,
      value,
      values,
      createFieldValidators(field, { required: Boolean(field.validation?.required || conditionallyRequired) }),
    );
    if (!result.valid) {
      output[path] = result.errors
        .slice(0, collectAll ? undefined : 1)
        .map(({ code, message }) => ({ code, message }));
    }

    if (!field.fields) continue;
    if (field.type === 'array' && Array.isArray(value)) {
      await Promise.all(value.map((_, index) => validateFields(field.fields!, `${path}.${index}`, values, output, collectAll)));
    } else {
      await validateFields(field.fields, path, values, output, collectAll);
    }
  }
}

function mergeFormErrors(output: Record<string, ValidationIssue[]>, errors: FormErrors, rootPath: string): void {
  for (const [rawPath, message] of Object.entries(errors)) {
    const path = rawPath || rootPath;
    const issue = { code: 'custom', message };
    output[path] = output[path] ? [...output[path], issue] : [issue];
  }
}

function normalizeIssues(source: string | ValidationIssue | readonly ValidationIssue[]): ValidationIssue[] {
  if (typeof source === 'string') return [{ code: 'custom', message: source }];
  return Array.isArray(source) ? [...source] : [source as ValidationIssue];
}

function toFieldError(issues: readonly ValidationIssue[]): FieldError {
  const first = issues[0];
  const types = issues.length > 1
    ? Object.fromEntries(issues.map((issue, index) => [uniqueCode(issues, issue.code, index), issue.message]))
    : undefined;
  return { type: first.code, message: first.message, ...(types ? { types } : {}) };
}

function uniqueCode(issues: readonly ValidationIssue[], code: string, index: number): string {
  return issues.findIndex((issue) => issue.code === code) === index ? code : `${code}.${index}`;
}

function setNestedError(target: Record<string, unknown>, path: string, error: FieldError): void {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  if (!segments.length || segments.some(isUnsafeSegment)) return;
  let current: Record<string, unknown> | unknown[] = target;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const last = index === segments.length - 1;
    if (last) {
      (current as any)[segment] = error;
      return;
    }
    const nextIsIndex = /^\d+$/.test(segments[index + 1]);
    const existing = (current as any)[segment] as unknown;
    if (!existing || typeof existing !== 'object') {
      (current as any)[segment] = nextIsIndex ? [] : {};
    }
    current = (current as any)[segment] as Record<string, unknown> | unknown[];
  }
}

function isUnsafeSegment(segment: string): boolean {
  return segment === '__proto__' || segment === 'prototype' || segment === 'constructor';
}