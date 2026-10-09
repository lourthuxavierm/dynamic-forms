import { describe, expect, it, vi } from 'vitest';
import { FormEventEmitter } from './emitter';
import type { FormEvent } from './types';

describe('FormEventEmitter', () => {
  it('delivers events only to listeners of the matching type, in registration order', () => {
    const emitter = new FormEventEmitter();
    const order: string[] = [];
    emitter.on('valueChange', () => order.push('first'));
    emitter.on('valueChange', () => order.push('second'));
    emitter.on('reset', () => order.push('reset'));

    emitter.emit({ type: 'valueChange', field: 'name', value: 'Ada', previousValue: '' });

    expect(order).toEqual(['first', 'second']);
  });

  it('passes the event object through unchanged', () => {
    const emitter = new FormEventEmitter<string>();
    const listener = vi.fn();
    const event: FormEvent<string> = { type: 'fieldChange', field: 'email', value: 'a@b.c', previousValue: '' };
    emitter.on('fieldChange', listener);
    emitter.emit(event);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('unsubscribes one listener without affecting the others', () => {
    const emitter = new FormEventEmitter();
    const kept = vi.fn();
    const removed = vi.fn();
    emitter.on('submit', kept);
    const off = emitter.on('submit', removed);
    off();
    off(); // idempotent

    emitter.emit({ type: 'submit' });
    expect(kept).toHaveBeenCalledOnce();
    expect(removed).not.toHaveBeenCalled();
  });

  it('allows re-subscribing after the last listener of a type was removed', () => {
    const emitter = new FormEventEmitter();
    emitter.on('validate', vi.fn())();
    const listener = vi.fn();
    emitter.on('validate', listener);
    emitter.emit({ type: 'validate' });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('clear() removes every listener', () => {
    const emitter = new FormEventEmitter();
    const listener = vi.fn();
    emitter.on('valueChange', listener);
    emitter.on('reset', listener);
    emitter.clear();
    emitter.emit({ type: 'valueChange' });
    emitter.emit({ type: 'reset' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores emits with no listeners', () => {
    expect(() => new FormEventEmitter().emit({ type: 'reset' })).not.toThrow();
  });
});
