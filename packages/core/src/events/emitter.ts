import type { DynamicFormValues, FormValues } from '../store/types';
import type { FormEvent, FormEventListener, FormEventType } from './types';

export class FormEventEmitter<
  TValue = unknown,
  TValues extends FormValues = DynamicFormValues,
  TResult = unknown,
> {
  private readonly listeners = new Map<
    FormEventType,
    Set<FormEventListener<TValue, TValues, TResult>>
  >();

  on(
    type: FormEventType,
    listener: FormEventListener<TValue, TValues, TResult>,
  ): () => void {
    let listeners = this.listeners.get(type);

    if (!listeners) {
      listeners = new Set<FormEventListener<TValue, TValues, TResult>>();
      this.listeners.set(type, listeners);
    }

    listeners.add(listener);
    return () => {
      listeners?.delete(listener);
      if (listeners?.size === 0) this.listeners.delete(type);
    };
  }

  emit(event: FormEvent<TValue, TValues, TResult>): void {
    const listeners = this.listeners.get(event.type);
    if (!listeners) return;
    for (const listener of listeners) listener(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}