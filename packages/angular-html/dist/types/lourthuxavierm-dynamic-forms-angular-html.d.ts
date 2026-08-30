import * as _angular_core from '@angular/core';
import { Type } from '@angular/core';
import * as _lourthuxavierm_dynamic_forms_angular from '@lourthuxavierm/dynamic-forms-angular';
import { DynamicFormFacade } from '@lourthuxavierm/dynamic-forms-angular';
import { FieldSchema, FormValues, FormSchema } from '@lourthuxavierm/dynamic-forms-core';

declare class DynamicHtmlFieldComponent {
    readonly field: _angular_core.InputSignal<FieldSchema>;
    readonly form: _angular_core.InputSignal<DynamicFormFacade<FormValues>>;
    readonly binding: _angular_core.Signal<_lourthuxavierm_dynamic_forms_angular.DynamicFieldSignals<unknown>>;
    readonly visible: _angular_core.Signal<boolean>;
    readonly disabled: _angular_core.Signal<boolean>;
    readonly required: _angular_core.Signal<boolean>;
    readonly readOnly: _angular_core.Signal<boolean>;
    readonly error: _angular_core.Signal<string | undefined>;
    readonly id: _angular_core.Signal<string>;
    readonly errorId: _angular_core.Signal<string>;
    readonly stringValue: _angular_core.Signal<string>;
    readonly booleanValue: _angular_core.Signal<boolean>;
    readonly inputType: _angular_core.Signal<string>;
    updateText(event: Event): void;
    updateNumber(event: Event): void;
    updateChecked(event: Event): void;
    touch(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DynamicHtmlFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DynamicHtmlFieldComponent, "df-html-field", never, { "field": { "alias": "field"; "required": true; "isSignal": true; }; "form": { "alias": "form"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}
declare class DynamicHtmlFormComponent<T extends FormValues = FormValues> {
    readonly schema: _angular_core.InputSignal<FormSchema>;
    readonly form: _angular_core.InputSignal<DynamicFormFacade<T>>;
    readonly submitLabel: _angular_core.InputSignal<string>;
    readonly submittedValues: _angular_core.OutputEmitterRef<Readonly<T>>;
    readonly submitted: _angular_core.InputSignal<boolean>;
    submitForm(event: Event): Promise<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DynamicHtmlFormComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DynamicHtmlFormComponent<any>, "df-html-form", never, { "schema": { "alias": "schema"; "required": true; "isSignal": true; }; "form": { "alias": "form"; "required": true; "isSignal": true; }; "submitLabel": { "alias": "submitLabel"; "required": false; "isSignal": true; }; "submitted": { "alias": "submitted"; "required": false; "isSignal": true; }; }, { "submittedValues": "submittedValues"; }, never, ["*"], true, never>;
}

type AngularHtmlFieldComponent = Type<unknown>;
type AngularHtmlRegistry = Readonly<Record<string, AngularHtmlFieldComponent>>;
type AngularHtmlRegistryOverrides = Readonly<Record<string, AngularHtmlFieldComponent | undefined>>;
declare function createAngularHtmlRegistry(overrides?: AngularHtmlRegistryOverrides): AngularHtmlRegistry;
declare const ANGULAR_HTML_BASELINE_FIELD_TYPES: readonly ["text", "textarea", "email", "password", "url", "number", "integer", "decimal", "checkbox", "select", "radio", "date", "time", "datetime", "hidden"];

declare const ANGULAR_HTML_ADAPTER_VERSION: "0.1.0";

export { ANGULAR_HTML_ADAPTER_VERSION, ANGULAR_HTML_BASELINE_FIELD_TYPES, DynamicHtmlFieldComponent, DynamicHtmlFormComponent, createAngularHtmlRegistry };
export type { AngularHtmlFieldComponent, AngularHtmlRegistry, AngularHtmlRegistryOverrides };
