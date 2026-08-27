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

  it('notifies only subscribers for condition states that actually changed', () => {
    const schema: FormSchema = {
      id: 'isolated',
      fields: [
        { name: 'leftToggle', type: 'checkbox' },
        { name: 'rightToggle', type: 'checkbox' },
        { name: 'left', type: 'text', visibleWhen: { field: 'leftToggle', operator: 'equals', value: true } },
        { name: 'right', type: 'text', visibleWhen: { field: 'rightToggle', operator: 'equals', value: true } },
      ],
    };
    const store = new FormStore({ leftToggle: false, rightToggle: false });
    const controller = new ConditionController(store, schema);
    const left = vi.fn();
    const right = vi.fn();
    controller.subscribe('left', left);
    controller.subscribe('right', right);

    store.setValue('leftToggle', true);
    expect(left).toHaveBeenCalledTimes(1);
    expect(right).not.toHaveBeenCalled();
    controller.dispose();
  });

  it('applies explicit preserve, clear, and reset policies to hidden values', () => {
    const schema: FormSchema = {
      id: 'hidden-policy',
      fields: [
        { name: 'show', type: 'checkbox' },
        { name: 'preserved', type: 'text', hiddenValuePolicy: 'preserve', visibleWhen: { field: 'show', operator: 'equals', value: true } },
        { name: 'cleared', type: 'text', hiddenValuePolicy: 'clear', visibleWhen: { field: 'show', operator: 'equals', value: true } },
        { name: 'reset', type: 'text', hiddenValuePolicy: 'reset', visibleWhen: { field: 'show', operator: 'equals', value: true } },
      ],
    };
    const store = new FormStore({ show: true, preserved: 'keep', cleared: 'remove', reset: 'initial' });
    const controller = new ConditionController(store, schema);
    store.setValue('reset', 'changed');
    store.setValue('show', false);

    expect(store.getValue('preserved')).toBe('keep');
    expect(store.getValue('cleared')).toBeUndefined();
    expect(store.getValue('reset')).toBe('initial');
    controller.dispose();
  });
});
