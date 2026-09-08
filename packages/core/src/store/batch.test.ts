import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { ConditionController } from '../conditions';
import { DependencyController } from '../dependencies';
import { FormStore } from './store';

describe('FormStore batches', () => {
  it('exposes mutations immediately but notifies once with final state', () => {
    const store = new FormStore<{ country: string; state: string | null; city: string }>({ country: 'IN', state: 'TN', city: 'Chennai' });
    const global = vi.fn();
    const selected = vi.fn();
    const field = vi.fn();
    store.subscribe(global);
    store.subscribeSelector((snapshot) => snapshot.values.city, selected);
    store.subscribeToField('country', field);
    store.subscribeToField('city', field);

    store.batch(() => {
      store.setValue('country', 'US');
      store.setValue('state', null);
      store.setValue('city', 'New York');
      expect(store.getValue('city')).toBe('New York');
      expect(global).not.toHaveBeenCalled();
    });

    expect(global).toHaveBeenCalledOnce();
    expect(global).toHaveBeenCalledWith(store.getState());
    expect(selected).toHaveBeenCalledWith('New York', 'Chennai');
    expect(field).toHaveBeenCalledOnce();
  });

  it('consolidates repeated field events and preserves the original previous value', () => {
    const store = new FormStore({ count: 0 });
    const valueChange = vi.fn();
    const fieldChange = vi.fn();
    store.on('valueChange', valueChange);
    store.on('fieldChange', fieldChange);

    store.batch(() => {
      store.setValue('count', 1);
      store.setValue('count', 2);
      store.setValue('count', 3);
    });

    expect(valueChange).toHaveBeenCalledOnce();
    expect(valueChange).toHaveBeenCalledWith(expect.objectContaining({ field: 'count', previousValue: 0, value: 3 }));
    expect(fieldChange).toHaveBeenCalledOnce();
  });

  it('commits nested batches as one outer transaction', () => {
    const store = new FormStore({ first: '', last: '' });
    const listener = vi.fn();
    store.subscribe(listener);

    store.batch(() => {
      store.setValue('first', 'Ada');
      store.batch(() => store.setValue('last', 'Lovelace'));
      expect(listener).not.toHaveBeenCalled();
    });

    expect(listener).toHaveBeenCalledOnce();
  });

  it('holds async batches until the operation settles', async () => {
    const store = new FormStore({ first: '', last: '' });
    const listener = vi.fn();
    store.subscribe(listener);

    const result = store.batch(async () => {
      store.setValue('first', 'Ada');
      await Promise.resolve();
      store.setValue('last', 'Lovelace');
      return 'done';
    });
    expect(listener).not.toHaveBeenCalled();

    await expect(result).resolves.toBe('done');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('runs validation once against the completed batch', async () => {
    const store = new FormStore({ first: '', last: '' });
    const validator = vi.fn(() => ({}));
    await store.batch(async () => {
      store.setValue('first', 'Ada');
      store.setValue('last', 'Lovelace');
      await store.validate(validator);
    });

    expect(validator).toHaveBeenCalledOnce();
    expect(validator).toHaveBeenCalledWith({ first: 'Ada', last: 'Lovelace' });
  });

  it('settles hidden-value conditions before subscriber notification', () => {
    const schema: FormSchema = {
      id: 'conditional-batch',
      fields: [
        { name: 'showDetails', type: 'checkbox' },
        { name: 'details', type: 'text', hiddenValuePolicy: 'clear', visibleWhen: { field: 'showDetails', operator: 'equals', value: true } },
      ],
    };
    const store = new FormStore({ showDetails: true, details: 'secret' });
    const conditions = new ConditionController(store, schema);
    const observed = vi.fn();
    store.subscribe((state) => observed(state.values));

    store.batch(() => store.setValue('showDetails', false));

    expect(observed).toHaveBeenCalledOnce();
    expect(observed).toHaveBeenCalledWith({ showDetails: false, details: undefined });
    conditions.dispose();
  });

  it('settles dependency resets before subscriber notification', () => {
    const schema: FormSchema = {
      id: 'dependency-batch',
      fields: [
        { name: 'country', type: 'select' },
        { name: 'state', type: 'select', dependsOn: ['country'], resetOnDependencyChange: true },
      ],
    };
    const store = new FormStore({ country: 'IN', state: 'TN' });
    store.setValue('state', 'KA');
    const dependencies = new DependencyController(store, schema);
    const observed = vi.fn();
    store.subscribe((state) => observed(state.values));

    store.batch(() => store.setValue('country', 'US'));

    expect(observed).toHaveBeenCalledOnce();
    expect(observed).toHaveBeenCalledWith({ country: 'US', state: 'TN' });
    dependencies.dispose();
  });
});