import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { FormRuntime } from '../runtime';
import { createLifecycleAuditPlugin } from './audit';
import type { CorePlugin, CorePluginContext } from './types';

interface Values {
  name: string;
  locked: string;
}

const schema: FormSchema = {
  id: 'plugins',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'locked', type: 'text' },
  ],
};

describe('Core plugins', () => {
  it('initializes and invokes plugins in declaration order, then disposes in reverse', () => {
    const calls: string[] = [];
    const plugin = (name: string): CorePlugin<Values> => ({
      name,
      setup: () => {
        calls.push(`setup:${name}`);
        return () => calls.push(`cleanup:${name}`);
      },
      onLifecycle: (event) => {
        if (event.phase === 'mutation') calls.push(`lifecycle:${name}`);
      },
      dispose: () => calls.push(`dispose:${name}`),
    });
    const runtime = new FormRuntime(schema, { name: '', locked: '' }, {
      plugins: [plugin('first'), plugin('second')],
    });

    runtime.setValue('name', 'Ada');
    runtime.dispose();

    expect(calls).toEqual([
      'setup:first',
      'setup:second',
      'lifecycle:first',
      'lifecycle:second',
      'cleanup:second',
      'dispose:second',
      'cleanup:first',
      'dispose:first',
    ]);
  });

  it('composes synchronous mutation transforms and allows cancellation', () => {
    const uppercase: CorePlugin<Values> = {
      name: 'uppercase',
      interceptMutation(mutation) {
        return mutation.type === 'setValue' && typeof mutation.value === 'string'
          ? { ...mutation, value: mutation.value.toUpperCase() }
          : undefined;
      },
    };
    const suffix: CorePlugin<Values> = {
      name: 'suffix',
      interceptMutation(mutation) {
        return mutation.type === 'setValue'
          ? { ...mutation, value: `${String(mutation.value)}!` }
          : undefined;
      },
    };
    const guard: CorePlugin<Values> = {
      name: 'guard',
      interceptMutation(mutation) {
        return mutation.type === 'setValue' && mutation.path === 'locked'
          ? { cancel: true, reason: 'locked' }
          : undefined;
      },
    };
    const runtime = new FormRuntime(schema, { name: '', locked: 'fixed' }, {
      plugins: [uppercase, suffix, guard],
    });

    runtime.setValue('name', 'ada');
    runtime.setValue('locked', 'changed');

    expect(runtime.store.getValues()).toEqual({ name: 'ADA!', locked: 'fixed' });
    runtime.dispose();
  });

  it('isolates setup, lifecycle, interceptor, cleanup, and disposal failures', () => {
    const errors = vi.fn();
    const healthy = vi.fn();
    const broken: CorePlugin<Values> = {
      name: 'broken',
      setup: () => () => { throw new Error('cleanup failed'); },
      onLifecycle: () => { throw new Error('lifecycle failed'); },
      interceptMutation: () => { throw new Error('interceptor failed'); },
      dispose: () => { throw new Error('dispose failed'); },
    };
    const runtime = new FormRuntime(schema, { name: '', locked: '' }, {
      plugins: [
        broken,
        { name: 'healthy', onLifecycle: healthy },
        { name: 'setup-failure', setup: () => { throw new Error('setup failed'); } },
      ],
      onPluginError: errors,
    });

    expect(() => runtime.setValue('name', 'Ada')).not.toThrow();
    expect(runtime.store.getValue('name')).toBe('Ada');
    expect(healthy).toHaveBeenCalled();
    runtime.dispose();

    expect(errors.mock.calls.map(([failure]) => failure.hook)).toEqual(
      expect.arrayContaining(['setup', 'interceptMutation', 'lifecycle', 'cleanup', 'dispose']),
    );
  });

  it('provides frozen read-only context snapshots', () => {
    const inspect = vi.fn();
    const runtime = new FormRuntime(schema, { name: '', locked: '' }, {
      plugins: [{
        name: 'reader',
        setup(context: CorePluginContext<Values>) {
          inspect(
            Object.isFrozen(context),
            Object.isFrozen(context.schema),
            Object.isFrozen(context.getState()),
          );
        },
      }],
    });

    expect(inspect).toHaveBeenCalledWith(true, true, true);
    runtime.dispose();
  });

  it('ships a value-free lifecycle audit plugin', () => {
    const entries: unknown[] = [];
    const runtime = new FormRuntime(schema, { name: '', locked: '' }, {
      plugins: [createLifecycleAuditPlugin<Values>((entry) => entries.push(entry))],
    });

    runtime.setValue('name', 'secret');

    expect(entries).toContainEqual(expect.objectContaining({
      phase: 'mutation',
      operation: 'setValue',
      paths: ['name'],
    }));
    expect(JSON.stringify(entries)).not.toContain('secret');
    runtime.dispose();
  });


  it('deep-freezes interceptor input and isolates malformed output and error reporters', () => {
    const observations: boolean[] = [];
    const malformed: CorePlugin<Values> = {
      name: 'malformed',
      interceptMutation(mutation) {
        if (mutation.type === 'setValue') {
          observations.push(
            Object.isFrozen(mutation),
            Object.isFrozen(mutation.value),
          );
          return { type: 'setValue', path: '', value: 'invalid' };
        }
      },
    };
    const runtime = new FormRuntime(schema, { name: '', locked: '' }, {
      plugins: [malformed],
      onPluginError: () => { throw new Error('reporter failed'); },
    });

    expect(() => runtime.setValue('name', { nested: 'value' } as unknown as string)).not.toThrow();
    expect(observations).toEqual([true, true]);
    expect(runtime.store.getValue('name')).toEqual({ nested: 'value' });
    runtime.dispose();
  });

});
