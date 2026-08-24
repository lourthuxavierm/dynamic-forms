import { useState } from 'react';
import { basicFormSchema, basicInitialValues } from '@dynamic-forms/examples/basic';
import { HtmlForm } from '@dynamic-forms/html';
import { FormProvider } from '@dynamic-forms/react';

export default function App() {
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState<Readonly<Record<string, unknown>>>();

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">@dynamic-forms/html</p>
        <h1>Native HTML playground</h1>
        <p>Headless React state and validation rendered with accessible browser-native controls and static CSS.</p>
      </header>

      <section className="demo-grid" aria-label="Native HTML form demonstration">
        <div className="form-card">
          <FormProvider key={formKey} schema={basicFormSchema} defaultValues={basicInitialValues} validationMode="onBlur">
            <HtmlForm schema={basicFormSchema} submitLabel="Create profile" onSubmit={setSubmitted} colorScheme="auto" density="standard">
              <button type="button" className="secondary" onClick={() => { setSubmitted(undefined); setFormKey((key) => key + 1); }}>
                Reset
              </button>
            </HtmlForm>
          </FormProvider>
        </div>

        <aside className="output-card" aria-live="polite">
          <h2>Submitted values</h2>
          <pre>{submitted ? JSON.stringify(submitted, null, 2) : 'Submit a valid form to inspect its values.'}</pre>
        </aside>
      </section>
    </main>
  );
}
