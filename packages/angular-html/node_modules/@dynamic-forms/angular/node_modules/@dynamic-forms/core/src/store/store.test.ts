import { describe, it, expect, vi } from 'vitest';
import { FormStore } from './store';

describe('FormStore', () => {
  it('should initialize with initial values', () => {
    const store = new FormStore({ name: 'John' });
    expect(store.getValue('name') as string).toBe('John');
    expect(store.getState().values.name).toBe('John');
  });

  it('should set and get values with nested paths', () => {
    const store = new FormStore<{ profile: { firstName: string } }>();
    store.setValue('profile.firstName', 'John');
    expect(store.getValue('profile.firstName') as string).toBe('John');
    expect(store.getState().values.profile.firstName).toBe('John');
  });

  it('should handle array paths', () => {
    const store = new FormStore<{ tags: string[] }>();
    store.setValue('tags[0]', 'React');
    expect(store.getValue('tags[0]')).toBe('React');
    expect(Array.isArray(store.getState().values.tags)).toBe(true);
    expect(store.getState().values.tags[0]).toBe('React');
  });

  it('should track dirty state correctly', () => {
    const store = new FormStore({ name: 'John' });
    store.setValue('name', 'Jane');
    expect(store.getState().dirty.name).toBe(true);
  });

  it('should set and clear errors', () => {
    const store = new FormStore();
    store.setError('email', 'Invalid email');
    expect(store.getState().errors.email).toBe('Invalid email');
    expect(store.getState().valid).toBe(false);

    store.clearError('email');
    expect(store.getState().errors.email).toBeUndefined();
    expect(store.getState().valid).toBe(true);
  });

  it('should notify listeners on change', () => {
    const store = new FormStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setValue('name', 'John');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(store.getState());
  });

  it('should support fine-grained field subscriptions', () => {
    const store = new FormStore();
    const emailListener = vi.fn();
    const nameListener = vi.fn();

    store.subscribeToField('email', emailListener);
    store.subscribeToField('name', nameListener);

    store.setValue('email', 'test@example.com');
    expect(emailListener).toHaveBeenCalledTimes(1);
    expect(nameListener).not.toHaveBeenCalled();

    store.setValue('name', 'John');
    expect(nameListener).toHaveBeenCalledTimes(1);
  });

  it('should notify parent path listeners on nested change', () => {
    const store = new FormStore();
    const profileListener = vi.fn();
    
    store.subscribeToField('profile', profileListener);
    
    store.setValue('profile.firstName', 'John');
    expect(profileListener).toHaveBeenCalled();
  });

  it('should reset to initial values', () => {
    const store = new FormStore({ name: 'John' });
    store.setValue('name', 'Jane');
    store.setError('name', 'Error');
    
    store.reset();
    expect(store.getValue('name') as string).toBe('John');
    expect(store.getState().errors).toEqual({});
    expect(store.getState().dirty).toEqual({});
  });

  it('should reset specific field', () => {
    const store = new FormStore({ name: 'John', age: 30 });
    store.setValue('name', 'Jane');
    store.setValue('age', 31);
    
    store.resetField('name');
    expect(store.getValue('name') as string).toBe('John');
    expect(store.getValue('age')).toBe(31);
  });
});

  it('batches global and field notifications for setValues', () => {
    const store = new FormStore<{ firstName: string; lastName: string }>({
      firstName: '',
      lastName: '',
    });
    const globalListener = vi.fn();
    const fieldListener = vi.fn();
    store.subscribe(globalListener);
    store.subscribeToField('firstName', fieldListener);

    store.setValues({ firstName: 'Ada', lastName: 'Lovelace' });

    expect(globalListener).toHaveBeenCalledTimes(1);
    expect(fieldListener).toHaveBeenCalledTimes(1);
  });

  it('marks a field clean again when its initial value is restored', () => {
    const store = new FormStore({ name: 'John' });
    store.setValue('name', 'Jane');
    store.setValue('name', 'John');

    expect(store.getState().dirty.name).toBeUndefined();
  });

  it('resets a field value and field state', () => {
    const store = new FormStore({ name: 'John' });
    store.setValue('name', 'Jane', { shouldTouch: true });
    store.setError('name', 'Invalid name');

    store.resetField('name');

    expect(store.getValue('name') as string).toBe('John');
    expect(store.getState().dirty.name).toBeUndefined();
    expect(store.getState().touched.name).toBeUndefined();
    expect(store.getState().errors.name).toBeUndefined();
    expect(store.getState().valid).toBe(true);
  });

  it('notifies field subscribers when the form resets', () => {
    const store = new FormStore({ name: 'John' });
    const listener = vi.fn();
    store.subscribeToField('name', listener);
    store.setValue('name', 'Jane');
    listener.mockClear();

    store.reset();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies an array parent subscription when an array item changes', () => {
    const store = new FormStore();
    const listener = vi.fn();
    store.subscribeToField('tags', listener);

    store.setValue('tags[0]', 'React');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('runs the supplied form validator and updates form errors', async () => {
    const store = new FormStore({ email: '' });

    const valid = await store.validate(() => ({ email: 'Email is required' }));

    expect(valid).toBe(false);
    expect(store.getState().errors.email).toBe('Email is required');
  });

  it('submits only when validation succeeds and restores submitting state', async () => {
    const store = new FormStore({ name: 'Ada' });
    const onSubmit = vi.fn(async () => 'submitted');

    const result = await store.submit(onSubmit, async () => ({}));

    expect(result).toBe('submitted');
    expect(onSubmit).toHaveBeenCalledWith(store.getValues());
    expect(store.getState().submitting).toBe(false);
  });

  it('does not submit when validation fails', async () => {
    const store = new FormStore({ name: '' });
    const onSubmit = vi.fn();

    const result = await store.submit(onSubmit, () => ({ name: 'Required' }));

    expect(result).toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

it('exposes immutable state snapshots', () => {
  const store = new FormStore({ profile: { name: 'Ada' } });

  expect(Object.isFrozen(store.getState())).toBe(true);
  expect(Object.isFrozen(store.getValues())).toBe(true);
  expect(Object.isFrozen(store.getValues().profile)).toBe(true);
});