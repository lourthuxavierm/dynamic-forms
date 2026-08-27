import '@dynamic-forms/angular-html/styles.css';
import './styles.css';
import { ChangeDetectionStrategy, Component, OnDestroy, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import type { FormSchema } from '@dynamic-forms/core';
import { createDynamicForm } from '@dynamic-forms/angular';
import { DynamicHtmlFormComponent } from '@dynamic-forms/angular-html';

type ProfileValues = Record<string, unknown> & {
  name: string; email: string; age?: number; role: string; active: boolean; startDate: string;
};

const schema: FormSchema = {
  id: 'angular-html-profile',
  fields: [
    { name: 'name', type: 'text', label: 'Full name', validation: { required: true, minLength: 2 } },
    { name: 'email', type: 'email', label: 'Email', validation: { required: true } },
    { name: 'age', type: 'integer', label: 'Age', config: { min: 18, max: 120 } },
    { name: 'role', type: 'select', label: 'Role', options: [{ label: 'Developer', value: 'developer' }, { label: 'Architect', value: 'architect' }] },
    { name: 'active', type: 'checkbox', label: 'Active employee' },
    { name: 'startDate', type: 'date', label: 'Start date' },
  ],
};

@Component({
  selector: 'df-angular-playground',
  standalone: true,
  imports: [DynamicHtmlFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <p class="eyebrow">&#64;dynamic-forms/angular-html</p>
      <h1>Angular HTML experimental playground</h1>
      <p>Angular 22, readonly signals, zoneless change detection, Core validation, and browser-native controls.</p>
      <section class="layout">
        <df-html-form [schema]="schema" [form]="form" submitLabel="Create profile" (submittedValues)="submitted = $event" />
        <aside aria-live="polite"><h2>Submitted values</h2><pre>{{ submitted ? json(submitted) : 'Submit a valid form.' }}</pre></aside>
      </section>
    </main>
  `,
})
class AppComponent implements OnDestroy {
  readonly schema = schema;
  readonly form = createDynamicForm<ProfileValues>({
    schema,
    defaultValues: { name: '', email: '', age: undefined, role: '', active: false, startDate: '' },
  });
  submitted?: Readonly<ProfileValues>;
  json(value: unknown): string { return JSON.stringify(value, null, 2); }
  ngOnDestroy(): void { this.form.dispose(); }
}

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }).catch(console.error);
