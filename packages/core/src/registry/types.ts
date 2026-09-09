import type { FieldType } from '../schema';

export interface FieldDefinition<
  TComponent = unknown,
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
  TType extends string = string,
> {
  type: TType;
  component: TComponent;
  metadata?: TMetadata;
}

export interface RegistryOptions {
  allowOverrides?: boolean;
}