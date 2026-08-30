import { describe, expect, it, vi } from 'vitest';
import type { FormErrors, FormSchema, FormValidator } from '@lourthuxavierm/dynamic-forms-core';
import { createDynamicForm } from './facade';

const schema: FormSchema = {
  id: 'angular-test',
  fields: [
    { name: 'name', type: 'text', validation: { required: true } },
    { name: 'details', type: 'text', visibleWhen: { field: 'name', operator: 'equals', value: 'show' } },
  ],
};

describe('DynamicFormFacade', () => {
  it('projects Core state through readonly signals and focused fields', () => {
    const form = createDynamicForm({ schema, defaultValues: { name: '', details: '' } });
    const name = form.field<string>('name');
    name.setValue('show');
    expect(name.value()).toBe('show');
    expect(form.field('details').visible()).toBe(true);
    form.dispose();
  });

  it('validates and submits through Core', async () => {
    const onSubmit = vi.fn(async (values) => values.name);
    const form = createDynamicForm({ schema, defaultValues: { name: '', details: '' }, onSubmit });
    expect(await form.validate()).toBe(false);
    form.setValue('name', 'Ada');
    expect(await form.submit()).toBe('Ada');
    expect(onSubmit).toHaveBeenCalledOnce();
    form.dispose();
  });

  it('composes a custom form validator after schema validation', async () => {
    const formValidator: FormValidator<{ name: string; details: string }> = vi.fn(async (values): Promise<FormErrors> => (
      values.name === 'Ada' ? { name: 'Name is reserved' } : {}
    ));
    const onSubmit = vi.fn();
    const form = createDynamicForm({ schema, defaultValues: { name: 'Ada', details: '' }, formValidator, onSubmit });
    expect(await form.validate()).toBe(false);
    expect(form.store.getState().errors.name).toBe('Name is reserved');
    expect(await form.submit()).toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();
    form.dispose();
  });

  it('exposes Core events as an Observable with cleanup', () => {
    const form = createDynamicForm({ schema, defaultValues: { name: '', details: '' } });
    const events: string[] = [];
    const subscription = form.events$.subscribe((event) => events.push(event.type));
    form.setValue('name', 'Grace');
    expect(events).toContain('valueChange');
    subscription.unsubscribe();
    form.dispose();
  });
});
