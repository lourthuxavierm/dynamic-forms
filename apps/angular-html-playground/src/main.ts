import '@dynamic-forms/angular-html/styles.css';
import './styles.css';
import { ChangeDetectionStrategy, Component, OnDestroy, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { createDynamicForm } from '@dynamic-forms/angular';
import { DynamicHtmlFormComponent } from '@dynamic-forms/angular-html';
import { getFormExample } from '@dynamic-forms/examples';

const requested = new URLSearchParams(window.location.search).get('example');
const candidate = getFormExample(requested);
const selected = candidate.renderers.includes('angular-html') ? candidate : getFormExample('basic-form');

@Component({
  selector: 'df-angular-playground', standalone: true, imports: [DynamicHtmlFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <p class="eyebrow">&#64;dynamic-forms/examples + &#64;dynamic-forms/angular-html</p>
      <h1>Angular HTML shared example</h1>
      <p>Angular 22 renders the same versioned schema and initial values used by the React HTML catalogue.</p>
      <p><strong>{{ example.title }}</strong> · Schema {{ example.schema.version }} · zoneless</p>
      <section class="layout">
        <df-html-form [schema]="example.schema" [form]="form" [submitLabel]="'Submit ' + example.title" (submittedValues)="submitted = $event" />
        <aside aria-live="polite"><h2>Submitted values</h2><pre>{{ submitted ? json(submitted) : 'Submit a valid form.' }}</pre></aside>
      </section>
    </main>
  `,
})
class AppComponent implements OnDestroy {
  readonly example = selected;
  readonly form = createDynamicForm<Record<string, unknown>>({ schema: selected.schema, defaultValues: { ...selected.initialValues } });
  submitted?: Readonly<Record<string, unknown>>;
  json(value: unknown): string { return JSON.stringify(value, null, 2); }
  ngOnDestroy(): void { this.form.dispose(); }
}

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }).catch(console.error);
