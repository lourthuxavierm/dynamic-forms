import { computed, signal, type Signal, type WritableSignal } from '@angular/core';
import {
  ConditionController, DependencyController, FormStore, createFormValidator,
  type FormEvent, type FormEventType, type FormSchema, type FormState,
  type FormSubmitHandler, type FormValues,
} from '@dynamic-forms/core';
import { Observable } from 'rxjs';

export interface DynamicFormOptions<T extends FormValues = FormValues> {
  schema: FormSchema;
  defaultValues?: T;
  store?: FormStore<T>;
  onSubmit?: FormSubmitHandler<T>;
}

export interface DynamicFieldSignals<T = unknown> {
  value: Signal<T>;
  error: Signal<string | undefined>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  visible: Signal<boolean>;
  disabled: Signal<boolean>;
  required: Signal<boolean>;
  readOnly: Signal<boolean>;
  setValue(value: T): void;
  setTouched(touched?: boolean): void;
  reset(): void;
}

export class DynamicFormFacade<T extends FormValues = FormValues> {
  readonly store: FormStore<T>;
  readonly schema: FormSchema;
  readonly state: Signal<FormState>;
  readonly values: Signal<Readonly<T>>;
  readonly valid: Signal<boolean>;
  readonly submitting: Signal<boolean>;
  readonly events$: Observable<FormEvent>;

  private readonly stateSignal: WritableSignal<FormState>;
  private readonly conditionVersion = signal(0);
  private readonly conditions: ConditionController<T>;
  private readonly dependencies: DependencyController<T>;
  private readonly unsubscribeState: () => void;
  private disposed = false;

  constructor(private readonly options: DynamicFormOptions<T>) {
    this.schema = options.schema;
    this.store = options.store ?? new FormStore<T>(options.defaultValues);
    this.stateSignal = signal(this.store.getState());
    this.state = this.stateSignal.asReadonly();
    this.values = computed(() => this.stateSignal().values as Readonly<T>);
    this.valid = computed(() => this.stateSignal().valid);
    this.submitting = computed(() => this.stateSignal().submitting);
    this.conditions = new ConditionController(this.store, this.schema);
    this.dependencies = new DependencyController(this.store, this.schema);
    this.unsubscribeState = this.store.subscribe((state) => {
      this.stateSignal.set(state);
      this.conditionVersion.update((value) => value + 1);
    });
    this.events$ = new Observable<FormEvent>((subscriber) => {
      const eventTypes: readonly FormEventType[] = ['valueChange', 'validate', 'submit', 'reset'];
      const removers = eventTypes.map((type) => this.store.on(type, (event) => subscriber.next(event)));
      return () => removers.forEach((remove) => remove());
    });
  }

  field<TValue = unknown>(path: string): DynamicFieldSignals<TValue> {
    const condition = () => {
      this.conditionVersion();
      return this.conditions.getState(path);
    };
    return {
      value: computed(() => this.store.getValue(path) as TValue),
      error: computed(() => this.stateSignal().errors[path]),
      touched: computed(() => this.stateSignal().touched[path] ?? false),
      dirty: computed(() => this.stateSignal().dirty[path] ?? false),
      visible: computed(() => condition()?.visible ?? true),
      disabled: computed(() => condition()?.disabled ?? false),
      required: computed(() => condition()?.required ?? false),
      readOnly: computed(() => condition()?.readOnly ?? false),
      setValue: (value) => this.store.setValue(path, value),
      setTouched: (touched = true) => this.store.setTouched(path, touched),
      reset: () => this.store.resetField(path),
    };
  }

  setValue(path: string, value: unknown): void { this.store.setValue(path, value); }
  setValues(values: Partial<T>): void { this.store.setValues(values); }
  reset(): void { this.store.reset(); }
  resetField(path: string): void { this.store.resetField(path); }
  validate(): Promise<boolean> { return this.store.validate(createFormValidator(this.schema)); }
  async submit<TResult = unknown>(): Promise<TResult | undefined> {
    if (!this.options.onSubmit) return undefined;
    return this.store.submit(this.options.onSubmit as FormSubmitHandler<T, TResult>, createFormValidator(this.schema));
  }
  on(type: FormEventType, listener: (event: FormEvent) => void): () => void { return this.store.on(type, listener); }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribeState();
    this.conditions.dispose();
    this.dependencies.dispose();
  }
}

export function createDynamicForm<T extends FormValues = FormValues>(options: DynamicFormOptions<T>): DynamicFormFacade<T> {
  return new DynamicFormFacade(options);
}
