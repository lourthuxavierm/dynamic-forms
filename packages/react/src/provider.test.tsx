/** @vitest-environment happy-dom */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { FormStore, type FormEvent, type FormSchema } from '@dynamic-form-engine/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DynamicField, FormProvider, useFormActions, useFormContext, type FieldComponentProps, type FormContextValue } from './index';

// Vitest runs without globals, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup());

const schema: FormSchema = {
  id: 'provider-contract',
  fields: [
    { name: 'name', type: 'text', validation: { required: true } },
    { name: 'email', type: 'email', validation: { required: true } },
    { name: 'city', type: 'select', dependsOn: ['name'], dataSource: { type: 'static', options: ['a'] } },
  ],
};

function Capture({ onRender }: { onRender: (context: FormContextValue) => void }) {
  onRender(useFormContext());
  return null;
}

function flagsProbe(record: Record<string, FieldComponentProps>) {
  return (props: FieldComponentProps) => { record[props.name] = props; return <input name={props.name} disabled={props.disabled} readOnly={props.readOnly} />; };
}

describe('FormProvider ownership', () => {
  it('creates and keeps an internal store from defaultValues when no store is supplied', () => {
    const stores: FormStore[] = [];
    const { rerender } = render(<FormProvider defaultValues={{ name: 'Ada' }}><Capture onRender={(context) => stores.push(context.store)} /></FormProvider>);
    rerender(<FormProvider defaultValues={{ name: 'Grace' }}><Capture onRender={(context) => stores.push(context.store)} /></FormProvider>);

    expect(new Set(stores).size).toBe(1);
    expect(stores[0].getValues()).toEqual({ name: 'Ada' });
  });

  it('uses a controlled store as-is', () => {
    const store = new FormStore({ name: 'controlled' });
    let seen: FormStore | undefined;
    render(<FormProvider store={store} defaultValues={{ name: 'ignored' }}><Capture onRender={(context) => { seen = context.store; }} /></FormProvider>);
    expect(seen).toBe(store);
  });
});

describe('FormProvider stability', () => {
  it('keeps the context value stable across value, error, and validation updates', async () => {
    const store = new FormStore({ name: '', email: '', city: '' });
    const contexts: FormContextValue[] = [];
    let actions!: ReturnType<typeof useFormActions>;
    function Actions() { actions = useFormActions(); return null; }
    render(<FormProvider store={store} schema={schema}><Capture onRender={(context) => contexts.push(context)} /><Actions /></FormProvider>);
    await waitFor(() => expect(contexts.at(-1)?.conditionController).toBeDefined());
    const settled = contexts.length;

    await act(async () => {
      store.setValue('email', 'a@b.c');
      store.setError('email', 'Taken');
      await actions.validateField('name');
      await actions.validateForm();
    });

    expect(contexts.length).toBe(settled);
  });

  it('keeps actions and controllers stable when callbacks are inline, and calls the latest callback', async () => {
    const store = new FormStore({ name: 'Ada', email: 'a@b.c', city: '' });
    const calls: string[] = [];
    const actionsSeen = new Set<unknown>();
    const controllersSeen = new Set<unknown>();
    let rerender!: () => void;
    function Parent() {
      const [count, setCount] = useState(0);
      rerender = () => setCount((value) => value + 1);
      return (
        <FormProvider store={store} schema={schema} onSubmit={() => { calls.push(`submit-${count}`); }} onDataSourceRefresh={() => undefined}>
          <Probe />
        </FormProvider>
      );
    }
    function Probe() {
      actionsSeen.add(useFormActions());
      controllersSeen.add(useFormContext().conditionController);
      return null;
    }
    render(<Parent />);
    await waitFor(() => expect([...controllersSeen].some(Boolean)).toBe(true));
    for (let index = 0; index < 3; index += 1) act(() => rerender());

    const [actions] = actionsSeen;
    await act(async () => { await (actions as ReturnType<typeof useFormActions>).submit(); });

    expect(actionsSeen.size).toBe(1);
    expect([...controllersSeen].filter(Boolean)).toHaveLength(1);
    expect(calls).toEqual(['submit-3']);
  });
});

