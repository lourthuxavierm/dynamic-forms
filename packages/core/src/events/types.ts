export type FormEventType = 'valueChange' | 'fieldChange' | 'submit' | 'reset' | 'validate';

export interface FormEvent<T = unknown> {
  type: FormEventType;
  field?: string;
  value?: T;
  previousValue?: T;
  payload?: unknown;
}

export type FormEventListener = (event: FormEvent) => void;
