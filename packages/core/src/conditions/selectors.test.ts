import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { FormStore } from '../store';
import { ConditionController } from './controller';

describe('ConditionController selector subscriptions', () => {
  it('notifies only when the selected condition slice changes', () => {
    const schema: FormSchema = {
      id: 'condition-selectors',
      fields: [
        { name: 'accountType', type: 'select' },
        { name: 'unrelated', type: 'text' },
        { name: 'company', type: 'text', visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' } },
      ],
    };
    const store = new FormStore({ accountType: 'personal', unrelated: '' });
    const controller = new ConditionController(store, schema);
    const listener = vi.fn();
    controller.subscribeSelector((states) => states.get('company')?.visible, listener);

    store.setValue('unrelated', 'changed');
    expect(listener).not.toHaveBeenCalled();
    store.setValue('accountType', 'business');
    expect(listener).toHaveBeenCalledWith(true, false);

    controller.dispose();
    store.setValue('accountType', 'personal');
    expect(listener).toHaveBeenCalledOnce();
  });
});