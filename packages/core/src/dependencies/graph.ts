import type { FieldDependency } from './types';

export class DependencyGraph {
  private readonly graph = new Map<string, Set<string>>();

  constructor(dependencies: readonly FieldDependency[] = []) {
    for (const dependency of dependencies) this.setDependencies(dependency.field, dependency.dependsOn);
  }

  setDependencies(field: string, dependsOn: readonly string[]): void {
    const nextGraph = new Map(this.graph);
    nextGraph.set(field, new Set(dependsOn));
    const cycle = findCycle(nextGraph);
    if (cycle) throw new Error(`Dependency cycle detected: ${cycle.join(' -> ')}`);
    this.graph.set(field, new Set(dependsOn));
  }

  getDependencies(field: string): string[] { return [...(this.graph.get(field) ?? [])]; }
  hasDependency(field: string, dependency: string): boolean { return this.graph.get(field)?.has(dependency) ?? false; }

  getDependents(field: string): string[] {
    return [...this.graph].filter(([, dependencies]) => dependencies.has(field)).map(([dependent]) => dependent);
  }

  getTransitiveDependents(field: string): string[] {
    const ordered: string[] = [];
    const visited = new Set<string>();
    const visit = (source: string) => {
      for (const dependent of this.getDependents(source).sort()) {
        if (visited.has(dependent)) continue;
        visited.add(dependent);
        ordered.push(dependent);
        visit(dependent);
      }
    };
    visit(field);
    return ordered;
  }

  clear(): void { this.graph.clear(); }
}

function findCycle(graph: Map<string, Set<string>>): string[] | undefined {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (field: string, trail: string[]): string[] | undefined => {
    if (visiting.has(field)) return [...trail, field];
    if (visited.has(field)) return undefined;
    visiting.add(field);
    for (const dependency of graph.get(field) ?? []) {
      const cycle = visit(dependency, [...trail, field]);
      if (cycle) return cycle;
    }
    visiting.delete(field);
    visited.add(field);
    return undefined;
  };
  for (const field of graph.keys()) {
    const cycle = visit(field, []);
    if (cycle) return cycle;
  }
  return undefined;
}
