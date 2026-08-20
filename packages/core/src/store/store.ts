export type FormValues = Record<string, unknown>;

export interface FormState {
  values: FormValues;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  submitting: boolean;
}

export type FormListener = (state: FormState) => void;

export class FormStore {
  private state: FormState;
  private readonly listeners = new Set<FormListener>();

  constructor(initialValues: FormValues = {}) {
    this.state = {
      values: { ...initialValues },
      errors: {},
      touched: {},
      dirty: {},
      submitting: false
    };
  }

  getState(): FormState {
    return this.state;
  }

  getValue(name: string): unknown {
    return this.state.values[name];
  }

  setValue(name: string, value: unknown): void {
    const previousValue = this.state.values[name];

    this.state = {
      ...this.state,
      values: {
        ...this.state.values,
        [name]: value
      },
      dirty: {
        ...this.state.dirty,
        [name]: previousValue !== value
      }
    };

    this.notify();
  }

  setError(name: string, message: string): void {
    this.state = {
      ...this.state,
      errors: {
        ...this.state.errors,
        [name]: message
      }
    };

    this.notify();
  }

  clearError(name: string): void {
    const errors = { ...this.state.errors };
    delete errors[name];

    this.state = {
      ...this.state,
      errors
    };

    this.notify();
  }

  setTouched(name: string, touched = true): void {
    this.state = {
      ...this.state,
      touched: {
        ...this.state.touched,
        [name]: touched
      }
    };

    this.notify();
  }

  subscribe(listener: FormListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
