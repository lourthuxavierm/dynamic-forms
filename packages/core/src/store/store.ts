import type {
  DynamicFormValues,
  EqualityFn,
  FormErrors,
  FormListener,
  FormSelector,
  FormState,
  SelectorListener,
  FormSubmitHandler,
  FormValidator,
  FormValues,
  ResetOptions,
  SetValueOptions,
} from './types';
import { FormEventEmitter, type FormEventListener, type FormEventType } from '../events';
import { deleteByPath, dynamicPath, getByPath, setByPath, type DynamicPath, type Path, type PathValue } from './paths';

interface SelectorSubscription<T extends FormValues> {
  selector: FormSelector<T, unknown>;
  listener: SelectorListener<unknown>;
  equality: EqualityFn<unknown>;
  selected: unknown;
}
export class FormStore<T extends FormValues = DynamicFormValues> {
  private state: FormState<T>;
  private readonly listeners = new Set<FormListener<T>>();
  private readonly fieldListeners = new Map<string, Set<FormListener<T>>>();
  private readonly selectorSubscriptions = new Set<SelectorSubscription<T>>();
  private readonly events = new FormEventEmitter<unknown, T>();
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

  getValue<TPath extends Path<T>>(path: TPath): PathValue<T, TPath>;
  getValue(path: DynamicPath): unknown;
  getValue(path: string): unknown {
    return getByPath(this.state.values, dynamicPath(path));
  }

  setValue<TPath extends Path<T>>(path: TPath, value: PathValue<T, TPath>, options?: SetValueOptions): void;
  setValue(path: DynamicPath, value: unknown, options?: SetValueOptions): void;
  setValue(path: string, value: unknown, options: SetValueOptions = {}): void {
    const previousValue = this.getValue(dynamicPath(path));
    if (Object.is(previousValue, value)) {
      return;
    }

    const values = setByPath(this.state.values, dynamicPath(path), value) as T;
    const dirty = updateDirtyState(
      this.state.dirty,
      path,
      value,
      getByPath(this.initialValues, dynamicPath(path)),
      options.shouldDirty,
    );
    const touched = options.shouldTouch
      ? { ...this.state.touched, [path]: true }
      : this.state.touched;

    this.updateState({ values, dirty, touched });
    this.events.emit({ type: 'valueChange', field: path, value, previousValue, payload: { values: this.state.values } });
    this.events.emit({ type: 'fieldChange', field: path, value, previousValue });
    this.notifyPaths([path]);
  }

