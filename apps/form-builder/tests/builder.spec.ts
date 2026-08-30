import { expect, test } from 'playwright/test';
test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
test('edits fields, options, history, and restores the draft', async ({ page }) => {
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  await page.getByLabel('Label', { exact: true }).fill('Annual revenue');
  await expect(page.getByText('Annual revenue', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByLabel('Option 1 label').fill('Enterprise');
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('button', { name: 'Redo' }).click();
  await page.waitForTimeout(450); await page.reload();
  await expect(page.getByText('Annual revenue', { exact: true })).toBeVisible();
});
test('creates nested fields with keyboard-accessible controls', async ({ page }) => {
  await page.getByRole('button', { name: 'Object', exact: true }).click();
  await expect(page.getByText('object / object')).toBeVisible();
  await page.getByRole('button', { name: /Add child to Object/ }).click();
  await expect(page.getByText('text / object.text')).toBeVisible();
});
test('validates JSON before applying and previews the production form', async ({ page }) => {
  await page.getByRole('button', { name: 'json', exact: true }).click();
  const editor = page.getByLabel('Schema JSON'); const original = await editor.inputValue();
  await editor.fill('{bad'); await page.getByRole('button', { name: 'Apply JSON' }).click();
  await expect(page.getByRole('alert')).toContainText('json:');
  await editor.fill(original.replace('customer-intake', 'e2e-form')); await page.getByRole('button', { name: 'Apply JSON' }).click();
  await page.getByRole('button', { name: 'preview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'E2e form' })).toBeVisible();
  await page.getByLabel('Full name').fill('Ada Lovelace'); await page.getByLabel('Work email').fill('ada@example.com');
  await page.getByRole('button', { name: 'Submit form' }).click(); await expect(page.getByText('Submitted values')).toBeVisible();
});
test('has no page overflow at mobile width', async ({ page }) => { await page.setViewportSize({ width: 320, height: 900 }); const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth })); expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1); });
