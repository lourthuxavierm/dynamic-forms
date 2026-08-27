import { describe, expect, it, vi } from 'vitest';
import { FormStore } from './store';

describe('FormStore lifecycle events', () => {
  it('emits value, field, validation, submission, and reset events', async () => {
    const store = new FormStore({ name: '' });
    const valueChange = vi.fn();
    const fieldChange = vi.fn();
    const validation = vi.fn();
    const submit = vi.fn();
    const reset = vi.fn();
    store.on('valueChange', valueChange);
    store.on('fieldChange', fieldChange);
    store.on('validate', validation);
    store.on('submit', submit);
    store.on('reset', reset);

    store.setValue('name', 'Ada');
    await store.validate(() => ({}));
    await store.submit(async () => 'saved');
    store.reset();

    expect(valueChange).toHaveBeenCalledWith(expect.objectContaining({ field: 'name', value: 'Ada', previousValue: '' }));
    expect(fieldChange).toHaveBeenCalledWith(expect.objectContaining({ field: 'name' }));
    expect(validation).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ valid: true }) }));
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ payload: expect.objectContaining({ result: 'saved' }) }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
