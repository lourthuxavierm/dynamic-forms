import * as i0 from '@angular/core';
import { signal, computed, InjectionToken, makeEnvironmentProviders, inject, DestroyRef, input, forwardRef, Directive } from '@angular/core';
import { FormStore, ConditionController, DependencyController, createFormValidator } from '@dynamic-forms/core';
import { Observable } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

class DynamicFormFacade {
    options;
    store;
    schema;
    state;
    values;
    valid;
    submitting;
    events$;
    stateSignal;
    conditionVersion = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conditionVersion" }] : /* istanbul ignore next */ []));
    conditions;
    dependencies;
    unsubscribeState;
    disposed = false;
    constructor(options) {
        this.options = options;
        this.schema = options.schema;
        this.store = options.store ?? new FormStore(options.defaultValues);
        this.stateSignal = signal(this.store.getState(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "stateSignal" }] : /* istanbul ignore next */ []));
        this.state = this.stateSignal.asReadonly();
        this.values = computed(() => this.stateSignal().values, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "values" }] : /* istanbul ignore next */ []));
        this.valid = computed(() => this.stateSignal().valid, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "valid" }] : /* istanbul ignore next */ []));
        this.submitting = computed(() => this.stateSignal().submitting, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "submitting" }] : /* istanbul ignore next */ []));
        this.conditions = new ConditionController(this.store, this.schema);
        this.dependencies = new DependencyController(this.store, this.schema);
        this.unsubscribeState = this.store.subscribe((state) => {
            this.stateSignal.set(state);
            this.conditionVersion.update((value) => value + 1);
        });
        this.events$ = new Observable((subscriber) => {
            const eventTypes = ['valueChange', 'validate', 'submit', 'reset'];
            const removers = eventTypes.map((type) => this.store.on(type, (event) => subscriber.next(event)));
            return () => removers.forEach((remove) => remove());
        });
    }
    field(path) {
        const condition = () => {
            this.conditionVersion();
            return this.conditions.getState(path);
        };
        return {
            value: computed(() => this.store.getValue(path)),
            error: computed(() => this.stateSignal().errors[path]),
            touched: computed(() => this.stateSignal().touched[path] ?? false),
            dirty: computed(() => this.stateSignal().dirty[path] ?? false),
            visible: computed(() => condition()?.visible ?? true),
            disabled: computed(() => condition()?.disabled ?? false),
            required: computed(() => condition()?.required ?? false),
            readOnly: computed(() => condition()?.readOnly ?? false),
            setValue: (value) => this.store.setValue(path, value),
            setTouched: (touched = true) => this.store.setTouched(path, touched),
            reset: () => this.store.resetField(path),
        };
    }
    setValue(path, value) { this.store.setValue(path, value); }
    setValues(values) { this.store.setValues(values); }
    reset() { this.store.reset(); }
    resetField(path) { this.store.resetField(path); }
    validate() { return this.store.validate(createFormValidator(this.schema)); }
    async submit() {
        if (!this.options.onSubmit)
            return undefined;
        return this.store.submit(this.options.onSubmit, createFormValidator(this.schema));
    }
    on(type, listener) { return this.store.on(type, listener); }
    dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.unsubscribeState();
        this.conditions.dispose();
        this.dependencies.dispose();
    }
}
function createDynamicForm(options) {
    return new DynamicFormFacade(options);
}

const DYNAMIC_FORMS_CONFIG = new InjectionToken('DYNAMIC_FORMS_CONFIG');
const DYNAMIC_FORM_OPTIONS = new InjectionToken('DYNAMIC_FORM_OPTIONS');
const DYNAMIC_FORM = new InjectionToken('DYNAMIC_FORM');
function provideDynamicForms(config = {}) {
    return makeEnvironmentProviders([{ provide: DYNAMIC_FORMS_CONFIG, useValue: config }]);
}
function provideDynamicForm(options) {
    return [
        { provide: DYNAMIC_FORM_OPTIONS, useValue: options },
        {
            provide: DYNAMIC_FORM,
            useFactory: () => {
                const form = new DynamicFormFacade(options);
                inject(DestroyRef).onDestroy(() => form.dispose());
                return form;
            },
        },
    ];
}
function injectDynamicForm() {
    return inject(DYNAMIC_FORM);
}
function injectDynamicField(path) {
    return injectDynamicForm().field(path);
}

class DynamicFormsValueAccessor {
    form = input.required({ ...(ngDevMode ? { debugName: "form" } : /* istanbul ignore next */ {}), alias: 'dfValueAccessor' });
    removeChange;
    onChange = () => undefined;
    onTouched = () => undefined;
    writeValue(value) { if (value)
        this.form().setValues(value); }
    registerOnChange(fn) {
        this.onChange = fn;
        this.removeChange?.();
        this.removeChange = this.form().on('valueChange', () => this.onChange(this.form().store.getValues()));
    }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(disabled) { if (disabled)
        this.onTouched(); }
    ngOnDestroy() { this.removeChange?.(); }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicFormsValueAccessor, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.3", type: DynamicFormsValueAccessor, isStandalone: true, selector: "[dfValueAccessor]", inputs: { form: { classPropertyName: "form", publicName: "dfValueAccessor", isSignal: true, isRequired: true, transformFunction: null } }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DynamicFormsValueAccessor), multi: true }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.3", ngImport: i0, type: DynamicFormsValueAccessor, decorators: [{
            type: Directive,
            args: [{
                    selector: '[dfValueAccessor]',
                    standalone: true,
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DynamicFormsValueAccessor), multi: true }],
                }]
        }], propDecorators: { form: [{ type: i0.Input, args: [{ isSignal: true, alias: "dfValueAccessor", required: true }] }] } });

const ANGULAR_ADAPTER_VERSION = '0.1.0';

/**
 * Generated bundle index. Do not edit.
 */

export { ANGULAR_ADAPTER_VERSION, DYNAMIC_FORM, DYNAMIC_FORMS_CONFIG, DYNAMIC_FORM_OPTIONS, DynamicFormFacade, DynamicFormsValueAccessor, createDynamicForm, injectDynamicField, injectDynamicForm, provideDynamicForm, provideDynamicForms };
//# sourceMappingURL=dynamic-forms-angular.mjs.map
