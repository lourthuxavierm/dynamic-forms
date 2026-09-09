import type { DataSourceManagerOptions } from '../datasource';
import type { FieldConditionState } from '../conditions';
import type { FormEvent } from '../events';
import type { CorePlugin, CorePluginError } from '../plugins/types';
import type { FormStoreOptions, FormValues } from '../store';

export const RUNTIME_LIFECYCLE_PHASES = [
  'mutation',
  'dependencies',
  'conditions',
  'events',
  'notification',
  'dataSource',
  'validation',
] as const;

export type RuntimeLifecyclePhase = typeof RUNTIME_LIFECYCLE_PHASES[number];
export type RuntimeOperation = 'setValue' | 'setValues' | 'reset' | 'batch' | 'validate' | 'submit';

export interface RuntimeLifecycleEvent<TValues extends FormValues> {
  phase: RuntimeLifecyclePhase;
  operation?: RuntimeOperation;
  paths?: readonly string[];
  formEvent?: FormEvent<unknown, TValues>;
  async: boolean;
}

export type RuntimeLifecycleListener<TValues extends FormValues> = (
  event: Readonly<RuntimeLifecycleEvent<TValues>>,
) => void;

export interface FormRuntimeOptions<TValues extends FormValues> {
  plugins?: readonly CorePlugin<TValues>[];
  onPluginError?: (error: CorePluginError) => void;
  store?: FormStoreOptions;
  dataSources?: DataSourceManagerOptions;
  onConditionChange?: (path: string, state: FieldConditionState) => void;
  onLifecycle?: RuntimeLifecycleListener<TValues>;
}
