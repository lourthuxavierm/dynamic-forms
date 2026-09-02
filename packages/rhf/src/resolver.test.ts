import { describe, expect, it } from 'vitest';
import type { FormSchema } from '@dynamic-form-engine/core';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { createRHFResolver, toRHFErrors } from './resolver';

const resolverOptions = {
  criteriaMode: 'all' as const,
  fields: {},
  names: [],
  shouldUseNativeValidation: false,
};

function resolverErrors<TFieldValues extends FieldValues>(result: { errors: unknown }): FieldErrors<TFieldValues> {
  return result.errors as FieldErrors<TFieldValues>;
}

describe('toRHFErrors', () => {
  it('creates nested object and array errors with stable codes', () => {
    const errors = toRHFErrors<{
      profile: { name: string };
      contacts: Array<{ email: string }>;
    }>({
      'profile.name': { code: 'required', message: 'Name is required' },
      'contacts[0].email': { code: 'pattern', message: 'Email is invalid' },
    });

    expect(errors.profile?.name).toMatchObject({ type: 'required', message: 'Name is required' });
    expect(errors.contacts?.[0]?.email).toMatchObject({ type: 'pattern', message: 'Email is invalid' });
  });

  it('preserves multiple issues in the RHF types map', () => {
    const errors = toRHFErrors<{ name: string }>({
      name: [
        { code: 'required', message: 'Name is required' },
        { code: 'minLength', message: 'Name is too short' },
      ],
    });
    expect(errors.name).toMatchObject({
      type: 'required',
      message: 'Name is required',
      types: { required: 'Name is required', minLength: 'Name is too short' },
    });
  });

  it('rejects prototype-polluting paths', () => {
    toRHFErrors({ '__proto__.polluted': 'unsafe', 'constructor.prototype.bad': 'unsafe' });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).bad).toBeUndefined();
  });
});

describe('createRHFResolver', () => {
  it('maps schema constraints to code-preserving errors', async () => {
    const schema: FormSchema = {
      id: 'constraints',
      fields: [{
        name: 'name', type: 'text', label: 'Name',
        validation: { required: true, minLength: 3, pattern: '^[A-Z]+$' },
      }],
    };
    const result = await createRHFResolver<{ name: string }>(schema)(
      { name: '' }, undefined, resolverOptions,
    );
    const errors = resolverErrors<{ name: string }>(result);
    expect(errors.name).toMatchObject({ type: 'required', message: 'Name is required' });
    expect(errors.name?.types).toMatchObject({
      required: 'Name is required', minLength: 'Name must be at least 3 characters', pattern: 'Name has an invalid format',
    });
  });

  it('supports conditional required and skips hidden fields', async () => {
    const schema: FormSchema = {
      id: 'conditions',
      fields: [
        { name: 'kind', type: 'text' },
        { name: 'company', type: 'text', requiredWhen: { field: 'kind', operator: 'equals', value: 'business' } },
        { name: 'secret', type: 'text', validation: { required: true }, visibleWhen: { field: 'kind', operator: 'equals', value: 'admin' } },
      ],
    };
    const resolver = createRHFResolver<{ kind: string; company: string; secret: string }>(schema);
    const business = await resolver({ kind: 'business', company: '', secret: '' }, undefined, resolverOptions);
    const businessErrors = resolverErrors<{ kind: string; company: string; secret: string }>(business);
    expect(businessErrors.company?.type).toBe('required');
    expect(businessErrors.secret).toBeUndefined();
    const personal = await resolver({ kind: 'personal', company: '', secret: '' }, undefined, resolverOptions);
    expect(personal.errors).toEqual({});
  });

  it('does not let conditionally disabled required fields block validation', async () => {
    const schema: FormSchema = {
      id: 'disabled',
      fields: [
        { name: 'locked', type: 'checkbox' },
        {
          name: 'code', type: 'text', validation: { required: true },
          disabledWhen: { field: 'locked', operator: 'equals', value: true },
        },
      ],
    };
    const resolver = createRHFResolver<{ locked: boolean; code: string }>(schema);
    const result = await resolver({ locked: true, code: '' }, undefined, resolverOptions);
    expect(result.errors).toEqual({});
  });

  it('validates nested objects and indexed arrays', async () => {
    const schema: FormSchema = {
      id: 'nested',
      fields: [{ name: 'contacts', type: 'array', fields: [{ name: 'email', type: 'text', validation: { required: true } }] }],
    };
    const result = await createRHFResolver<{ contacts: Array<{ email: string }> }>(schema)(
      { contacts: [{ email: '' }] }, undefined, resolverOptions,
    );
    expect(resolverErrors<{ contacts: Array<{ email: string }> }>(result).contacts?.[0]?.email?.type).toBe('required');
  });

  it('merges cross-field, custom, and root form errors', async () => {
    const schema: FormSchema = { id: 'custom', fields: [{ name: 'password', type: 'text' }, { name: 'confirm', type: 'text' }] };
    const resolver = createRHFResolver<{ password: string; confirm: string }>(schema, {
      formValidator: async (values): Promise<Record<string, string>> => values.password === values.confirm
        ? { '': 'Password is reserved' }
        : { confirm: 'Passwords must match' },
    });
    const mismatch = await resolver({ password: 'one', confirm: 'two' }, undefined, resolverOptions);
    expect(resolverErrors<{ password: string; confirm: string }>(mismatch).confirm)
      .toMatchObject({ type: 'custom', message: 'Passwords must match' });
    const root = await resolver({ password: 'same', confirm: 'same' }, undefined, resolverOptions);
    expect(resolverErrors<{ password: string; confirm: string }>(root).root)
      .toMatchObject({ type: 'custom', message: 'Password is reserved' });
  });

  it('makes concurrent stale runs resolve to the latest validation result', async () => {
    const schema: FormSchema = { id: 'race', fields: [{ name: 'username', type: 'text' }] };
    const resolver = createRHFResolver<{ username: string }>(schema, {
      formValidator: async ({ username }): Promise<Record<string, string>> => {
        await new Promise((resolve) => setTimeout(resolve, username === 'slow-invalid' ? 30 : 1));
        return username === 'slow-invalid' ? { username: 'Unavailable' } : {};
      },
    });
    const stale = resolver({ username: 'slow-invalid' }, undefined, resolverOptions);
    const latest = resolver({ username: 'available' }, undefined, resolverOptions);
    await expect(latest).resolves.toMatchObject({ errors: {} });
    await expect(stale).resolves.toMatchObject({ errors: {} });
  });
});