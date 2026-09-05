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


test('supports keyboard duplication and deletion with accessible status feedback', async ({ page }) => {
  await page.getByRole('button', { name: 'Select Full name' }).click();
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true, cancelable: true })));
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toBeVisible();
  await expect(page.locator('.live-region')).toHaveText('Field duplicated');
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })));
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toHaveCount(0);
  await expect(page.locator('.live-region')).toHaveText('Field deleted');
});

test('exposes keyboard-operable builder landmarks and controls', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Builder view' })).toBeVisible();
  await expect(page.getByRole('tree', { name: 'Form fields' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Redo' })).toBeDisabled();
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Number', exact: true }).focus();
  await expect(page.getByRole('button', { name: 'Number', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('number / number', { exact: true })).toBeVisible();
});

test('persists conditional logic and data-source configuration', async ({ page }) => {
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  const logic = page.locator('details').filter({ hasText: 'Conditions & dependencies' });
  await logic.locator('summary').click();
  await logic.getByText('Enabled', { exact: true }).first().click();
  await logic.getByLabel('Visible when field').selectOption('fullName');
  await logic.getByLabel('Visible when value').fill('Ada');
  const dataSource = page.locator('details').filter({ hasText: 'Data source' });
  await dataSource.locator('summary').click();
  await dataSource.getByText('Source type').locator('..').getByRole('combobox').selectOption('url');
  await dataSource.getByLabel('URL', { exact: true }).fill('https://example.test/options');
  await page.waitForTimeout(450);
  await page.reload();
  await expect(page.getByText('conditional', { exact: true })).toBeVisible();
  await expect(page.getByText('data', { exact: true })).toBeVisible();
});






test('exposes the Phase 1 application shell without activating future destinations', async ({ page }) => {
  const primary = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primary.getByRole('button', { name: 'Builder' })).toHaveAttribute('aria-current', 'page');
  await primary.getByRole('button', { name: 'Playground' }).click();
  await expect(page.locator('.live-region')).toHaveText('Playground is planned for a later phase');
  await expect(page.getByRole('button', { name: 'Save & Publish' })).toBeDisabled();
  await expect(page.getByLabel('Form ID')).toHaveValue('customer-intake');
  await expect(page.getByLabel('Version')).toHaveValue('1.0.0');
  await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy JSON' })).toBeVisible();
});



test('keeps three workspace panels at medium desktop and stacks the inspector below 900px', async ({ page }) => {
  await page.setViewportSize({ width: 1050, height: 900 });
  const medium = await page.locator('.workspace').evaluate((workspace) => {
    const canvas = workspace.querySelector('.canvas')!.getBoundingClientRect();
    const inspector = workspace.querySelector('.inspector')!.getBoundingClientRect();
    return { canvasTop: canvas.top, inspectorTop: inspector.top, canvasLeft: canvas.left, inspectorLeft: inspector.left };
  });
  expect(Math.abs(medium.canvasTop - medium.inspectorTop)).toBeLessThan(2);
  expect(medium.inspectorLeft).toBeGreaterThan(medium.canvasLeft);

  await page.setViewportSize({ width: 800, height: 900 });
  const narrow = await page.locator('.workspace').evaluate((workspace) => {
    const canvas = workspace.querySelector('.canvas')!.getBoundingClientRect();
    const inspector = workspace.querySelector('.inspector')!.getBoundingClientRect();
    return { canvasBottom: canvas.bottom, inspectorTop: inspector.top };
  });
  expect(narrow.inspectorTop).toBeGreaterThanOrEqual(narrow.canvasBottom - 2);
});



test('searches fields and persists palette view and category preferences', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search fields' });
  await search.fill('currency');
  await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Text', exact: true })).toHaveCount(0);

  await search.fill('not-a-real-field');
  await expect(page.getByRole('status')).toContainText('No fields found');
  await page.getByRole('button', { name: 'Clear search' }).click();

  await page.getByRole('button', { name: 'List view' }).click();
  await expect(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');

  const basicInputs = page.locator('details.palette-group').filter({ hasText: 'Basic Inputs' });
  await basicInputs.locator('summary').click();
  await expect(basicInputs).not.toHaveAttribute('open', '');

  await page.reload();
  await expect(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('details.palette-group').filter({ hasText: 'Basic Inputs' })).not.toHaveAttribute('open', '');
});

