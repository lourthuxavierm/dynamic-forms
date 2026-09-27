import { isSamePath } from '../store';
import type {
  DiagnosticTraceFilter,
  RuntimeDiagnosticEvent,
  RuntimeDiagnosticListener,
  RuntimeDiagnostics,
  RuntimeDiagnosticsOptions,
} from './types';

const DEFAULT_LIMIT = 200;

type DiagnosticInput = RuntimeDiagnosticEvent extends infer TEvent
  ? TEvent extends RuntimeDiagnosticEvent ? Omit<TEvent, 'sequence' | 'timestamp'> : never
  : never;

/**
 * Bounded, opt-in diagnostic trace. When disabled, `record` returns before
 * building anything, so the cost is one boolean check per runtime transition.
 */
export class DiagnosticsRecorder implements RuntimeDiagnostics {
  private active: boolean;
  private values: boolean;
  private limit: number;
  private sequence = 0;
  private trace: RuntimeDiagnosticEvent[] = [];
  private readonly listeners = new Set<RuntimeDiagnosticListener>();
  private readonly lastValueChange = new Map<string, number>();
  private lastReset?: number;

  constructor(options: RuntimeDiagnosticsOptions = {}) {
    this.active = options.enabled === true;
    this.values = options.includeValues === true;
    this.limit = normalizeLimit(options.limit);
    if (options.onDiagnostic) this.listeners.add(options.onDiagnostic);
  }

  get enabled(): boolean { return this.active; }
  get includeValues(): boolean { return this.values; }

  enable(options: Pick<RuntimeDiagnosticsOptions, 'includeValues' | 'limit'> = {}): void {
    this.active = true;
    if (options.includeValues !== undefined) this.values = options.includeValues;
    if (options.limit !== undefined) {
      this.limit = normalizeLimit(options.limit);
      this.trim();
    }
  }

  disable(): void { this.active = false; }

  record(input: DiagnosticInput): RuntimeDiagnosticEvent | undefined {
    if (!this.active) return undefined;
    this.sequence += 1;
    // Shallow freeze: nested arrays/state are frozen by the producer, and user
    // values (when includeValues is on) are never frozen on the caller's behalf.
    const event = Object.freeze({ ...input, sequence: this.sequence, timestamp: Date.now() }) as RuntimeDiagnosticEvent;
    if (event.type === 'valueChange') this.lastValueChange.set(event.path, event.sequence);
    if (event.type === 'reset') this.lastReset = event.sequence;
    this.trace.push(event);
    this.trim();
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        // A failing diagnostics consumer must never interrupt Core; surface it asynchronously.
        queueMicrotask(() => { throw error; });
      }
    }
    return event;
  }

  /** Sequence of the most recent recorded value change for a path. */
  valueChangeSequence(path: string): number | undefined {
    const exact = this.lastValueChange.get(path);
    if (exact !== undefined) return exact;
    for (const [key, sequence] of this.lastValueChange) if (isSamePath(key, path)) return sequence;
    return undefined;
  }

  resetSequence(): number | undefined { return this.lastReset; }

  getTrace(filter: DiagnosticTraceFilter = {}): readonly RuntimeDiagnosticEvent[] {
    const types = filter.type === undefined ? undefined : new Set(typeof filter.type === 'string' ? [filter.type] : filter.type);
    return Object.freeze(this.trace.filter((event) =>
      (!types || types.has(event.type))
      && (filter.path === undefined || ('path' in event && isSamePath(event.path, filter.path))
        || (event.type === 'validation' && event.errorPaths.some((path) => isSamePath(path, filter.path!))))));
  }

  /** Most recent trace event matching the filter. */
  latest<TType extends RuntimeDiagnosticEvent['type']>(type: TType, path: string, predicate?: (event: Extract<RuntimeDiagnosticEvent, { type: TType }>) => boolean): Extract<RuntimeDiagnosticEvent, { type: TType }> | undefined {
    for (let index = this.trace.length - 1; index >= 0; index -= 1) {
      const event = this.trace[index];
      if (event.type !== type || !('path' in event) || !isSamePath(event.path, path)) continue;
      const typed = event as Extract<RuntimeDiagnosticEvent, { type: TType }>;
      if (!predicate || predicate(typed)) return typed;
    }
    return undefined;
  }

  subscribe(listener: RuntimeDiagnosticListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  clear(): void {
    this.trace = [];
    this.lastValueChange.clear();
    this.lastReset = undefined;
  }

  dispose(): void {
    this.active = false;
    this.clear();
    this.listeners.clear();
  }

  private trim(): void {
    if (this.trace.length > this.limit) this.trace.splice(0, this.trace.length - this.limit);
  }
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;
}
