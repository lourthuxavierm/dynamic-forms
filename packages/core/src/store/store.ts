import type {
  FormErrors,
  FormListener,
  FormState,
  FormSubmitHandler,
  FormValidator,
  FormValues,
  ResetOptions,
  SetValueOptions,
} from './types';
import { deleteByPath, getByPath, setByPath } from './paths';

export class FormStore<T extends FormValues = FormValues> {
  private state: FormState<T>;
  private readonly listeners = new Set<FormListener<T>>();
  private readonly fieldListeners = new Map<string, Set<FormListener<T>>>();
  private initialValues: T;

  constructor(initialValues: T = {} as T) {
    this.initialValues = clone(initialValues);
    this.state = createState(this.initialValues);
  }

  getState(): FormState<T> {
    return this.state;
  }

  getValues(): T {
    return this.state.values;
  }

  getValue(path: string): unknown {
    return getByPath(this.state.values, path);
  }

  setValue(path: string, value: unknown, options: SetValueOptions = {}): void {
    if (Object.is(this.getValue(path), value)) {
      return;
    }

    const values = setByPath(this.state.values, path, value) as T;
    const dirty = updateDirtyState(
      this.state.dirty,
      path,
      value,
      getByPath(this.initialValues, path),
      options.shouldDirty,
    );
    const touched = options.shouldTouch
      ? { ...this.state.touched, [path]: true }
      : this.state.touched;

    this.updateState({ values, dirty, touched });
    this.notifyPaths([path]);
  }

  setValues(values: Partial<T>, options: SetValueOptions = {}): void {
    const entries = Object.entries(values);
    if (entries.length === 0) {
      return;
    }

    let nextValues = this.state.values;
    let nextDirty = this.state.dirty;
    let nextTouched = this.state.touched;
    const changedPaths: string[] = [];

    for (const [path, value] of entries) {
      if (Object.is(getByPath(nextValues, path), value)) {
        continue;
      }

      nextValues = setByPath(nextValues, path, value) as T;
      nextDirty = updateDirtyState(
        nextDirty,
        path,
        value,
        getByPath(this.initialValues, path),
        options.shouldDirty,
      );
      if (options.shouldTouch) {
        nextTouched = { ...nextTouched, [path]: true };
      }
      changedPaths.push(path);
    }

    if (changedPaths.length === 0) {
      return;
    }

    this.updateState({
      values: nextValues,
      dirty: nextDirty,
      touched: nextTouched,
    });
    this.notifyPaths(changedPaths);
  }

  setError(path: string, message: string): void {
    this.updateState({
      errors: { ...this.state.errors, [path]: message },
      valid: false,
    });
    this.notifyPaths([path]);
  }

  clearError(path: string): void {
    if (!(path in this.state.errors)) {
      return;
    }

    const errors = { ...this.state.errors };
    delete errors[path];
    this.updateState({ errors, valid: Object.keys(errors).length === 0 });
    this.notifyPaths([path]);
  }

  setTouched(path: string, touched = true): void {
    if (this.state.touched[path] === touched) {
      return;
    }

    this.updateState({ touched: { ...this.state.touched, [path]: touched } });
    this.notifyPaths([path]);
  }

  setDisabled(disabled: boolean): void {
    if (this.state.disabled === disabled) return;
    this.updateState({ disabled });
    this.notify();
  }

  setLoading(loading: boolean): void {
    if (this.state.loading === loading) return;
    this.updateState({ loading });
    this.notify();
  }

  setSubmitting(submitting: boolean): void {
    if (this.state.submitting === submitting) return;
    this.updateState({ submitting });
    this.notify();
  }

  async validate(validator: FormValidator<T>): Promise<boolean> {
    const errors = await validator(this.getValues());
    this.updateState({ errors: { ...errors }, valid: Object.keys(errors).length === 0 });
    this.notifyAll();
    return this.state.valid;
  }