  setValues(values: Partial<T>, options: SetValueOptions = {}): void {
    const entries = Object.entries(values);
    if (entries.length === 0) {
      return;
    }

    const previousValues = this.state.values;
    let nextValues = previousValues;
    let nextDirty = this.state.dirty;
    let nextTouched = this.state.touched;
    const changedPaths: string[] = [];

    for (const [path, value] of entries) {
      if (Object.is(getByPath(nextValues, dynamicPath(path)), value)) {
        continue;
      }

      nextValues = setByPath(nextValues, dynamicPath(path), value) as T;
      nextDirty = updateDirtyState(
        nextDirty,
        path,
        value,
        getByPath(this.initialValues, dynamicPath(path)),
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
    for (const path of changedPaths) {
      this.events.emit({ type: 'valueChange', field: path, value: getByPath(nextValues, dynamicPath(path)), previousValue: getByPath(previousValues, dynamicPath(path)), payload: { values: this.state.values } });
      this.events.emit({ type: 'fieldChange', field: path, value: getByPath(nextValues, dynamicPath(path)) });
    }
    this.notifyPaths(changedPaths);
  }

  setError<TPath extends Path<T>>(path: TPath, message: string): void;
  setError(path: DynamicPath, message: string): void;
  setError(path: string, message: string): void {
    this.updateState({
      errors: { ...this.state.errors, [path]: message },
      valid: false,
    });
    this.notifyPaths([path]);
  }

  clearError<TPath extends Path<T>>(path: TPath): void;
  clearError(path: DynamicPath): void;
  clearError(path: string): void {
    if (!(path in this.state.errors)) {
      return;
    }

    const errors = { ...this.state.errors };
    delete errors[path];
    this.updateState({ errors, valid: Object.keys(errors).length === 0 });
    this.notifyPaths([path]);
  }

  setTouched<TPath extends Path<T>>(path: TPath, touched?: boolean): void;
  setTouched(path: DynamicPath, touched?: boolean): void;
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
    this.events.emit({ type: 'validate', payload: { valid: this.state.valid, errors: this.state.errors, values: this.state.values } });
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
      const result = await onSubmit(this.getValues());
      this.events.emit({ type: 'submit', payload: { values: this.state.values, result } });
      return result;
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
    this.events.emit({ type: 'reset', payload: { values: this.state.values } });
    this.notifyAll();
  }

  resetField<TPath extends Path<T>>(path: TPath): void;
  resetField(path: DynamicPath): void;
  resetField(path: string): void {
    const values = setByPath(this.state.values, dynamicPath(path), getByPath(this.initialValues, dynamicPath(path))) as T;
    this.updateState({
      values,
      errors: removePath(this.state.errors, path),
      touched: removePath(this.state.touched, path),
      dirty: removePath(this.state.dirty, path),
      valid: Object.keys(removePath(this.state.errors, path)).length === 0,
    });
    this.notifyPaths([path]);
  }

  on(type: FormEventType, listener: FormEventListener<unknown, T>): () => void {
    return this.events.on(type, listener);
  }

  subscribe(listener: FormListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeSelector<TSelected>(
    selector: FormSelector<T, TSelected>,
    listener: SelectorListener<TSelected>,
    equality: EqualityFn<TSelected> = Object.is,
  ): () => void {
    const subscription: SelectorSubscription<T> = {
      selector: (state) => selector(state),
      listener: (selected, previous) => listener(selected as TSelected, previous as TSelected),
      equality: (left, right) => equality(left as TSelected, right as TSelected),
      selected: selector(this.state),
    };
    this.selectorSubscriptions.add(subscription);
    return () => this.selectorSubscriptions.delete(subscription);
  }

  subscribeToValue<TPath extends Path<T>>(
    path: TPath,
    listener: SelectorListener<PathValue<T, TPath>>,
    equality?: EqualityFn<PathValue<T, TPath>>,
  ): () => void;
  subscribeToValue(path: DynamicPath, listener: SelectorListener<unknown>, equality?: EqualityFn<unknown>): () => void;
  subscribeToValue(path: string, listener: SelectorListener<unknown>, equality: EqualityFn<unknown> = Object.is): () => void {
    return this.subscribeSelector(
      (state) => getByPath(state.values, dynamicPath(path)),
      listener,
      equality,
    );
  }

  subscribeToError<TPath extends Path<T>>(path: TPath, listener: SelectorListener<string | undefined>): () => void;
  subscribeToError(path: DynamicPath, listener: SelectorListener<string | undefined>): () => void;
  subscribeToError(path: string, listener: SelectorListener<string | undefined>): () => void {
    return this.subscribeSelector((state) => state.errors[path], listener);
  }

  subscribeToTouched<TPath extends Path<T>>(path: TPath, listener: SelectorListener<boolean>): () => void;
  subscribeToTouched(path: DynamicPath, listener: SelectorListener<boolean>): () => void;
  subscribeToTouched(path: string, listener: SelectorListener<boolean>): () => void {
    return this.subscribeSelector((state) => state.touched[path] ?? false, listener);
  }

  subscribeToDirty<TPath extends Path<T>>(path: TPath, listener: SelectorListener<boolean>): () => void;
  subscribeToDirty(path: DynamicPath, listener: SelectorListener<boolean>): () => void;
  subscribeToDirty(path: string, listener: SelectorListener<boolean>): () => void {
    return this.subscribeSelector((state) => state.dirty[path] ?? false, listener);
  }

  subscribeToField<TPath extends Path<T>>(path: TPath, listener: FormListener<T>): () => void;
  subscribeToField(path: DynamicPath, listener: FormListener<T>): () => void;
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
    for (const subscription of this.selectorSubscriptions) {
      const selected = subscription.selector(this.state);
      if (subscription.equality(subscription.selected, selected)) continue;
      const previous = subscription.selected;
      subscription.selected = selected;
      subscription.listener(selected, previous);
    }
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
  return deleteByPath(values, dynamicPath(path)) as Record<string, TValue>;
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
