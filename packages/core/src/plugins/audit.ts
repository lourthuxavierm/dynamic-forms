import type { FormValues } from '../store';
import type { RuntimeLifecyclePhase, RuntimeOperation } from '../runtime';
import type { CorePlugin } from './types';

export interface LifecycleAuditEntry {
  readonly phase: RuntimeLifecyclePhase;
  readonly operation?: RuntimeOperation;
  readonly paths?: readonly string[];
  readonly async: boolean;
}

export function createLifecycleAuditPlugin<TValues extends FormValues>(
  record: (entry: LifecycleAuditEntry) => void,
): CorePlugin<TValues> {
  return {
    name: 'lifecycle-audit',
    onLifecycle(event) {
      record(Object.freeze({
        phase: event.phase,
        operation: event.operation,
        paths: event.paths ? Object.freeze([...event.paths]) : undefined,
        async: event.async,
      }));
    },
  };
}
