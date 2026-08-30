import { FieldRegistry, type FieldDefinition } from '@dynamic-form-engine/core';
import type { ComponentType } from 'react';
import type { FieldComponentProps } from './components/DynamicField';

/** Register a React control while preserving the value type it receives. */
export function registerReactField<TValue = unknown>(
  registry: FieldRegistry<ComponentType<FieldComponentProps<TValue>>>,
  definition: Omit<FieldDefinition<ComponentType<FieldComponentProps<TValue>>>, 'component'> & {
    component: ComponentType<FieldComponentProps<TValue>>;
  },
): FieldRegistry<ComponentType<FieldComponentProps<TValue>>> {
  registry.register(definition);
  return registry;
}