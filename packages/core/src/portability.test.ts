import { describe, expect, it } from 'vitest';
import { FormRuntime, FormStore, createFormValidator, type FormSchema } from './index';

// The Core suite deliberately runs in a plain Node environment (no vitest
// environment override). If these fail, the suite is being run with a DOM
// shim and no longer proves Core is renderer- and DOM-independent.
describe('Core portability', () => {
  it('runs without DOM globals', () => {
    expect(typeof (globalThis as Record<string, unknown>).document).toBe('undefined');
    expect(typeof (globalThis as Record<string, unknown>).window).toBe('undefined');
    expect(typeof (globalThis as Record<string, unknown>).HTMLElement).toBe('undefined');
  });

  it('executes a full schema workflow using only universal platform APIs', async () => {
    const schema: FormSchema = {
      id: 'portable',
      fields: [
        { name: 'kind', type: 'select' },
        { name: 'company', type: 'text', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' }, validation: { required: true } },
        { name: 'tags', type: 'array', fields: [{ name: 'label', type: 'text', validation: { minLength: 2 } }] },
      ],
    };
    const runtime = new FormRuntime(schema, { kind: 'business', company: '', tags: [{ label: 'a' }] });
    const valid = await runtime.validate(createFormValidator(runtime.schema));

    expect(valid).toBe(false);
    expect(runtime.store.getState().errors).toMatchObject({ company: expect.any(String), 'tags[0].label': expect.any(String) });
    runtime.dispose();
    expect(new FormStore({ a: 1 }).getValues()).toEqual({ a: 1 });
  });
});
