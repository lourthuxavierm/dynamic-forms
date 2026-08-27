import type { FormStore, FormValues } from '../store';
import type { FieldSchema, FormSchema } from '../schema';
import type { FieldCondition } from './types';
import { evaluateCondition } from './evaluate';

export interface FieldConditionState {
  visible: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
}

export class ConditionController<T extends FormValues = FormValues> {
  private readonly fields = new Map<string, FieldSchema>();
  private readonly states = new Map<string, FieldConditionState>();
  private readonly dependencies = new Map<string, Set<string>>();
  private readonly listeners = new Set<() => void>();
  private readonly fieldListeners = new Map<string, Set<() => void>>();
  private readonly versions = new Map<string, number>();
  private readonly unsubscribers: Array<() => void>;
  private version = 0;

  constructor(private readonly store: FormStore<T>, schema: FormSchema, private readonly onChange?: (path: string, state: FieldConditionState) => void) {
    collectFields(schema.fields, '', this.fields);
    for (const [path, field] of this.fields) {
      for (const dependency of collectConditionDependencies(field)) {
        const dependents = this.dependencies.get(dependency) ?? new Set<string>();
        dependents.add(path);
        this.dependencies.set(dependency, dependents);
      }
    }
    this.recalculate(this.fields.keys());
    this.unsubscribers = [
      store.on('valueChange', (event) => this.recalculate(this.getAffectedFields(event.field))),
      store.on('reset', () => this.recalculate(this.fields.keys(), true)),
    ];
  }

  getState(path: string): FieldConditionState | undefined { return this.states.get(path); }
  getVersion(path?: string): number { return path ? this.versions.get(path) ?? 0 : this.version; }
  subscribe(listener: () => void): () => void;
  subscribe(path: string, listener: () => void): () => void;
  subscribe(pathOrListener: string | (() => void), maybeListener?: () => void): () => void {
    if (typeof pathOrListener === 'function') {
      this.listeners.add(pathOrListener);
      return () => this.listeners.delete(pathOrListener);
    }
    const listener = maybeListener!;
    const listeners = this.fieldListeners.get(pathOrListener) ?? new Set<() => void>();
    listeners.add(listener);
    this.fieldListeners.set(pathOrListener, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.fieldListeners.delete(pathOrListener);
    };
  }
  dispose(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.listeners.clear();
    this.fieldListeners.clear();
  }

  private getAffectedFields(changedPath?: string): Iterable<string> {
    if (!changedPath) return this.fields.keys();
    const affected = new Set<string>();
    for (const [dependency, targets] of this.dependencies) {
      if (pathsOverlap(dependency, changedPath)) for (const target of targets) affected.add(target);
    }
    return affected;
  }

  private recalculate(paths: Iterable<string>, enforceHiddenPolicy = false): void {
    const values = this.store.getValues();
    const hiddenActions: Array<() => void> = [];
    for (const path of paths) {
      const field = this.fields.get(path);
      if (!field) continue;
      const next: FieldConditionState = {
        visible: field.visibleWhen ? evaluateCondition(field.visibleWhen, values) : true,
        disabled: Boolean(field.disabled || (field.disabledWhen && evaluateCondition(field.disabledWhen, values))),
        required: Boolean(field.validation?.required || (field.requiredWhen && evaluateCondition(field.requiredWhen, values))),
        readOnly: Boolean(field.readOnly || (field.readOnlyWhen && evaluateCondition(field.readOnlyWhen, values))),
      };
      const previous = this.states.get(path);
      const changed = !previous || Object.keys(next).some((key) => next[key as keyof FieldConditionState] !== previous[key as keyof FieldConditionState]);
      if (changed) {
        this.states.set(path, next);
        this.version += 1;
        this.versions.set(path, (this.versions.get(path) ?? 0) + 1);
        this.onChange?.(path, next);
        for (const listener of this.fieldListeners.get(path) ?? []) listener();
        for (const listener of this.listeners) listener();
      }
      if (!next.visible && (changed || enforceHiddenPolicy)) {
        if (field.hiddenValuePolicy === 'clear' && this.store.getValue(path) !== undefined) hiddenActions.push(() => this.store.setValue(path, undefined));
        if (field.hiddenValuePolicy === 'reset') hiddenActions.push(() => this.store.resetField(path));
      }
    }
    for (const action of hiddenActions) action();
  }
}

function collectFields(fields: readonly FieldSchema[], parent: string, target: Map<string, FieldSchema>): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    target.set(path, field);
    if (field.fields) collectFields(field.fields, path, target);
  }
}

function collectConditionDependencies(field: FieldSchema): Set<string> {
  const result = new Set<string>();
  for (const condition of [field.visibleWhen, field.disabledWhen, field.requiredWhen, field.readOnlyWhen]) collectReferences(condition, result);
  return result;
}

function collectReferences(condition: FieldCondition | undefined, target: Set<string>): void {
  if (!condition) return;
  if ('field' in condition) {
    target.add(condition.field);
    return;
  }
  for (const nested of condition.and ?? []) collectReferences(nested, target);
  for (const nested of condition.or ?? []) collectReferences(nested, target);
  collectReferences(condition.not, target);
}

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}.`) || right.startsWith(`${left}.`);
}
