import { expect, test } from 'playwright/test';

test('Angular architecture landing page links design to the implementation', async ({ page }) => {
  await page.goto('/architecture/angular/');
  await expect(page.getByRole('heading', { level: 1, name: 'Angular architecture' })).toBeVisible();
  await expect(page.getByText('Phase 10 implements the first slice')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Angular guide' })).toBeVisible();
});

test('Angular architecture separates signals and RxJS ownership', async ({ page }) => {
  await page.goto('/architecture/angular/signals-and-rxjs');
  await expect(page.getByText('Signals are the primary synchronous template and component state surface.')).toBeVisible();
  await expect(page.getByText('never competing stores')).toBeVisible();
});

test('Reactive Forms page states the CVA and FormGroup boundary', async ({ page }) => {
  await page.goto('/architecture/angular/reactive-forms');
  await expect(page.getByText('whole-form ControlValueAccessor bridge')).toBeVisible();
  await expect(page.getByText('does not create an Angular FormControl for every Core field')).toBeVisible();
});

test('Angular compatibility page exposes the exact tested baseline', async ({ page }) => {
  await page.goto('/project/angular-compatibility');
  await expect(page.getByRole('heading', { level: 1, name: 'Angular compatibility policy' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '22.1.3' })).toBeVisible();
  await expect(page.getByText('Only this exact combination has repository evidence.')).toBeVisible();
});

test('Angular release gates retain incomplete implementation requirements', async ({ page }) => {
  await page.goto('/architecture/angular/testing-and-release');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(12);
  await expect(table.getByRole('cell', { name: 'Core has no Angular imports; headless adapter has no HTML renderer dependency' })).toBeVisible();
});
