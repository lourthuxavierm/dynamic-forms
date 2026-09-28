import { describe, expect, it } from 'vitest';
import type { FormSchema } from '../schema';
import { createFormValidator } from '../validation';
import { FormRuntime } from './runtime';

// Integration coverage for nested object and array paths across conditions,
// hidden-value policies, dependencies, validation, reset, and explanations.
const schema: FormSchema = {
  id: 'nested-runtime',
  fields: [
    {
      name: 'profile',
      type: 'object',
      fields: [
        { name: 'type', type: 'select' },
        {
          name: 'company',
          type: 'object',
          visibleWhen: { field: 'profile.type', operator: 'equals', value: 'business' },
          hiddenValuePolicy: 'clear',
          fields: [{ name: 'name', type: 'text', validation: { required: true, minLength: 2 } }],
        },
        {
          name: 'address',
          type: 'object',
          fields: [
            { name: 'country', type: 'select' },
            { name: 'state', type: 'select', dependsOn: ['profile.address.country'], resetOnDependencyChange: true },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'sku', type: 'text', validation: { required: true } },
        { name: 'quantity', type: 'number', validation: { min: 1 } },
      ],
    },
  ],
};

type Values = {
  profile: { type: string; company?: { name: string }; address: { country: string; state: string } };
  items: Array<{ sku: string; quantity: number }>;
};

const initial = (): Values => ({
  profile: { type: 'business', company: { name: 'Acme' }, address: { country: 'IN', state: 'TN' } },
  items: [{ sku: 'A-1', quantity: 2 }, { sku: 'B-2', quantity: 1 }],
});

describe('FormRuntime nested object paths', () => {
  it('evaluates conditions that reference nested paths', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    expect(runtime.conditions.getState('profile.company')?.visible).toBe(true);

    runtime.setValue('profile.type', 'individual');
    expect(runtime.conditions.getState('profile.company')?.visible).toBe(false);
    runtime.dispose();
  });

  it('applies the hidden-value policy to a nested object', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('profile.type', 'individual');
    expect(runtime.store.getValue('profile.company')).toBeUndefined();
    expect(runtime.store.getValue('profile.address.country')).toBe('IN');
    runtime.dispose();
  });

  it('resets a nested dependent when its nested dependency changes', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('profile.address.state', 'KA');
    expect(runtime.store.getState().dirty['profile.address.state']).toBe(true);

    runtime.setValue('profile.address.country', 'US');
    expect(runtime.store.getValue('profile.address.state')).toBe('TN');
    expect(runtime.store.getState().dirty['profile.address.state']).toBeUndefined();
    runtime.dispose();
  });

  it('explains nested fields by path', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('profile.type', 'individual');
    const explanation = runtime.explainFieldState('profile.company');
    expect(explanation).toMatchObject({ exists: true, visible: { value: false, reason: 'visibleWhen' } });
    expect(explanation.visible.condition?.decisive[0]).toMatchObject({ field: 'profile.type', expected: 'business' });
    expect(runtime.explainFieldState('profile.address.state').dependencies.dependsOn).toEqual(['profile.address.country']);
    runtime.dispose();
  });

  it('skips validation inside a hidden nested object', async () => {
    const runtime = new FormRuntime<Values>(schema, { ...initial(), profile: { ...initial().profile, company: { name: '' } } });
    const validator = createFormValidator(runtime.schema);

    expect(await runtime.validate(validator)).toBe(false);
    expect(runtime.store.getState().errors).toHaveProperty(['profile.company.name']);

    runtime.setValue('profile.type', 'individual');
    expect(await runtime.validate(validator)).toBe(true);
    runtime.dispose();
  });
});

describe('FormRuntime nested array paths', () => {
  it('validates each array item with indexed error paths', async () => {
    const runtime = new FormRuntime<Values>(schema, { ...initial(), items: [{ sku: '', quantity: 1 }, { sku: 'ok', quantity: 0 }] });
    expect(await runtime.validate(createFormValidator(runtime.schema))).toBe(false);
    const { errors } = runtime.store.getState();
    expect(Object.keys(errors).sort()).toEqual(['items[0].sku', 'items[1].quantity']);
    runtime.dispose();
  });

  it('tracks dirty and touched per array item and resets them together', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('items[1].quantity', 5, { shouldTouch: true });
    runtime.setValue('items[0].sku', 'A-9');

    const state = runtime.store.getState();
    expect(state.dirty).toMatchObject({ 'items[1].quantity': true, 'items[0].sku': true });
    expect(state.touched).toEqual({ 'items[1].quantity': true });

    runtime.store.resetField('items[1]');
    expect(runtime.store.getValue('items[1].quantity')).toBe(1);
    expect(runtime.store.getState().dirty['items[1].quantity']).toBeUndefined();
    expect(runtime.store.getState().touched['items[1].quantity']).toBeUndefined();
    expect(runtime.store.getState().dirty['items[0].sku']).toBe(true);

    runtime.reset();
    expect(runtime.store.getValues()).toEqual(initial());
    expect(runtime.store.getState().dirty).toEqual({});
    runtime.dispose();
  });

  it('appends array items immutably without touching existing snapshots', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    const before = runtime.store.getValues();
    runtime.setValue('items[2]', { sku: 'C-3', quantity: 3 });

    expect(runtime.store.getValue('items').length).toBe(3);
    expect(before.items).toHaveLength(2);
    expect(Object.isFrozen(runtime.store.getValues().items)).toBe(true);
    expect(runtime.store.getValues().items[0]).toBe(before.items[0]);
    runtime.dispose();
  });

  it('treats bracket and dot array spellings as the same field across subsystems', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('items.0.sku', 'Z-0');
    runtime.store.setError('items[0].sku', 'Unknown SKU');

    expect(runtime.store.getValue('items[0].sku')).toBe('Z-0');
    expect(runtime.explainFieldState('items.0.sku').validation.error).toBe('Unknown SKU');
    runtime.store.resetField('items.0.sku');
    expect(runtime.store.getState().errors).toEqual({});
    expect(runtime.store.getState().dirty).toEqual({});
    runtime.dispose();
  });
});
