import * as _lourthuxavierm_dynamic_forms_angular from '@lourthuxavierm/dynamic-forms-angular';
import * as i0 from '@angular/core';
import { Signal, InjectionToken, Provider, EnvironmentProviders, OnDestroy } from '@angular/core';
import { FormValues, FormStore, FormSchema, FormState, FormEvent, FormSubmitHandler, FormValidator, FormEventType } from '@lourthuxavierm/dynamic-forms-core';
import { Observable } from 'rxjs';
import { ControlValueAccessor } from '@angular/forms';

interface DynamicFormOptions<T extends FormValues = FormValues> {
    schema: FormSchema;
    defaultValues?: T;
    store?: FormStore<T>;
    onSubmit?: FormSubmitHandler<T>;
    /** Additional form-level validator composed after schema validation. */
    formValidator?: FormValidator<T>;
}
interface DynamicFieldSignals<T = unknown> {
    value: Signal<T>;
    error: Signal<string | undefined>;
    touched: Signal<boolean>;
    dirty: Signal<boolean>;
    visible: Signal<boolean>;
    disabled: Signal<boolean>;
    required: Signal<boolean>;
    readOnly: Signal<boolean>;
    setValue(value: T): void;
    setTouched(touched?: boolean): void;
    reset(): void;
}
declare class DynamicFormFacade<T extends FormValues = FormValues> {
    private readonly options;
    readonly store: FormStore<T>;
    readonly schema: FormSchema;
    readonly state: Signal<FormState>;
    readonly values: Signal<Readonly<T>>;
    readonly valid: Signal<boolean>;
    readonly submitting: Signal<boolean>;
    readonly events$: Observable<FormEvent>;
    private readonly stateSignal;
    private readonly conditionVersion;
    private readonly conditions;
    private readonly dependencies;
    private readonly unsubscribeState;
    private disposed;
    constructor(options: DynamicFormOptions<T>);
    field<TValue = unknown>(path: string): DynamicFieldSignals<TValue>;
    setValue(path: string, value: unknown): void;
    setValues(values: Partial<T>): void;
    reset(): void;
    resetField(path: string): void;
    validate(): Promise<boolean>;
    submit<TResult = unknown>(): Promise<TResult | undefined>;
    on(type: FormEventType, listener: (event: FormEvent) => void): () => void;
    dispose(): void;
    private validator;
}
declare function createDynamicForm<T extends FormValues = FormValues>(options: DynamicFormOptions<T>): DynamicFormFacade<T>;

interface DynamicFormsConfig {
    developmentWarnings?: boolean;
}
declare const DYNAMIC_FORMS_CONFIG: InjectionToken<DynamicFormsConfig>;
declare const DYNAMIC_FORM_OPTIONS: InjectionToken<DynamicFormOptions<FormValues>>;
declare const DYNAMIC_FORM: InjectionToken<DynamicFormFacade<FormValues>>;
declare function provideDynamicForms(config?: DynamicFormsConfig): EnvironmentProviders;
declare function provideDynamicForm<T extends FormValues>(options: DynamicFormOptions<T>): Provider[];
declare function injectDynamicForm<T extends FormValues = FormValues>(): DynamicFormFacade<T>;
declare function injectDynamicField<T = unknown>(path: string): _lourthuxavierm_dynamic_forms_angular.DynamicFieldSignals<T>;

declare class DynamicFormsValueAccessor<T extends FormValues = FormValues> implements ControlValueAccessor, OnDestroy {
    readonly form: i0.InputSignal<DynamicFormFacade<T>>;
    private removeChange?;
    private onChange;
    private onTouched;
    writeValue(value: T | null): void;
    registerOnChange(fn: (value: T) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DynamicFormsValueAccessor<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DynamicFormsValueAccessor<any>, "[dfValueAccessor]", never, { "form": { "alias": "dfValueAccessor"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare const ANGULAR_ADAPTER_VERSION: "0.1.0";

export { ANGULAR_ADAPTER_VERSION, DYNAMIC_FORM, DYNAMIC_FORMS_CONFIG, DYNAMIC_FORM_OPTIONS, DynamicFormFacade, DynamicFormsValueAccessor, createDynamicForm, injectDynamicField, injectDynamicForm, provideDynamicForm, provideDynamicForms };
export type { DynamicFieldSignals, DynamicFormOptions, DynamicFormsConfig };
