import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { FieldSchema, FormSchema, FormValues } from '@dynamic-form-engine/core';
import type { DynamicFormFacade } from '@dynamic-form-engine/angular';

@Component({
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
})
export class DynamicHtmlFieldComponent {
  readonly field = input.required<FieldSchema>();
  readonly form = input.required<DynamicFormFacade>();
  readonly binding = computed(() => this.form().field(this.field().name));
  readonly visible = computed(() => this.binding().visible());
  readonly disabled = computed(() => this.binding().disabled());
  readonly required = computed(() => this.binding().required() || Boolean(this.field().validation?.required));
  readonly readOnly = computed(() => this.binding().readOnly() || Boolean(this.field().readOnly));
  readonly error = computed(() => this.binding().error());
  readonly id = computed(() => `df-${this.field().name.replace(/[^a-zA-Z0-9_-]/g, '-')}`);
  readonly errorId = computed(() => `${this.id()}-error`);
  readonly stringValue = computed(() => String(this.binding().value() ?? ''));
  readonly booleanValue = computed(() => Boolean(this.binding().value()));
  readonly inputType = computed(() => ['email', 'password', 'url', 'date', 'time'].includes(this.field().type) ? this.field().type : this.field().type === 'datetime' ? 'datetime-local' : 'text');

  updateText(event: Event): void { this.binding().setValue((event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value); }
  updateNumber(event: Event): void { const value = (event.target as HTMLInputElement).value; this.binding().setValue(value === '' ? undefined : Number(value)); }
  updateChecked(event: Event): void { this.binding().setValue((event.target as HTMLInputElement).checked); }
  touch(): void { this.binding().setTouched(); }
}

@Component({
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
})
export class DynamicHtmlFormComponent<T extends FormValues = FormValues> {
  readonly schema = input.required<FormSchema>();
  readonly form = input.required<DynamicFormFacade<T>>();
  readonly submitLabel = input('Submit');
  readonly submittedValues = output<Readonly<T>>();
  readonly submitted = input(false);

  async submitForm(event: Event): Promise<void> {
    event.preventDefault();
    if (!await this.form().validate()) return;
    await this.form().submit();
    this.submittedValues.emit(this.form().store.getValues());
  }
}
