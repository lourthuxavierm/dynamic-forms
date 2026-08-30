import { useCallback, useMemo, useState } from 'react';
import type { FormEvent, FormValidator } from '@dynamic-form-engine/core';
import { formExamples, getFormExample } from '@dynamic-forms/examples';
import { HtmlForm } from '@dynamic-form-engine/react-html';
import { FormProvider, useFormActions, useFormState } from '@dynamic-form-engine/react';
import { createZodFormValidator } from '@dynamic-form-engine/zod';
import { z } from 'zod';

interface EventEntry { readonly sequence: number; readonly type: string; readonly detail: string; }

export default function App() {
  const requested = new URLSearchParams(window.location.search).get('example');
  const [selectedId, setSelectedId] = useState(() => getFormExample(requested).id);
  const [run, setRun] = useState(0);
  const [submitted, setSubmitted] = useState<Readonly<Record<string, unknown>>>();
  const [events, setEvents] = useState<readonly EventEntry[]>([]);
  const selected = useMemo(() => getFormExample(selectedId), [selectedId]);
  const formValidator = useMemo(() => validatorFor(selected.id), [selected.id]);
  const record = useCallback((type: string, detail: string) => {
    setEvents((current) => [...current.slice(-7), { sequence: (current.at(-1)?.sequence ?? 0) + 1, type, detail }]);
  }, []);
  const selectExample = (id: string) => {
    const next = getFormExample(id);
    window.history.replaceState({}, '', `?example=${next.id}`);
    setSelectedId(next.id); setRun((value) => value + 1); setSubmitted(undefined); setEvents([]);
  };
  const change = (event: FormEvent) => {
    record(event.type, summarize(event.payload));
    if (selected.id === 'draft-autosave') record('autosave', 'Draft revision queued (simulated application service)');
  };

  return <main className="app-shell">
    <header className="hero">
      <p className="eyebrow">@dynamic-forms/examples + @dynamic-form-engine/react-html</p>
      <h1>Executable example catalogue</h1>
      <p>Shared versioned schemas, deterministic initial values, live form state, validation, events, submission, and reset.</p>
      <label className="example-picker">Example
        <select data-testid="example-picker" value={selected.id} onChange={(event) => selectExample(event.target.value)}>
          {formExamples.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <div className="example-meta"><span>Schema {selected.schema.version}</span><span>{selected.renderers.join(' + ')}</span><span>{selected.capability}</span></div>
    </header>
    <section className="demo-grid" aria-label={selected.title}>
      <div className="form-card"><h2>{selected.title}</h2><p>{selected.summary}</p>
        <FormProvider key={`${selected.id}-${run}`} schema={selected.schema} defaultValues={{ ...selected.initialValues }} formValidator={formValidator} validationMode="onBlur"
          onChange={change} onValidate={(valid) => record('validate', valid ? 'valid' : 'invalid')}>
          <HtmlForm schema={selected.schema} submitLabel={`Submit ${selected.title}`} onSubmit={(values) => { setSubmitted(values); record('submit', 'Submission accepted by playground'); }} />
          <DebugActions onReset={() => { setSubmitted(undefined); setEvents([]); setRun((value) => value + 1); }} />
          <DebugPanel submitted={submitted} events={events} />
        </FormProvider>
      </div>
    </section>
  </main>;
}

const zodExampleValidator = createZodFormValidator<Record<string, unknown>>(z.object({
  email: z.string().email('Enter a valid work email'),
  password: z.string().min(8, 'Use at least eight characters'),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, {
  path: ['confirmation'], message: 'Passwords must match',
}));

function validatorFor(id: string): FormValidator<Record<string, unknown>> | undefined {
  return id === 'zod-validation' ? zodExampleValidator : undefined;
}

function DebugActions({ onReset }: { readonly onReset: () => void }) {
  const { validateForm } = useFormActions();
  return <div className="debug-actions">
    <button type="button" className="secondary" onClick={() => void validateForm()}>Validate</button>
    <button type="button" className="secondary" onClick={onReset}>Reset example</button>
  </div>;
}

function DebugPanel({ submitted, events }: { readonly submitted?: Readonly<Record<string, unknown>>; readonly events: readonly EventEntry[] }) {
  const state = useFormState();
  return <aside className="debug-panel" aria-label="Playground debug panel">
    <section><h2>Form state</h2><dl>
      <div><dt>Valid</dt><dd>{String(state.valid)}</dd></div><div><dt>Submitting</dt><dd>{String(state.submitting)}</dd></div>
      <div><dt>Dirty fields</dt><dd>{Object.values(state.dirty).filter(Boolean).length}</dd></div><div><dt>Errors</dt><dd>{Object.keys(state.errors).length}</dd></div>
    </dl><pre data-testid="form-state">{JSON.stringify({ values: state.values, errors: state.errors, touched: state.touched, dirty: state.dirty }, fileReplacer, 2)}</pre></section>
    <section aria-live="polite"><h2>Submitted values</h2><pre data-testid="submitted-values">{submitted ? JSON.stringify(submitted, fileReplacer, 2) : 'Submit a valid form.'}</pre></section>
    <section><h2>Event log</h2><ol data-testid="event-log">{events.length ? events.map((event) => <li key={event.sequence}><strong>{event.type}</strong> {event.detail}</li>) : <li>No events yet.</li>}</ol></section>
  </aside>;
}

function summarize(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return String(payload ?? '');
  const record = payload as Record<string, unknown>;
  return [record.name, record.valid].filter((value) => value !== undefined).map(String).join(' ') || 'state changed';
}
function fileReplacer(_key: string, value: unknown): unknown {
  return value instanceof File ? { name: value.name, type: value.type, size: value.size } : value;
}
