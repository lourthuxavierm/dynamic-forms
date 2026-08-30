/** @vitest-environment happy-dom */
import { fireEvent, render, screen } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { describe, expect, it } from 'vitest';
import { FormProvider } from '../context';
import { DynamicField } from './DynamicField';
import { FormErrorSummary } from './FormErrorSummary';

const field: FieldSchema = { name: 'profile.name', type: 'text', label: 'Name' };
const schema: FormSchema = { id: 'accessibility-test', fields: [field] };

describe('accessible React form components', () => {
  it('supplies control linkage props and an error summary that focuses the field', () => {
    const store = new FormStore();
    store.setError(field.name, 'Name is required');
    render(
      <FormProvider store={store} schema={schema}>
        <FormErrorSummary />
        <DynamicField field={field} render={({ accessibility, name }) => (
          <>
            <label id={accessibility.labelId} htmlFor={accessibility.id}>Name</label>
            <input {...accessibility.dataAttributes} id={accessibility.id} name={name}
              aria-invalid={accessibility.ariaInvalid}
              aria-labelledby={accessibility.ariaLabelledBy}
              aria-describedby={accessibility.ariaDescribedBy} />
            <p id={accessibility.errorId} role="alert">Name is required</p>
          </>
        )} />
      </FormProvider>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('dynamic-field-profile-name-error');
    fireEvent.click(screen.getByRole('link', { name: 'Name is required' }));
    expect(document.activeElement).toBe(input);
  });
});