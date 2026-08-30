import { DestroyRef, InjectionToken, inject, makeEnvironmentProviders, type EnvironmentProviders, type Provider } from '@angular/core';
import type { FormValues } from '@dynamic-form-engine/core';
import { DynamicFormFacade, type DynamicFormOptions } from './facade';

export interface DynamicFormsConfig { developmentWarnings?: boolean; }
export const DYNAMIC_FORMS_CONFIG = new InjectionToken<DynamicFormsConfig>('DYNAMIC_FORMS_CONFIG');
export const DYNAMIC_FORM_OPTIONS = new InjectionToken<DynamicFormOptions>('DYNAMIC_FORM_OPTIONS');
export const DYNAMIC_FORM = new InjectionToken<DynamicFormFacade>('DYNAMIC_FORM');

export function provideDynamicForms(config: DynamicFormsConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: DYNAMIC_FORMS_CONFIG, useValue: config }]);
}

export function provideDynamicForm<T extends FormValues>(options: DynamicFormOptions<T>): Provider[] {
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

export function injectDynamicForm<T extends FormValues = FormValues>(): DynamicFormFacade<T> {
  return inject(DYNAMIC_FORM) as DynamicFormFacade<T>;
}

export function injectDynamicField<T = unknown>(path: string) {
  return injectDynamicForm().field<T>(path);
}
