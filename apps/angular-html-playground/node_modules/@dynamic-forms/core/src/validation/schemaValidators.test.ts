import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { FormStore } from '../store';
import { createFieldValidators, createFormValidator } from './schemaValidators';
import { validateField } from './validator';

const field = (validation: NonNullable<FormSchema['fields'][number]['validation']>) => ({
  name: 'value',
  label: 'Value',
  type: 'text',
  validation,
});

describe('schema validators', () => {
  it('applies required semantics to whitespace, false, and empty arrays', async () => {
    const validators = createFieldValidators(field({ required: true }));

    for (const value of ['  ', false, []]) {
      const result = await validateField('value', value, {}, validators);
      expect(result.errors[0]).toMatchObject({ code: 'required' });
    }
  });

  it('applies every declared scalar and array constraint', async () => {
    const cases = [
      { validation: { minLength: 3 }, value: 'ab', code: 'minLength' },
      { validation: { maxLength: 2 }, value: 'abc', code: 'maxLength' },
      { validation: { min: 3 }, value: 2, code: 'min' },
      { validation: { max: 2 }, value: 3, code: 'max' },
      { validation: { pattern: '^a+$' }, value: 'b', code: 'pattern' },
      { validation: { multipleOf: 0.5 }, value: 1.2, code: 'multipleOf' },
      { validation: { minItems: 2 }, value: ['one'], code: 'minItems' },
      { validation: { maxItems: 1 }, value: ['one', 'two'], code: 'maxItems' },
      { validation: { uniqueItems: true }, value: ['one', 'one'], code: 'uniqueItems' },
    ] as const;

    for (const testCase of cases) {
      const result = await validateField('value', testCase.value, {}, createFieldValidators(field(testCase.validation)));
      expect(result.errors[0]).toMatchObject({ code: testCase.code });
    }
  });

  it('supports asynchronous and cross-field validators', async () => {
    const result = await validateField('confirmPassword', 'different', {
      password: 'secret',
      confirmPassword: 'different',
    }, [
      async (value, values) => value === values.password ? undefined : { code: 'match', message: 'Passwords must match' },
    ]);

    expect(result).toEqual({
      valid: false,
      errors: [{ field: 'confirmPassword', code: 'match', message: 'Passwords must match' }],
    });
  });

  it('validates nested object and array fields through the form validator', async () => {
    const schema: FormSchema = {
      id: 'profile',
      fields: [
        {
          name: 'profile',
          type: 'object',
          fields: [{ name: 'email', type: 'email', validation: { required: true } }],
        },
        {
          name: 'contacts',
          type: 'array',
          fields: [{ name: 'name', type: 'text', validation: { required: true } }],
        },
      ],
    };

    await expect(createFormValidator(schema)({
      profile: { email: '' },
      contacts: [{ name: '' }],
    })).resolves.toEqual({
      'profile.email': 'email is required',
      'contacts[0].name': 'name is required',
    });
  });

  it('integrates schema validation with FormStore submission', async () => {
    const schema: FormSchema = {
      id: 'signup',
      fields: [{ name: 'email', type: 'email', validation: { required: true } }],
    };
    const store = new FormStore({ email: '' });
    const onSubmit = vi.fn();

    await store.submit(onSubmit, createFormValidator(schema));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(store.getState()).toMatchObject({ valid: false, errors: { email: 'email is required' } });
  });
});
