import type {
  FormEvent,
  FormEventListener,
  FormEventType
} from "./types";

export class FormEventEmitter {
  private readonly listeners = new Map<
    FormEventType,
    Set<FormEventListener>
  >();

  on(
    type: FormEventType,
    listener: FormEventListener
  ): () => void {
    let listeners = this.listeners.get(type);

    if (!listeners) {
      listeners = new Set<FormEventListener>();
      this.listeners.set(type, listeners);
    }

    listeners.add(listener);

    return () => {
      listeners?.delete(listener);

      if (listeners?.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  emit(event: FormEvent): void {
    const listeners = this.listeners.get(event.type);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
