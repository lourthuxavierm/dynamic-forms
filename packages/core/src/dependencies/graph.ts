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

  /**
   * Returns all dependents of one or more changed fields in a stable topological
   * order. A field appears once and always after every changed upstream field.
   */
  getTransitiveDependents(field: string | readonly string[]): string[] {
    const roots = [...new Set(typeof field === 'string' ? [field] : field)].sort();
    const reachable = new Set<string>(roots);
    const pending = [...roots];
    while (pending.length) {
      const source = pending.shift()!;
      for (const dependent of this.getDependents(source).sort()) {
        if (reachable.has(dependent)) continue;
        reachable.add(dependent);
        pending.push(dependent);
      }
    }

    const indegree = new Map<string, number>([...reachable].map((path) => [path, 0]));
    for (const path of reachable) {
      for (const dependency of this.graph.get(path) ?? []) {
        if (reachable.has(dependency)) indegree.set(path, (indegree.get(path) ?? 0) + 1);
      }
    }
    const available = [...reachable].filter((path) => indegree.get(path) === 0).sort();
    const ordered: string[] = [];
    while (available.length) {
      const source = available.shift()!;
      ordered.push(source);
      for (const dependent of this.getDependents(source).filter((path) => reachable.has(path)).sort()) {
        const next = (indegree.get(dependent) ?? 0) - 1;
        indegree.set(dependent, next);
        if (next === 0) {
          available.push(dependent);
          available.sort();
        }
      }
    }
    return ordered.filter((path) => !roots.includes(path));
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
