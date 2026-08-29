import { expect, test } from 'playwright/test';

const examples = [
  ['basic-form', 'Basic form'], ['core-controls', 'Core controls'], ['text-numeric', 'Text and numeric controls'],
  ['selection-controls', 'Selection controls'], ['date-time', 'Date and time controls'], ['validation-errors', 'Validation and error states'],
  ['zod-validation', 'Zod validation'],
  ['conditional-dependencies', 'Conditional fields and dependencies'], ['async-data', 'Async data sources'],
  ['nested-objects-arrays', 'Nested objects and arrays'], ['file-media', 'File and media fields'], ['schema-loading', 'Schema loading'],
  ['multi-step-workflow', 'Multi-step workflow'], ['draft-autosave', 'Draft and autosave'], ['enterprise-profile', 'Enterprise profile form'],
] as const;

for (const [id, title] of examples) {
  test(`${id} is a runnable documented React HTML example`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:4175/?example=${id}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Executable example catalogue' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
    await expect(page.getByTestId('example-picker')).toHaveValue(id);
    await expect(page.getByRole('complementary', { name: 'Playground debug panel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset example' })).toBeVisible();
  });
}

test('Zod example blocks invalid React HTML submission with mapped errors', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/?example=zod-validation');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByRole('link', { name: 'Enter a valid work email' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Use at least eight characters' })).toBeVisible();
  await expect(page.getByTestId('submitted-values')).toContainText('Submit a valid form.');
  await page.getByLabel('Work email').fill('engineer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secure-pass');
  await page.getByLabel('Confirm password').fill('secure-pass');
  await page.getByRole('button', { name: 'Submit Zod validation' }).click();
  await expect(page.getByTestId('submitted-values')).toContainText('engineer@example.com');
  await expect(page.getByTestId('event-log')).toContainText('submit');
});

test('debug panel records state, validation, events, submission, and reset', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/?example=basic-form');
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await expect(page.getByTestId('form-state')).toContainText('Ada Lovelace');
  await expect(page.getByTestId('event-log')).toContainText('valueChange');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByTestId('event-log')).toContainText('validate');
  await page.getByRole('button', { name: 'Reset example' }).click();
  await expect(page.getByTestId('form-state')).not.toContainText('Ada Lovelace');
  await expect(page.getByTestId('event-log')).toContainText('No events yet.');
});
