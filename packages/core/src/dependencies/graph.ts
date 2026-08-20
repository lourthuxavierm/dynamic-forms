import type { FieldDependency } from "./types";

export class DependencyGraph {
  private readonly graph = new Map<string, Set<string>>();

  constructor(dependencies: FieldDependency[] = []) {
    for (const dependency of dependencies) {
      this.setDependencies(dependency.field, dependency.dependsOn);
    }
  }

  setDependencies(field: string, dependsOn: string[]): void {
    this.graph.set(field, new Set(dependsOn));
  }

  getDependencies(field: string): string[] {
    return Array.from(this.graph.get(field) ?? []);
  }

  hasDependency(field: string, dependency: string): boolean {
    return this.graph.get(field)?.has(dependency) ?? false;
  }

  getDependents(field: string): string[] {
    const dependents: string[] = [];

    for (const [dependent, dependencies] of this.graph) {
      if (dependencies.has(field)) {
        dependents.push(dependent);
      }
    }

    return dependents;
  }

  clear(): void {
    this.graph.clear();
  }
}
