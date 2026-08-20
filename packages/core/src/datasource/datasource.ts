import type {
  DataSource,
  DataSourceContext
} from "./types";

export class DataSourceManager {
  private readonly sources = new Map<string, DataSource>();

  register<T>(
    name: string,
    source: DataSource<T>
  ): void {
    this.sources.set(name, source);
  }

  unregister(name: string): void {
    this.sources.delete(name);
  }

  has(name: string): boolean {
    return this.sources.has(name);
  }

  async load<T>(
    name: string,
    context: DataSourceContext
  ): Promise<T[]> {
    const source = this.sources.get(name);

    if (!source) {
      throw new Error(`Data source "${name}" is not registered`);
    }

    return source(context) as Promise<T[]> | T[];
  }

  clear(): void {
    this.sources.clear();
  }
}
