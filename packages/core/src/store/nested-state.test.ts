import { describe, it, expect, vi } from 'vitest';
import { FormStore } from './store';

type Profile = { profile: { name: string; address: { city: string } }; items: Array<{ name: string }> };

const initial = (): Profile => ({
  profile: { name: 'John', address: { city: 'Chennai' } },
  items: [{ name: 'first' }, { name: 'second' }],
});

describe('FormStore nested dirty/touched tracking', () => {
  it('marks a nested object path dirty and clears it when the initial value is restored', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('profile.address.city', 'Bengaluru');
    expect(store.getState().dirty['profile.address.city']).toBe(true);

    store.setValue('profile.address.city', 'Chennai');
    expect(store.getState().dirty['profile.address.city']).toBeUndefined();
  });

  it('marks a nested array path dirty and clears it when the initial value is restored', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('items[1].name', 'changed');
    expect(store.getState().dirty['items[1].name']).toBe(true);

    store.setValue('items[1].name', 'second');
    expect(store.getState().dirty['items[1].name']).toBeUndefined();
  });

  it('only dirties the changed nested field, not its siblings', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('items[0].name', 'changed');
    const { dirty } = store.getState();
    expect(dirty['items[0].name']).toBe(true);
    expect(dirty['items[1].name']).toBeUndefined();
    expect(dirty['profile.name']).toBeUndefined();
  });

  it('tracks touched state for nested paths via shouldTouch and setTouched', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('profile.name', 'Jane', { shouldTouch: true });
    store.setTouched('items[0].name');
    expect(store.getState().touched['profile.name']).toBe(true);
    expect(store.getState().touched['items[0].name']).toBe(true);
    expect(store.getState().touched['items[1].name']).toBeUndefined();
  });

  it('resetField clears value, dirty, touched and error for a nested path', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('profile.address.city', 'Bengaluru', { shouldTouch: true });
    store.setError('profile.address.city', 'Unknown city');

    store.resetField('profile.address.city');

    const state = store.getState();
    expect(store.getValue('profile.address.city')).toBe('Chennai');
    expect(state.dirty['profile.address.city']).toBeUndefined();
    expect(state.touched['profile.address.city']).toBeUndefined();
    expect(state.errors['profile.address.city']).toBeUndefined();
    expect(state.valid).toBe(true);
  });

  it('resetField on a nested array path leaves sibling field state intact', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('items[0].name', 'a', { shouldTouch: true });
    store.setValue('items[1].name', 'b', { shouldTouch: true });

    store.resetField('items[0].name');

    const state = store.getState();
    expect(state.dirty['items[0].name']).toBeUndefined();
    expect(state.touched['items[0].name']).toBeUndefined();
    expect(state.dirty['items[1].name']).toBe(true);
    expect(state.touched['items[1].name']).toBe(true);
  });

  it('reset() clears all nested dirty and touched state', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('profile.address.city', 'Bengaluru', { shouldTouch: true });
    store.setValue('items[1].name', 'changed', { shouldTouch: true });

    store.reset();

    expect(store.getState().dirty).toEqual({});
    expect(store.getState().touched).toEqual({});
  });

  it('treats bracket and dot spellings of the same array path as one field', () => {
    const store = new FormStore<Profile>(initial());
    store.setValue('items[0].name', 'changed');
    store.setValue('items.0.name', 'first');

    expect(store.getValue('items[0].name')).toBe('first');
    expect(Object.values(store.getState().dirty).filter(Boolean)).toHaveLength(0);
  });

  it('delivers focused dirty/touched/error subscriptions regardless of path spelling', () => {
    const store = new FormStore<Profile>(initial());
    const dirty = vi.fn();
    const touched = vi.fn();
    const error = vi.fn();
    store.subscribeToDirty('items.0.name', dirty);
    store.subscribeToTouched('items.0.name', touched);
    store.subscribeToError('items.0.name', error);

    store.setValue('items[0].name', 'changed', { shouldTouch: true });
    store.setError('items[0].name', 'Too short');

    expect(dirty).toHaveBeenCalledWith(true, false);
    expect(touched).toHaveBeenCalledWith(true, false);
    expect(error).toHaveBeenCalledWith('Too short', undefined);
  });
});
