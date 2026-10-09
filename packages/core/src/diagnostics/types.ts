import type { AsyncRequestStatus } from '../async';
import type { ConditionExplanationResult, DiagnosticValueType, FieldConditionState } from '../conditions';
import type { DataSourceRequestPhase } from '../datasource';

/** What caused a recorded state transition. */
export type DiagnosticCause =
  | { readonly type: 'initial' }
  | { readonly type: 'reset'; readonly sequence?: number }
  | {
    readonly type: 'valueChange';
    readonly path: string;
    /** Sequence number of the recorded `valueChange` diagnostic, when available. */
    readonly sequence?: number;
  };

interface DiagnosticEventBase {
  /** Monotonic per-runtime ordering number. */
  readonly sequence: number;
  readonly timestamp: number;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ValueChangeDiagnostic extends DiagnosticEventBase {
  readonly type: 'valueChange';
  readonly path: string;
  /** `api` for runtime mutations, `hiddenValuePolicy` when Core cleared a hidden field. */
  readonly origin: 'api' | 'hiddenValuePolicy';
  readonly valueType: DiagnosticValueType;
  readonly previousValueType: DiagnosticValueType;
  /** Present only when `includeValues` is enabled. */
  readonly value?: unknown;
  /** Present only when `includeValues` is enabled. */
  readonly previousValue?: unknown;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ResetDiagnostic extends DiagnosticEventBase {
  readonly type: 'reset';
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ConditionChangeDiagnostic extends DiagnosticEventBase {
  readonly type: 'conditionChange';
  readonly path: string;
  readonly state: Readonly<FieldConditionState>;
  readonly previous?: Readonly<FieldConditionState>;
  /** Flags that differ from `previous` (all flags on first evaluation). */
  readonly changed: readonly (keyof FieldConditionState)[];
  readonly cause: DiagnosticCause;
  readonly hiddenValuePolicy?: 'clear' | 'reset';
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface DependencyRefreshDiagnostic extends DiagnosticEventBase {
  readonly type: 'dependencyRefresh';
  readonly path: string;
  readonly action: 'reset' | 'dataSource';
  /** Direct dependencies of `path` through which the change arrived. */
  readonly via: readonly string[];
  readonly cause: DiagnosticCause;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface DataSourceRequestDiagnostic extends DiagnosticEventBase {
  readonly type: 'dataSourceRequest';
  /** Field path that owns the data source. */
  readonly path: string;
  readonly requestId: number;
  readonly phase: DataSourceRequestPhase;
  /** Error message for `error` phases. The Error object is not retained. */
  readonly error?: string;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ValidationDiagnostic extends DiagnosticEventBase {
  readonly type: 'validation';
  readonly valid: boolean;
  /** Paths that have an error after validation. Messages are not recorded. */
  readonly errorPaths: readonly string[];
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export type RuntimeDiagnosticEvent =
  | ValueChangeDiagnostic
  | ResetDiagnostic
  | ConditionChangeDiagnostic
  | DependencyRefreshDiagnostic
  | DataSourceRequestDiagnostic
  | ValidationDiagnostic;

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export type RuntimeDiagnosticEventType = RuntimeDiagnosticEvent['type'];
/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export type RuntimeDiagnosticListener = (event: RuntimeDiagnosticEvent) => void;

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface RuntimeDiagnosticsOptions {
  /**
   * Record a diagnostic trace. Defaults to `false`; when disabled Core records
   * nothing and `explainFieldState` still works from current state.
   */
  enabled?: boolean;
  /** Include field values in trace entries and explanations. Defaults to `false`. */
  includeValues?: boolean;
  /** Maximum number of trace entries retained (oldest are dropped). Defaults to 200. */
  limit?: number;
  /** Receives every recorded diagnostic event. */
  onDiagnostic?: RuntimeDiagnosticListener;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface DiagnosticTraceFilter {
  /** Only events about this path (any path spelling). */
  path?: string;
  type?: RuntimeDiagnosticEventType | readonly RuntimeDiagnosticEventType[];
}

/** Diagnostics surface exposed by `FormRuntime.diagnostics`, e.g. for DevTools. */
export interface RuntimeDiagnostics {
  readonly enabled: boolean;
  readonly includeValues: boolean;
  /** Start recording. Options override the constructor options. */
  enable(options?: Pick<RuntimeDiagnosticsOptions, 'includeValues' | 'limit'>): void;
  /** Stop recording. The existing trace is kept until `clear()`. */
  disable(): void;
  getTrace(filter?: DiagnosticTraceFilter): readonly RuntimeDiagnosticEvent[];
  subscribe(listener: RuntimeDiagnosticListener): () => void;
  clear(): void;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ExplainFieldStateOptions {
  /** Include actual values in condition explanations. Defaults to the runtime diagnostics setting. */
  includeValues?: boolean;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export type FieldFlagReason =
  | 'default'
  | 'static'
  | 'validation.required'
  | 'visibleWhen'
  | 'disabledWhen'
  | 'readOnlyWhen'
  | 'requiredWhen';

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface FieldFlagExplanation {
  readonly value: boolean;
  /** Where the value came from. */
  readonly reason: FieldFlagReason;
  /** Present when the value came from a conditional rule. */
  readonly condition?: ConditionExplanationResult;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface FieldValidationExplanation {
  /** The error currently stored for the field. */
  readonly error?: string;
  /**
   * `schema` when a built-in schema rule produced the current error,
   * `external` when it came from `setError`, a custom validator, or a server.
   */
  readonly source?: 'schema' | 'external';
  /** Rule code of the schema validator that produced the error (e.g. `required`, `minLength`). */
  readonly rule?: string;
  /** Schema rules configured for the field, including conditional `required`. */
  readonly rules: readonly string[];
  /** Schema rules that currently fail for the field's value. */
  readonly failingRules: readonly string[];
  /** Hidden fields are skipped by schema validation. */
  readonly skippedBecauseHidden: boolean;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface FieldDataSourceExplanation {
  readonly status: AsyncRequestStatus;
  readonly loading: boolean;
  readonly requestId?: number;
  /** Id of the in-flight request, when loading. */
  readonly activeRequestId?: number;
  readonly error?: string;
  /** The most recent superseded or discarded request, when diagnostics are enabled. */
  readonly lastDiscarded?: DataSourceRequestDiagnostic;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface FieldStateExplanation {
  readonly path: string;
  /** `false` when the path is not a field in the schema. */
  readonly exists: boolean;
  readonly visible: FieldFlagExplanation;
  readonly disabled: FieldFlagExplanation;
  readonly readOnly: FieldFlagExplanation;
  readonly required: FieldFlagExplanation;
  readonly validation: FieldValidationExplanation;
  readonly dependencies: {
    readonly dependsOn: readonly string[];
    readonly dependents: readonly string[];
    /** The most recent dependency refresh of this field, when diagnostics are enabled. */
    readonly lastRefresh?: DependencyRefreshDiagnostic;
  };
  readonly dataSource?: FieldDataSourceExplanation;
  /** The most recent condition-state change of this field, when diagnostics are enabled. */
  readonly lastConditionChange?: ConditionChangeDiagnostic;
}
