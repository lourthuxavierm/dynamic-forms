import { normalizeAsyncError } from '../async';
import type { FormValues } from '../store';
import type { RuntimeLifecycleEvent } from '../runtime/types';
import type {
  CancelMutation,
  CoreMutation,
  CorePlugin,
  CorePluginContext,
  CorePluginError,
} from './types';

interface ActivePlugin<TValues extends FormValues> {
  plugin: CorePlugin<TValues>;
  cleanup?: () => void;
}

export class CorePluginHost<TValues extends FormValues> {
  private readonly active: ActivePlugin<TValues>[] = [];
  private disposed = false;

  constructor(
    plugins: readonly CorePlugin<TValues>[],
    private readonly context: CorePluginContext<TValues>,
    private readonly onError?: (error: CorePluginError) => void,
  ) {
    const names = new Set<string>();
    for (const plugin of plugins) {
      if (!plugin.name || names.has(plugin.name)) {
        this.report(plugin.name || '<unnamed>', 'setup', new Error(
          plugin.name ? `Duplicate plugin name: ${plugin.name}` : 'Plugin name is required.',
        ));
        continue;
      }
      names.add(plugin.name);
      try {
        const setupResult = plugin.setup?.(context);
        const cleanup = typeof setupResult === 'function' ? setupResult : undefined;
        this.active.push({ plugin, cleanup });
      } catch (error) {
        this.report(plugin.name, 'setup', error);
      }
    }
  }

  emitLifecycle(event: Readonly<RuntimeLifecycleEvent<TValues>>): void {
    if (this.disposed) return;
    for (const { plugin } of this.active) {
      if (!plugin.onLifecycle) continue;
      try {
        plugin.onLifecycle(event, this.context);
      } catch (error) {
        this.report(plugin.name, 'lifecycle', error);
      }
    }
  }

  interceptMutation<TMutation extends CoreMutation<TValues>>(
    mutation: TMutation,
  ): TMutation | CancelMutation {
    let current: CoreMutation<TValues> = freezeMutation<TValues>(mutation);
    if (this.disposed) return current as TMutation;
    for (const { plugin } of this.active) {
      if (!plugin.interceptMutation) continue;
      try {
        const result = plugin.interceptMutation(current, this.context);
        if (!result) continue;
        if ('cancel' in result) {
          if (result.cancel === true) return Object.freeze({ ...result });
          throw new Error('A cancelled mutation must use cancel: true.');
        }
        if (result.type !== current.type) {
          throw new Error('Mutation interceptors cannot change the mutation type.');
        }
        if (!isValidMutation(result)) {
          throw new Error(`Invalid ${result.type} mutation returned by interceptor.`);
        }
        current = freezeMutation<TValues>(result as CoreMutation<TValues>);
      } catch (error) {
        this.report(plugin.name, 'interceptMutation', error);
      }
    }
    return current as TMutation;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const { plugin, cleanup } of [...this.active].reverse()) {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          this.report(plugin.name, 'cleanup', error);
        }
      }
      if (plugin.dispose) {
        try {
          plugin.dispose(this.context);
        } catch (error) {
          this.report(plugin.name, 'dispose', error);
        }
      }
    }
    this.active.length = 0;
  }

  private report(plugin: string, hook: CorePluginError['hook'], error: unknown): void {
    try {
      this.onError?.(Object.freeze({ plugin, hook, error: normalizeAsyncError(error) }));
    } catch {
      // Error reporting is observational and must never interrupt the runtime.
    }
  }
}

function freezeMutation<TValues extends FormValues>(
  mutation: CoreMutation<TValues>,
): CoreMutation<TValues> {
  if (mutation.type === 'setValue') {
    return Object.freeze({
      ...mutation,
      value: cloneReadonly(mutation.value),
      options: mutation.options ? Object.freeze({ ...mutation.options }) : undefined,
    });
  }
  if (mutation.type === 'setValues') {
    return Object.freeze({
      ...mutation,
      values: cloneReadonly(mutation.values),
      options: mutation.options ? Object.freeze({ ...mutation.options }) : undefined,
    });
  }
  return Object.freeze({
    ...mutation,
    values: mutation.values ? cloneReadonly(mutation.values) : undefined,
    options: mutation.options ? Object.freeze({ ...mutation.options }) : undefined,
  });
}

function isValidMutation<TValues extends FormValues>(
  mutation: CoreMutation<TValues>,
): boolean {
  if (mutation.type === 'setValue') return typeof mutation.path === 'string' && mutation.path.length > 0;
  if (mutation.type === 'setValues') return mutation.values !== null && typeof mutation.values === 'object';
  return mutation.values === undefined || (mutation.values !== null && typeof mutation.values === 'object');
}

function cloneReadonly<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;
  const existing = seen.get(value);
  if (existing) return existing as T;
  if (value instanceof Date) return Object.freeze(new Date(value.getTime())) as T;
  const clone: unknown = Array.isArray(value) ? [] : {};
  seen.set(value, clone);
  for (const [key, nested] of Object.entries(value)) {
    (clone as Record<string, unknown>)[key] = cloneReadonly(nested, seen);
  }
  return Object.freeze(clone) as T;
}
