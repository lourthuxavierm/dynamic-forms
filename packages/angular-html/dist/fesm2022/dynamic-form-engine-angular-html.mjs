import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { input, computed, ChangeDetectionStrategy, Component, output } from '@angular/core';

class DynamicHtmlFieldComponent {
    field = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "field" }] : /* istanbul ignore next */ []));
    form = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "form" }] : /* istanbul ignore next */ []));
    binding = computed(() => this.form().field(this.field().name), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "binding" }] : /* istanbul ignore next */ []));
    visible = computed(() => this.binding().visible(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visible" }] : /* istanbul ignore next */ []));
    disabled = computed(() => this.binding().disabled(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    required = computed(() => this.binding().required() || Boolean(this.field().validation?.required), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    readOnly = computed(() => this.binding().readOnly() || Boolean(this.field().readOnly), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "readOnly" }] : /* istanbul ignore next */ []));
    error = computed(() => this.binding().error(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    id = computed(() => `df-${this.field().name.replace(/[^a-zA-Z0-9_-]/g, '-')}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    errorId = computed(() => `${this.id()}-error`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorId" }] : /* istanbul ignore next */ []));
    stringValue = computed(() => String(this.binding().value() ?? ''), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stringValue" }] : /* istanbul ignore next */ []));
    booleanValue = computed(() => Boolean(this.binding().value()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "booleanValue" }] : /* istanbul ignore next */ []));
    inputType = computed(() => ['email', 'password', 'url', 'date', 'time'].includes(this.field().type) ? this.field().type : this.field().type === 'datetime' ? 'datetime-local' : 'text', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "inputType" }] : /* istanbul ignore next */ []));
    updateText(event) { this.binding().setValue(event.target.value); }
    updateNumber(event) { const value = event.target.value; this.binding().setValue(value === '' ? undefined : Number(value)); }
    updateChecked(event) { this.binding().setValue(event.target.checked); }
    touch() { this.binding().setTouched(); }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicHtmlFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.3", type: DynamicHtmlFieldComponent, isStandalone: true, selector: "df-html-field", inputs: { field: { classPropertyName: "field", publicName: "field", isSignal: true, isRequired: true, transformFunction: null }, form: { classPropertyName: "form", publicName: "form", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    @if (visible()) {
      <div class="df-field" [attr.data-field-type]="field().type">
        @if (field().type !== 'hidden' && field().type !== 'checkbox') {
          <label [for]="id()">{{ field().label || field().name }}</label>
        }
        @switch (field().type) {
          @case ('textarea') { <textarea [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" [attr.aria-invalid]="error() ? 'true' : null" [attr.aria-describedby]="error() ? errorId() : null" (input)="updateText($event)" (blur)="touch()"></textarea> }
          @case ('checkbox') { <label><input type="checkbox" [id]="id()" [name]="field().name" [checked]="booleanValue()" [disabled]="disabled()" (change)="updateChecked($event)" (blur)="touch()"> {{ field().label || field().name }}</label> }
          @case ('select') { <select [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" (change)="updateText($event)" (blur)="touch()"><option value="">Select</option>@for (option of field().options || []; track option.value) { <option [value]="option.value">{{ option.label }}</option> }</select> }
          @case ('number') { <input type="number" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('integer') { <input type="number" step="1" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('decimal') { <input type="number" step="any" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('hidden') { <input type="hidden" [name]="field().name" [value]="stringValue()"> }
          @default { <input [type]="inputType()" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" [required]="required()" [attr.aria-invalid]="error() ? 'true' : null" [attr.aria-describedby]="error() ? errorId() : null" (input)="updateText($event)" (blur)="touch()"> }
        }
        @if (error()) { <p class="df-error" [id]="errorId()" role="alert">{{ error() }}</p> }
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicHtmlFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'df-html-field',
                    standalone: true,
                    imports: [CommonModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (visible()) {
      <div class="df-field" [attr.data-field-type]="field().type">
        @if (field().type !== 'hidden' && field().type !== 'checkbox') {
          <label [for]="id()">{{ field().label || field().name }}</label>
        }
        @switch (field().type) {
          @case ('textarea') { <textarea [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" [attr.aria-invalid]="error() ? 'true' : null" [attr.aria-describedby]="error() ? errorId() : null" (input)="updateText($event)" (blur)="touch()"></textarea> }
          @case ('checkbox') { <label><input type="checkbox" [id]="id()" [name]="field().name" [checked]="booleanValue()" [disabled]="disabled()" (change)="updateChecked($event)" (blur)="touch()"> {{ field().label || field().name }}</label> }
          @case ('select') { <select [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" (change)="updateText($event)" (blur)="touch()"><option value="">Select</option>@for (option of field().options || []; track option.value) { <option [value]="option.value">{{ option.label }}</option> }</select> }
          @case ('number') { <input type="number" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('integer') { <input type="number" step="1" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('decimal') { <input type="number" step="any" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" (input)="updateNumber($event)" (blur)="touch()"> }
          @case ('hidden') { <input type="hidden" [name]="field().name" [value]="stringValue()"> }
          @default { <input [type]="inputType()" [id]="id()" [name]="field().name" [value]="stringValue()" [disabled]="disabled()" [readOnly]="readOnly()" [required]="required()" [attr.aria-invalid]="error() ? 'true' : null" [attr.aria-describedby]="error() ? errorId() : null" (input)="updateText($event)" (blur)="touch()"> }
        }
        @if (error()) { <p class="df-error" [id]="errorId()" role="alert">{{ error() }}</p> }
      </div>
    }
  `,
                }]
        }], propDecorators: { field: [{ type: i0.Input, args: [{ isSignal: true, alias: "field", required: true }] }], form: [{ type: i0.Input, args: [{ isSignal: true, alias: "form", required: true }] }] } });
