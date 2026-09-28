import { describe, expect, it, vi } from 'vitest';
import { dynamicPath } from './paths';
import { FormStore } from './store';

// Regression: field subscribers must hear about changes made through an
// ancestor, a descendant, or either array-path spelling.
describe('FormStore field subscriptions', () => {
  const create = () => new FormStore({ profile: { address: { city: 'Chennai' } }, items: [{ code: 'a' }] });

  it('notifies descendant subscribers when an ancestor is replaced', () => {
    const store = create();
    const city = vi.fn();
    store.subscribeToField('profile.address.city', city);
    store.setValue('profile', { address: { city: 'Pune' } });
    expect(city).toHaveBeenCalledOnce();
  });

  it('notifies ancestor subscribers when a descendant changes', () => {
    const store = create();
    const profile = vi.fn();
    store.subscribeToField('profile', profile);
    store.setValue('profile.address.city', 'Pune');
    expect(profile).toHaveBeenCalledOnce();
  });

  it('matches subscribers and changes across array-path spellings', () => {
    const store = create();
    const bracket = vi.fn();
    const dotted = vi.fn();
    const item = vi.fn();
    store.subscribeToField('items[0].code', bracket);
    store.subscribeToField('items.0.code', dotted);
    store.subscribeToField('items[0]', item);

    store.setValue('items.0.code', 'b');
    expect(bracket).toHaveBeenCalledOnce();
    expect(dotted).toHaveBeenCalledOnce();
    expect(item).toHaveBeenCalledOnce();

    store.setValue('items', [{ code: 'c' }]);
    expect(bracket).toHaveBeenCalledTimes(2);
  });

  it('does not notify unrelated or sibling subscribers', () => {
    const store = create();
    const sibling = vi.fn();
    const prefixLookalike = vi.fn();
    store.subscribeToField(dynamicPath('profile.name'), sibling);
    store.subscribeToField(dynamicPath('profile.addressLine'), prefixLookalike);
    store.setValue('profile.address.city', 'Pune');
    expect(sibling).not.toHaveBeenCalled();
    expect(prefixLookalike).not.toHaveBeenCalled();
  });

  it('unsubscribes cleanly for either spelling', () => {
    const store = create();
    const listener = vi.fn();
    const off = store.subscribeToField('items[0].code', listener);
    off();
    off();
    store.setValue('items.0.code', 'z');
    expect(listener).not.toHaveBeenCalled();
  });
});
