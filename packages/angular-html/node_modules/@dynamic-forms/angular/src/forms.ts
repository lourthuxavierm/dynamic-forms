import { Directive, forwardRef, input, type OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { FormValues } from '@dynamic-forms/core';
import type { DynamicFormFacade } from './facade';

@Directive({
  selector: '[dfValueAccessor]',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DynamicFormsValueAccessor), multi: true }],
})
export class DynamicFormsValueAccessor<T extends FormValues = FormValues> implements ControlValueAccessor, OnDestroy {
  readonly form = input.required<DynamicFormFacade<T>>({ alias: 'dfValueAccessor' });
  private removeChange?: () => void;
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: T | null): void { if (value) this.form().setValues(value); }
  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
    this.removeChange?.();
    this.removeChange = this.form().on('valueChange', () => this.onChange(this.form().store.getValues()));
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { if (disabled) this.onTouched(); }
  ngOnDestroy(): void { this.removeChange?.(); }
}
