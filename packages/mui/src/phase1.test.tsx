// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef, type Ref } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormProvider } from '@dynamic-forms/react';
import { MuiFieldRenderer, MuiFieldShell } from './index';

const schema = { id: 'phase-1', fields: [{ name: 'name', type: 'custom' }] } as const;

afterEach(cleanup);

describe('@dynamic-forms/mui Phase 1 infrastructure', () => {
  it('renders an accessible skeleton while a field is loading', () => {
    render(
      <FormProvider schema={schema} defaultValues={{ name: '' }}>
        <MuiFieldShell name="name" label="Name" loading loadingLabel="Loading name">
          {() => <input aria-label="Name input" />}
        </MuiFieldShell>
      </FormProvider>,
    );

    expect(screen.getByRole('status', { name: 'Loading name' })).toBeTruthy();
    expect(screen.queryByLabelText('Name input')).toBeNull();
  });

  it('forwards the shell ref to the focusable input', () => {
    const inputRef = createRef<HTMLElement>();
    render(
      <FormProvider schema={schema} defaultValues={{ name: '' }}>
        <MuiFieldShell ref={inputRef} name="name">
          {(accessibility) => <input ref={accessibility.inputRef as Ref<HTMLInputElement>} aria-label="Name input" />}
        </MuiFieldShell>
      </FormProvider>,
    );

    expect(inputRef.current).toBe(screen.getByLabelText('Name input'));
  });

  it('passes an input ref through the schema field renderer', () => {
    const inputRef = createRef<HTMLElement>();
    const CustomField = ({ inputRef: customInputRef }: { inputRef?: Ref<HTMLElement> }) => (
      <input ref={customInputRef as Ref<HTMLInputElement>} aria-label="Custom input" />
    );

    render(
      <FormProvider schema={schema} defaultValues={{ name: '' }}>
        <MuiFieldRenderer field={schema.fields[0]} registry={{ custom: CustomField }} inputRef={inputRef} />
      </FormProvider>,
    );

    expect(inputRef.current).toBe(screen.getByLabelText('Custom input'));
  });
});
