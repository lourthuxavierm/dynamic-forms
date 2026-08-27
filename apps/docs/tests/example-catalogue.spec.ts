import { expect, test } from 'playwright/test';

const examples = [
  ['basic-form', 'Basic form'], ['core-controls', 'Core controls'], ['text-numeric', 'Text and numeric controls'],
  ['selection-controls', 'Selection controls'], ['date-time', 'Date and time controls'], ['validation-errors', 'Validation and error states'],
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
