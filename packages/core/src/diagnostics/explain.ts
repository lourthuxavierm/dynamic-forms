import { explainCondition, type ExplainConditionOptions, type FieldCondition, type FieldConditionState } from '../conditions';
import type { DataSourceResult } from '../datasource';
import type { CompiledFormSchema, NormalizedFieldSchema } from '../schema';
import { dynamicPath, getByPath, isSamePath, normalizePath, type FormErrors } from '../store';
import { createFieldValidators, type ValidationIssue } from '../validation';
import type { DiagnosticsRecorder } from './recorder';
import type {
  FieldDataSourceExplanation,
  FieldFlagExplanation,
  FieldFlagReason,
  FieldStateExplanation,
  FieldValidationExplanation,
} from './types';

export interface FieldStateExplanationInput {
  readonly path: string;
  readonly compiled: CompiledFormSchema;
  readonly values: object;
  readonly errors: Readonly<FormErrors>;
  readonly conditionState?: Readonly<FieldConditionState>;
  readonly dataSourceState?: Readonly<DataSourceResult>;
  readonly recorder: DiagnosticsRecorder;
  readonly includeValues: boolean;
}

const EMPTY: readonly string[] = Object.freeze([]);

export function buildFieldStateExplanation(input: FieldStateExplanationInput): FieldStateExplanation {
  const { path, compiled, values, recorder } = input;
  const canonical = normalizePath(path);
  const field = compiled.fieldsByPath.get(canonical);
  const conditionOptions: ExplainConditionOptions = { includeValues: input.includeValues };

  const visible = conditional(field?.visibleWhen, 'visibleWhen', true, values, conditionOptions);
  const disabled = field?.disabled ? flag(true, 'static') : conditional(field?.disabledWhen, 'disabledWhen', false, values, conditionOptions);
  const readOnly = field?.readOnly ? flag(true, 'static') : conditional(field?.readOnlyWhen, 'readOnlyWhen', false, values, conditionOptions);
  const required = field?.validation.required ? flag(true, 'validation.required') : conditional(field?.requiredWhen, 'requiredWhen', false, values, conditionOptions);

  return Object.freeze({
    path: canonical,
    exists: field !== undefined,
    // The condition controller is the source of truth for flag values; the
    // explanation re-derives the reason from the same schema and values.
    visible: withValue(visible, input.conditionState?.visible),
    disabled: withValue(disabled, input.conditionState?.disabled),
    readOnly: withValue(readOnly, input.conditionState?.readOnly),
    required: withValue(required, input.conditionState?.required),
    validation: explainValidation(field, path, values, input.errors, input.conditionState?.required ?? required.value, input.conditionState?.visible ?? visible.value),
    dependencies: Object.freeze({
      dependsOn: compiled.dependencyGraph.dependenciesByField.get(canonical) ?? EMPTY,
      dependents: compiled.dependencyGraph.dependentsByField.get(canonical) ?? EMPTY,
      ...optional('lastRefresh', recorder.latest('dependencyRefresh', canonical)),
    }),
    ...(field?.dataSource ? { dataSource: explainDataSource(canonical, input.dataSourceState, recorder) } : {}),
    ...optional('lastConditionChange', recorder.latest('conditionChange', canonical)),
  });
}

function conditional(condition: FieldCondition | undefined, reason: FieldFlagReason, fallback: boolean, values: object, options: ExplainConditionOptions): FieldFlagExplanation {
  if (!condition) return flag(fallback, 'default');
  const result = explainCondition(condition, values, options);
  return Object.freeze({ value: result.result, reason, condition: result });
}

function flag(value: boolean, reason: FieldFlagReason): FieldFlagExplanation {
  return Object.freeze({ value, reason });
}

function withValue(explanation: FieldFlagExplanation, actual: boolean | undefined): FieldFlagExplanation {
  return actual === undefined || actual === explanation.value ? explanation : Object.freeze({ ...explanation, value: actual });
}

function explainValidation(field: NormalizedFieldSchema | undefined, path: string, values: object, errors: Readonly<FormErrors>, required: boolean, visible: boolean): FieldValidationExplanation {
  const error = lookupError(errors, path);
  if (!field) {
    return Object.freeze({ ...optional('error', error), ...(error !== undefined ? { source: 'external' as const } : {}), rules: EMPTY, failingRules: EMPTY, skippedBecauseHidden: false });
  }
  const value = getByPath(values, dynamicPath(path));
  const issues: ValidationIssue[] = [];
  for (const validator of createFieldValidators(field, { required })) {
    const result = validator(value, values as Record<string, unknown>);
    // Built-in schema validators are synchronous; anything async is left to validate().
    if (!result || result instanceof Promise) continue;
    issues.push(typeof result === 'string' ? { code: 'custom', message: result } : result);
  }
  const producer = error === undefined ? undefined : issues.find((issue) => issue.message === error);
  return Object.freeze({
    ...optional('error', error),
    ...(error === undefined ? {} : { source: producer ? 'schema' as const : 'external' as const }),
    ...optional('rule', producer?.code),
    rules: Object.freeze(configuredRules(field, required)),
    failingRules: Object.freeze(issues.map((issue) => issue.code)),
    skippedBecauseHidden: !visible,
  });
}

function configuredRules(field: NormalizedFieldSchema, required: boolean): string[] {
  const rules: string[] = [];
  const validation = field.validation;
  if (required) rules.push('required');
  for (const rule of ['minLength', 'maxLength', 'min', 'max', 'pattern', 'multipleOf', 'minItems', 'maxItems'] as const) {
    if (validation[rule] !== undefined) rules.push(rule);
  }
  if (validation.uniqueItems) rules.push('uniqueItems');
  return rules;
}

function explainDataSource(path: string, state: Readonly<DataSourceResult> | undefined, recorder: DiagnosticsRecorder): FieldDataSourceExplanation {
  const lastDiscarded = recorder.latest('dataSourceRequest', path, (event) => event.phase === 'stale' || event.phase === 'cancelled');
  if (!state) return Object.freeze({ status: 'idle', loading: false, ...optional('lastDiscarded', lastDiscarded) });
  return Object.freeze({
    status: state.status ?? (state.loading ? 'loading' : 'idle'),
    loading: state.loading,
    ...optional('requestId', state.requestId),
    ...(state.loading && state.requestId !== undefined ? { activeRequestId: state.requestId } : {}),
    ...optional('error', state.error?.message),
    ...optional('lastDiscarded', lastDiscarded),
  });
}

function lookupError(errors: Readonly<FormErrors>, path: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(errors, path)) return errors[path];
  for (const [key, message] of Object.entries(errors)) if (isSamePath(key, path)) return message;
  return undefined;
}

function optional<TKey extends string, TValue>(key: TKey, value: TValue | undefined): { [K in TKey]?: TValue } {
  return (value === undefined ? {} : { [key]: value }) as { [K in TKey]?: TValue };
}