  async submit<TResult>(
    onSubmit: FormSubmitHandler<T, TResult>,
    validator?: FormValidator<T>,
  ): Promise<TResult | undefined> {
    if (this.state.submitting || this.state.disabled) {
      return undefined;
    }

    if (validator && !(await this.validate(validator))) {
      return undefined;
    }

    this.setSubmitting(true);
    try {
      return await onSubmit(this.getValues());
    } finally {
      this.setSubmitting(false);
    }
  }

  reset(newInitialValues?: T, options: ResetOptions = {}): void {
    if (newInitialValues) {
      this.initialValues = clone(newInitialValues);
    }

    this.updateState({
      values: options.keepValues ? this.state.values : clone(this.initialValues),
      errors: options.keepErrors ? this.state.errors : {},
      touched: options.keepTouched ? this.state.touched : {},
      dirty: options.keepDirty ? this.state.dirty : {},
      valid: options.keepErrors ? this.state.valid : true,
      submitting: false,
      loading: false,
    });
    this.notifyAll();
  }

  resetField(path: string): void {
    const values = setByPath(this.state.values, path, getByPath(this.initialValues, path)) as T;
    this.updateState({
      values,
      errors: removePath(this.state.errors, path),
      touched: removePath(this.state.touched, path),
      dirty: removePath(this.state.dirty, path),
      valid: Object.keys(removePath(this.state.errors, path)).length === 0,
    });
    this.notifyPaths([path]);
  }

  subscribe(listener: FormListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToField(path: string, listener: FormListener<T>): () => void {
    let listeners = this.fieldListeners.get(path);
    if (!listeners) {
      listeners = new Set();
      this.fieldListeners.set(path, listeners);
    }
    listeners.add(listener);

    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) this.fieldListeners.delete(path);
    };
  }

  private updateState(patch: Partial<FormState<T>>): void {
    this.state = freezeState({ ...this.state, ...patch });
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.state);
  }

  private notifyPaths(paths: string[]): void {
    this.notify();
    const notified = new Set<FormListener<T>>();
    for (const path of paths) {
      for (const affectedPath of getAffectedPaths(path)) {
        for (const listener of this.fieldListeners.get(affectedPath) ?? []) {
          notified.add(listener);
        }
      }
    }
    for (const listener of notified) listener(this.state);
  }

  private notifyAll(): void {
    this.notify();
    const notified = new Set<FormListener<T>>();
    for (const listeners of this.fieldListeners.values()) {
      for (const listener of listeners) notified.add(listener);
    }
    for (const listener of notified) listener(this.state);
  }
}

function createState<T extends FormValues>(initialValues: T): FormState<T> {
  return freezeState({
    values: clone(initialValues),
    errors: {},
    touched: {},
    dirty: {},
    valid: true,
    submitting: false,
    disabled: false,
    loading: false,
  });
}

function updateDirtyState(
  dirty: Record<string, boolean>,
  path: string,
  value: unknown,
  initialValue: unknown,
  shouldDirty: boolean | undefined,
): Record<string, boolean> {
  if (shouldDirty === false) return dirty;
  if (Object.is(value, initialValue)) return removePath(dirty, path);
  return { ...dirty, [path]: true };
}

function removePath<TValue>(values: Record<string, TValue>, path: string): Record<string, TValue> {
  return deleteByPath(values, path) as Record<string, TValue>;
}

function getAffectedPaths(path: string): string[] {
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalized.split('.').filter(Boolean);
  const affectedPaths = new Set([path, normalized]);
  while (parts.length > 1) {
    parts.pop();
    affectedPaths.add(parts.join('.'));
  }
  return [...affectedPaths];
}

function clone<TValue>(value: TValue): TValue {
  return structuredClone(value);
}

function freezeState<T extends FormValues>(state: FormState<T>): FormState<T> {
  deepFreeze(state.values);
  deepFreeze(state.errors);
  deepFreeze(state.touched);
  deepFreeze(state.dirty);
  return Object.freeze(state);
}

function deepFreeze<TValue>(value: TValue, seen = new WeakSet<object>()): TValue {
  if (value === null || typeof value !== 'object' || seen.has(value)) {
    return value;
  }

  seen.add(value);
  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue, seen);
  }
  return Object.freeze(value);
}
