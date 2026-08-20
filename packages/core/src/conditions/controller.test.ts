import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { FormStore } from '../store';
import { ConditionController } from './controller';

describe('ConditionController', () => {
  it('re-evaluates schema condition state when referenced values change', () => {
    const schema: FormSchema = {
      id: 'account',
      fields: [
        { name: 'accountType', type: 'select' },
        { name: 'company', type: 'text', visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' }, requiredWhen: { field: 'accountType', operator: 'equals', value: 'business' } },
      ],
    };
    const store = new FormStore({ accountType: 'personal' });
    const onChange = vi.fn();
    const controller = new ConditionController(store, schema, onChange);

    expect(controller.getState('company')).toMatchObject({ visible: false, required: false });
    store.setValue('accountType', 'business');
    expect(controller.getState('company')).toMatchObject({ visible: true, required: true });
    expect(onChange).toHaveBeenCalledWith('company', expect.objectContaining({ visible: true }));
    controller.dispose();
  });
});