class DynamicHtmlFormComponent {
    schema = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "schema" }] : /* istanbul ignore next */ []));
    form = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "form" }] : /* istanbul ignore next */ []));
    submitLabel = input('Submit', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "submitLabel" }] : /* istanbul ignore next */ []));
    submittedValues = output();
    submitted = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "submitted" }] : /* istanbul ignore next */ []));
    async submitForm(event) {
        event.preventDefault();
        if (!await this.form().validate())
            return;
        await this.form().submit();
        this.submittedValues.emit(this.form().store.getValues());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicHtmlFormComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.3", type: DynamicHtmlFormComponent, isStandalone: true, selector: "df-html-form", inputs: { schema: { classPropertyName: "schema", publicName: "schema", isSignal: true, isRequired: true, transformFunction: null }, form: { classPropertyName: "form", publicName: "form", isSignal: true, isRequired: true, transformFunction: null }, submitLabel: { classPropertyName: "submitLabel", publicName: "submitLabel", isSignal: true, isRequired: false, transformFunction: null }, submitted: { classPropertyName: "submitted", publicName: "submitted", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { submittedValues: "submittedValues" }, ngImport: i0, template: `
    <form class="df-form" novalidate (submit)="submitForm($event)">
      @if (!form().valid() && submitted()) { <div class="df-error-summary" role="alert" tabindex="-1"><h2>Correct the form errors</h2></div> }
      @for (field of schema().fields; track field.name) { <df-html-field [field]="field" [form]="form()" /> }
      <ng-content />
      <button type="submit">{{ submitLabel() }}</button>
    </form>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "component", type: DynamicHtmlFieldComponent, selector: "df-html-field", inputs: ["field", "form"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicHtmlFormComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'df-html-form',
                    standalone: true,
                    imports: [CommonModule, DynamicHtmlFieldComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <form class="df-form" novalidate (submit)="submitForm($event)">
      @if (!form().valid() && submitted()) { <div class="df-error-summary" role="alert" tabindex="-1"><h2>Correct the form errors</h2></div> }
      @for (field of schema().fields; track field.name) { <df-html-field [field]="field" [form]="form()" /> }
      <ng-content />
      <button type="submit">{{ submitLabel() }}</button>
    </form>
  `,
                }]
        }], propDecorators: { schema: [{ type: i0.Input, args: [{ isSignal: true, alias: "schema", required: true }] }], form: [{ type: i0.Input, args: [{ isSignal: true, alias: "form", required: true }] }], submitLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "submitLabel", required: false }] }], submittedValues: [{ type: i0.Output, args: ["submittedValues"] }], submitted: [{ type: i0.Input, args: [{ isSignal: true, alias: "submitted", required: false }] }] } });

function createAngularHtmlRegistry(overrides = {}) {
    const result = {};
    for (const [type, component] of Object.entries(overrides))
        if (component)
            result[type] = component;
    return Object.freeze(result);
}
const ANGULAR_HTML_BASELINE_FIELD_TYPES = Object.freeze([
    'text', 'textarea', 'email', 'password', 'url', 'number', 'integer', 'decimal',
    'checkbox', 'select', 'radio', 'date', 'time', 'datetime', 'hidden',
]);

const ANGULAR_HTML_ADAPTER_VERSION = '0.1.0';

/**
 * Generated bundle index. Do not edit.
 */

export { ANGULAR_HTML_ADAPTER_VERSION, ANGULAR_HTML_BASELINE_FIELD_TYPES, DynamicHtmlFieldComponent, DynamicHtmlFormComponent, createAngularHtmlRegistry };
//# sourceMappingURL=dynamic-form-engine-angular-html.mjs.map
