import type { FormStore, FormValues } from '../store';
import type { FieldSchema, FormSchema } from '../schema';
import { evaluateCondition } from './evaluate';

export interface FieldConditionState {
  visible: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
}

export class ConditionController<T extends FormValues = FormValues> {
  private readonly fields = new Map<string, FieldSchema>();
  private readonly states = new Map<string, FieldConditionState>();
  private readonly unsubscribe: () => void;

  constructor(store: FormStore<T>, schema: FormSchema, onChange?: (path: string, state: FieldConditionState) => void) {
    collectFields(schema.fields, '', this.fields);
    this.recalculate(store.getValues(), onChange);
    this.unsubscribe = store.subscribe((state) => this.recalculate(state.values, onChange));
  }

  getState(path: string): FieldConditionState | undefined { return this.states.get(path); }
  dispose(): void { this.unsubscribe(); }

  private recalculate(values: T, onChange?: (path: string, state: FieldConditionState) => void): void {
    for (const [path, field] of this.fields) {
      const next: FieldConditionState = {
        visible: field.visibleWhen ? evaluateCondition(field.visibleWhen, values) : true,
        disabled: field.disabled || (field.disabledWhen ? evaluateCondition(field.disabledWhen, values) : false),
        required: field.validation?.required || (field.requiredWhen ? evaluateCondition(field.requiredWhen, values) : false),
        readOnly: field.readOnly || (field.readOnlyWhen ? evaluateCondition(field.readOnlyWhen, values) : false),
      };
      const previous = this.states.get(path);
      if (!previous || Object.keys(next).some((key) => next[key as keyof FieldConditionState] !== previous[key as keyof FieldConditionState])) {
        this.states.set(path, next);
        onChange?.(path, next);
      }
    }
  }
}

function collectFields(fields: readonly FieldSchema[], parent: string, target: Map<string, FieldSchema>): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    target.set(path, field);
    if (field.fields) collectFields(field.fields, path, target);
  }
}
