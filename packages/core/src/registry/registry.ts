import type { FieldDefinition, RegistryOptions } from './types';

export class FieldRegistry<TComponent = unknown, TMetadata extends Record<string, unknown> = Record<string, unknown>, TType extends string = string> {
  private readonly fields = new Map<TType, FieldDefinition<TComponent, TMetadata, TType>>();
  private readonly options: RegistryOptions;

  constructor(options: RegistryOptions = { allowOverrides: true }) {
    this.options = options;
  }

  register(definition: FieldDefinition<TComponent, TMetadata, TType>): void {
    if (!this.options.allowOverrides && this.fields.has(definition.type)) {
      throw new Error(
        `Field type "${definition.type}" is already registered and overrides are disabled.`
      );
    }
    this.fields.set(definition.type, definition);
  }

  registerMany(definitions: readonly FieldDefinition<TComponent, TMetadata, TType>[]): void {
    definitions.forEach((def) => this.register(def));
  }

  get(type: TType): FieldDefinition<TComponent, TMetadata, TType> | undefined {
    return this.fields.get(type);
  }

  has(type: TType): boolean {
    return this.fields.has(type);
  }

  unregister(type: TType): void {
    this.fields.delete(type);
  }

  override(type: TType, definition: FieldDefinition<TComponent, TMetadata, TType>): void {
    this.fields.set(type, { ...definition, type });
  }

  clear(): void {
    this.fields.clear();
  }

  getTypes(): TType[] {
    return Array.from(this.fields.keys());
  }

  getAll(): FieldDefinition<TComponent, TMetadata, TType>[] {
    return Array.from(this.fields.values());
  }
}
