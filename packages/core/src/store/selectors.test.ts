import { describe, expect, it, vi } from 'vitest';
import { FormStore } from './store';

describe('FormStore selector subscriptions', () => {
  it('notifies only when the selected state slice changes', () => {
    const store = new FormStore({ profile: { name: 'Ada' }, age: 36 });
    const listener = vi.fn();
    store.subscribeSelector((state) => state.values.profile.name, listener);

    store.setValue('age', 37);
    expect(listener).not.toHaveBeenCalled();

    store.setValue('profile.name', 'Grace');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('Grace', 'Ada');
  });

  it('supports custom equality for derived selections', () => {
    const store = new FormStore({ first: 'Ada', last: 'Lovelace', count: 0 });
    const listener = vi.fn();
    store.subscribeSelector(
      (state) => ({ first: state.values.first, last: state.values.last }),
      listener,
      (left, right) => left.first === right.first && left.last === right.last,
    );

    store.setValue('count', 1);
    expect(listener).not.toHaveBeenCalled();
    store.setValue('first', 'Grace');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('supports focused value, error, touched, and dirty subscriptions', () => {
    const store = new FormStore({ name: '' });
    const value = vi.fn();
    const error = vi.fn();
    const touched = vi.fn();
    const dirty = vi.fn();
    store.subscribeToValue('name', value);
    store.subscribeToError('name', error);
    store.subscribeToTouched('name', touched);
    store.subscribeToDirty('name', dirty);

    store.setError('name', 'Required');
    expect(error).toHaveBeenCalledWith('Required', undefined);
    expect(value).not.toHaveBeenCalled();

    store.setTouched('name');
    expect(touched).toHaveBeenCalledWith(true, false);
    store.setValue('name', 'Ada');
    expect(value).toHaveBeenCalledWith('Ada', '');
    expect(dirty).toHaveBeenCalledWith(true, false);
  });

  it('stops selector delivery after unsubscribe', () => {
    const store = new FormStore({ name: 'Ada' });
    const listener = vi.fn();
    const unsubscribe = store.subscribeToValue('name', listener);
    unsubscribe();

    store.setValue('name', 'Grace');
    expect(listener).not.toHaveBeenCalled();
  });

  it('avoids unrelated notifications in a large dynamic form', () => {
    const values = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => [`field${index}`, index]));
    const store = new FormStore<Record<string, unknown>>({ ...values, target: 'stable' });
    const listener = vi.fn();
    store.subscribeSelector((state) => state.values.target, listener);

    for (let index = 0; index < 250; index++) store.setValue(`field${index}`, index + 1);
    expect(listener).not.toHaveBeenCalled();

    store.setValue('target', 'changed');
    expect(listener).toHaveBeenCalledOnce();
  });
});