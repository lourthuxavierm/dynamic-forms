import type { FieldDefinition, RegistryOptions } from './types';

export class FieldRegistry<TComponent = any> {
  private readonly fields = new Map<string, FieldDefinition<TComponent>>();
  private readonly options: RegistryOptions;

  constructor(options: RegistryOptions = { allowOverrides: true }) {
    this.options = options;
  }

  register(definition: FieldDefinition<TComponent>): void {
    if (!this.options.allowOverrides && this.fields.has(definition.type)) {
      throw new Error(
        `Field type "${definition.type}" is already registered and overrides are disabled.`
      );
    }
    this.fields.set(definition.type, definition);
  }

  registerMany(definitions: FieldDefinition<TComponent>[]): void {
    definitions.forEach((def) => this.register(def));
  }

  get(type: string): FieldDefinition<TComponent> | undefined {
    return this.fields.get(type);
  }

  has(type: string): boolean {
    return this.fields.has(type);
  }

  unregister(type: string): void {
    this.fields.delete(type);
  }

  override(type: string, definition: FieldDefinition<TComponent>): void {
    this.fields.set(type, { ...definition, type });
  }

  clear(): void {
    this.fields.clear();
  }

  getTypes(): string[] {
    return Array.from(this.fields.keys());
  }

  getAll(): FieldDefinition<TComponent>[] {
    return Array.from(this.fields.values());
  }
}
