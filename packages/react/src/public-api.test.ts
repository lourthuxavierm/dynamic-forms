import { describe, expect, it } from 'vitest';
import * as reactAdapter from './index';

describe('@dynamic-forms/react public API', () => {
  it('exports the supported React adapter APIs', () => {
    expect(reactAdapter.FormProvider).toBeTypeOf('function');
    expect(reactAdapter.useFormContext).toBeTypeOf('function');
    expect(reactAdapter.useForm).toBeTypeOf('function');
    expect(reactAdapter.useField).toBeTypeOf('function');
    expect(reactAdapter.useFormStore).toBeTypeOf('function');
    expect(reactAdapter.DynamicField).toBeTypeOf('function');
  });
});
