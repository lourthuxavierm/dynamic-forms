import type { FieldType } from "../schema";

export interface FieldDefinition {
  type: FieldType | string;
  metadata?: Record<string, unknown>;
}

export class FieldRegistry {
  private readonly fields = new Map<string, FieldDefinition>();

  register(definition: FieldDefinition): void {
    this.fields.set(definition.type, definition);
  }

  get(type: string): FieldDefinition | undefined {
    return this.fields.get(type);
  }

  has(type: string): boolean {
    return this.fields.has(type);
  }

  unregister(type: string): void {
    this.fields.delete(type);
  }

  clear(): void {
    this.fields.clear();
  }

  getTypes(): string[] {
    return Array.from(this.fields.keys());
  }
}
