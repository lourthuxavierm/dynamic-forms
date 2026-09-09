import type { DataSourceResult } from '../datasource';
import type { FieldConditionState } from '../conditions';
import type { FormSchema } from '../schema';
import type {
  FormState,
  FormValues,
  ResetOptions,
  SetValueOptions,
} from '../store';
import type { RuntimeLifecycleEvent } from '../runtime/types';

export type CoreMutation<TValues extends FormValues> =
  | {
    readonly type: 'setValue';
    readonly path: string;
    readonly value: unknown;
    readonly options?: Readonly<SetValueOptions>;
  }
  | {
    readonly type: 'setValues';
    readonly values: Readonly<Partial<TValues>>;
    readonly options?: Readonly<SetValueOptions>;
  }
  | {
    readonly type: 'reset';
    readonly values?: Readonly<TValues>;
    readonly options?: Readonly<ResetOptions>;
  };

export interface CancelMutation {
  readonly cancel: true;
  readonly reason?: string;
}

export type MutationInterceptorResult<TValues extends FormValues> =
  | CoreMutation<TValues>
  | CancelMutation
  | void;

export interface CorePluginContext<TValues extends FormValues> {
  readonly schema: Readonly<FormSchema>;
  getState(): Readonly<FormState<TValues>>;
  getConditionState(path: string): Readonly<FieldConditionState> | undefined;
  getDataSourceState<T = unknown>(name: string): Readonly<DataSourceResult<T>> | undefined;
}

export type CorePluginHook = 'setup' | 'lifecycle' | 'interceptMutation' | 'cleanup' | 'dispose';

export interface CorePluginError {
  readonly plugin: string;
  readonly hook: CorePluginHook;
  readonly error: Error;
}

export interface CorePlugin<TValues extends FormValues> {
  readonly name: string;
  setup?(context: CorePluginContext<TValues>): void | (() => void);
  onLifecycle?(
    event: Readonly<RuntimeLifecycleEvent<TValues>>,
    context: CorePluginContext<TValues>,
  ): void;
  interceptMutation?(
    mutation: Readonly<CoreMutation<TValues>>,
    context: CorePluginContext<TValues>,
  ): MutationInterceptorResult<TValues>;
  dispose?(context: CorePluginContext<TValues>): void;
}
