import { describe, expect, expectTypeOf, it } from 'vitest';
import type { UseFormReturn } from 'react-hook-form';
import * as api from './index';
import type {
  InferRHFValues,
  RHFControlProps,
  RHFFormProps,
  TypedRHFFormSchema,
} from './index';

type ExplicitValues = {
  profile: { city: string };
  contacts: Array<{ email: string }>;
};

const typedSchema = api.defineRHFSchema<ExplicitValues>({
  id: 'typed',
  fields: [
    { name: 'profile.city', type: 'text' },
    { name: 'contacts', type: 'array' },
  ],
});

type InferredValues = InferRHFValues<typeof typedSchema>;

describe('RHF Phase 5 public contracts', () => {
  it('exports the documented runtime API', () => {
    expect(Object.keys(api).sort()).toEqual([
      'DynamicFormRHFProvider',
      'RHFForm',
      'RHFField',
      'RHF_ADAPTER_CONTRACT',
      'createRHFResolver',
      'defineRHFSchema',
      'serializeRHFValues',
      'toRHFErrors',
      'useDynamicFormRHF',
      'useRHFDataSource',
      'useRHFFieldArray',
      'useRHFFormActions',
    ].sort());
  });

  it('preserves inferred, explicit, nested, array, and external-instance types', () => {
    expectTypeOf<InferredValues>().toEqualTypeOf<ExplicitValues>();
    expectTypeOf<'profile.city'>()
      .toMatchTypeOf<RHFControlProps<ExplicitValues>['name']>();
    expectTypeOf<`contacts.${number}.email`>()
      .toMatchTypeOf<RHFControlProps<ExplicitValues>['name']>();
    expectTypeOf<TypedRHFFormSchema<ExplicitValues>>().toMatchTypeOf<typeof typedSchema>();
    expectTypeOf<RHFFormProps<ExplicitValues>['onSubmit']>()
      .parameter(0).toEqualTypeOf<ExplicitValues>();
    expectTypeOf<UseFormReturn<ExplicitValues>>()
      .toMatchTypeOf<NonNullable<api.DynamicFormRHFProviderProps<ExplicitValues>['methods']>>();
  });
});