describe('FormProvider form-level state', () => {
  it('applies disabled and readOnly to fields and blocks submission while disabled', async () => {
    const store = new FormStore({ name: 'Ada', email: 'a@b.c', city: '' });
    const onSubmit = vi.fn();
    const seen: Record<string, FieldComponentProps> = {};
    let submit!: () => Promise<unknown>;
    function Actions() { ({ submit } = useFormActions()); return null; }
    const view = render(
      <FormProvider store={store} schema={schema} disabled readOnly onSubmit={onSubmit}>
        <DynamicField name="name" render={flagsProbe(seen)} /><Actions />
      </FormProvider>,
    );
    await waitFor(() => expect(seen.name?.disabled).toBe(true));
    expect(seen.name.readOnly).toBe(true);
    expect(store.getState().disabled).toBe(true);
    expect(await submit()).toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();

    view.rerender(
      <FormProvider store={store} schema={schema} disabled={false} onSubmit={onSubmit}>
        <DynamicField name="name" render={flagsProbe(seen)} /><Actions />
      </FormProvider>,
    );
    await waitFor(() => expect(seen.name.disabled).toBe(false));
    expect(seen.name.readOnly).toBe(false);
  });

  it('disables fields while submitting unless disableWhileSubmitting is false', async () => {
    for (const disableWhileSubmitting of [true, false]) {
      const store = new FormStore({ name: 'Ada', email: 'a@b.c', city: '' });
      let finish!: () => void;
      const seen: Record<string, FieldComponentProps> = {};
      let submit!: () => Promise<unknown>;
      function Actions() { ({ submit } = useFormActions()); return null; }
      const view = render(
        <FormProvider store={store} schema={schema} disableWhileSubmitting={disableWhileSubmitting} onSubmit={() => new Promise<void>((resolve) => { finish = resolve; })}>
          <DynamicField name="name" render={flagsProbe(seen)} /><Actions />
        </FormProvider>,
      );
      let pending!: Promise<unknown>;
      await act(async () => { pending = submit(); await Promise.resolve(); await Promise.resolve(); });
      await waitFor(() => expect(store.getState().submitting).toBe(true));
      expect(seen.name.disabled).toBe(disableWhileSubmitting);
      await act(async () => { finish(); await pending; });
      expect(seen.name.disabled).toBe(false);
      view.unmount();
    }
  });
});

describe('FormProvider callbacks', () => {
  it('forwards every Core event to onEvent and reset to onReset', async () => {
    const store = new FormStore({ name: '', email: '', city: '' });
    const events: string[] = [];
    const onReset = vi.fn();
    let actions!: ReturnType<typeof useFormActions>;
    function Actions() { actions = useFormActions(); return null; }
    render(<FormProvider store={store} schema={schema} onEvent={(event: FormEvent) => events.push(event.type)} onReset={onReset} onSubmit={() => 'ok'}><Actions /></FormProvider>);

    await act(async () => {
      store.setValue('name', 'Ada');
      store.setValue('email', 'a@b.c');
      await actions.submit();
      actions.reset();
    });

    expect(events).toEqual(expect.arrayContaining(['valueChange', 'fieldChange', 'validate', 'submit', 'reset']));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('routes validator failures to onError and ignores aborts', async () => {
    const store = new FormStore({ name: 'Ada', email: 'a@b.c', city: '' });
    const onError = vi.fn();
    let actions!: ReturnType<typeof useFormActions>;
    function Actions() { actions = useFormActions(); return null; }
    let failure: Error = new Error('validator crashed');
    render(<FormProvider store={store} schema={schema} onError={onError} formValidator={() => { throw failure; }}><Actions /></FormProvider>);

    await act(async () => { await expect(actions.validateForm()).rejects.toThrow('validator crashed'); });
    expect(onError).toHaveBeenCalledWith(failure);

    failure = Object.assign(new Error('aborted'), { name: 'AbortError' });
    await act(async () => { await expect(actions.validateForm()).rejects.toThrow('aborted'); });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('passes abort signals to composed validators and dependency refreshes', async () => {
    const store = new FormStore({ name: 'Ada', email: 'a@b.c', city: '' });
    const validatorSignal = vi.fn();
    const refresh = vi.fn();
    let actions!: ReturnType<typeof useFormActions>;
    function Actions() { actions = useFormActions(); return null; }
    render(
      <FormProvider store={store} schema={schema} formValidator={(_values, context) => { validatorSignal(context?.signal); return {}; }} onDataSourceRefresh={(_field, _source, _values, context) => { refresh(context?.signal, context?.field); }}>
        <Capture onRender={() => undefined} /><Actions />
      </FormProvider>,
    );
    await act(async () => { await actions.validateForm(); });
    await waitFor(() => expect(validatorSignal).toHaveBeenCalled());
    expect(validatorSignal.mock.calls[0][0]).toBeInstanceOf(AbortSignal);

    await act(async () => { store.setValue('name', 'Grace'); await Promise.resolve(); });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(refresh.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(refresh.mock.calls[0][1]).toBe('city');
  });

  it('focuses the first invalid, enabled control in document order after an invalid submit', async () => {
    const store = new FormStore({ name: '', email: '', city: '' });
    let submit!: () => Promise<unknown>;
    function Actions() { ({ submit } = useFormActions()); return null; }
    render(
      <FormProvider store={store} schema={schema} onSubmit={vi.fn()}>
        <input name="city" aria-label="city" disabled />
        <input name="email" aria-label="email" />
        <input name="name" aria-label="name" />
        <Actions />
      </FormProvider>,
    );
    await act(async () => { await submit(); });
    expect(Object.keys(store.getState().errors).sort()).toEqual(['email', 'name']);
    expect(document.activeElement).toBe(screen.getByLabelText('email'));
  });
});
