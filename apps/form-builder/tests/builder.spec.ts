import { expect, test } from 'playwright/test';
test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });
test('edits fields, options, history, and restores the draft', async ({ page }) => {
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  await page.getByLabel('Label', { exact: true }).fill('Annual revenue');
  await expect(page.locator('.field-summary strong', { hasText: 'Annual revenue' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByLabel('Option 1 label').fill('Enterprise');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.waitForTimeout(450); await page.reload();
  await expect(page.locator('.field-summary strong', { hasText: 'Annual revenue' }).first()).toBeVisible();
});
test('creates nested fields with keyboard-accessible controls', async ({ page }) => {
  await page.getByRole('button', { name: 'Object', exact: true }).click();
  await expect(page.getByText('object / object')).toBeVisible();
  await page.getByRole('button', { name: /Add child to Object/ }).click();
  await expect(page.getByText('text / object.text')).toBeAttached();
  await expect(page.getByRole('button', { name: 'Select Text' })).toBeVisible();
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
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Redo', exact: true })).toBeDisabled();
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Number', exact: true }).focus();
  await expect(page.getByRole('button', { name: 'Number', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('number / number', { exact: true })).toBeVisible();
});

test('persists conditional logic and data-source configuration', async ({ page }) => {
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByRole('tab', { name: 'logic' }).click();
  const logic = page.locator('details').filter({ hasText: 'Conditions & dependencies' });
  await logic.getByText('Enabled', { exact: true }).first().click();
  await logic.getByLabel('Visible when field').selectOption('fullName');
  await logic.getByLabel('Visible when value').fill('Ada');
  await page.getByRole('tab', { name: 'properties' }).click();
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
    const canvas = workspace.querySelector('.builder-center')!.getBoundingClientRect();
    const inspector = workspace.querySelector('.inspector')!.getBoundingClientRect();
    return { canvasTop: canvas.top, inspectorTop: inspector.top, canvasLeft: canvas.left, inspectorLeft: inspector.left };
  });
  expect(Math.abs(medium.canvasTop - medium.inspectorTop)).toBeLessThan(2);
  expect(medium.inspectorLeft).toBeGreaterThan(medium.canvasLeft);

  await page.setViewportSize({ width: 800, height: 900 });
  const narrow = await page.locator('.workspace').evaluate((workspace) => {
    const canvas = workspace.querySelector('.builder-center')!.getBoundingClientRect();
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


test('persists section layout, field spans, cross-section placement, and layout history', async ({ page }) => {
  await expect(page.getByLabel('Personal Details columns')).toHaveValue('2');
  await page.getByLabel('Full name column span').selectOption('2');
  await expect(page.getByLabel('Full name column span')).toHaveValue('2');

  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Move Work email to section').selectOption('section-2');
  await expect(page.getByRole('region', { name: 'Section 2' }).locator('.field-summary strong')).toContainText('Work email');

  await page.getByRole('button', { name: 'Undo layout' }).click();
  await expect(page.getByLabel('Move Work email to section')).toHaveValue('personal-details');
  await page.getByRole('button', { name: 'Redo layout' }).click();
  await expect(page.getByLabel('Move Work email to section')).toHaveValue('section-2');

  await page.reload();
  await expect(page.getByLabel('Full name column span')).toHaveValue('2');
  await expect(page.getByLabel('Move Work email to section')).toHaveValue('section-2');
});

test('switches the design canvas viewport without changing the schema', async ({ page }) => {
  await page.getByRole('button', { name: 'mobile canvas' }).click();
  await expect(page.getByRole('button', { name: 'mobile canvas' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.visual-canvas')).toHaveClass(/visual-canvas--mobile/);
  await expect(page.getByRole('tree', { name: 'Form fields' })).toBeVisible();
});





test('edits validation, typed defaults, logic, and appearance through inspector tabs', async ({ page }) => {
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  const tabs = page.getByRole('tablist', { name: 'Field inspector' });
  await expect(tabs.getByRole('tab')).toHaveCount(4);

  await tabs.getByRole('tab', { name: 'properties' }).click();
  const defaultValue = page.getByLabel('Default value');
  await expect(defaultValue).toHaveAttribute('type', 'number');
  await defaultValue.fill('42');

  await tabs.getByRole('tab', { name: 'validation' }).click();
  await page.getByLabel('Minimum', { exact: true }).fill('1');
  await page.getByLabel('Maximum', { exact: true }).fill('100');
  await page.getByLabel('Multiple of').fill('1');

  await tabs.getByRole('tab', { name: 'logic' }).click();
  const readOnlyRule = page.locator('fieldset').filter({ hasText: 'Read only when' });
  await readOnlyRule.getByText('Enabled', { exact: true }).click();
  await readOnlyRule.getByLabel('Read only when field').selectOption('fullName');

  await tabs.getByRole('tab', { name: 'appearance' }).click();
  await page.getByLabel('Label position').selectOption('left');
  await page.getByLabel('Input density').selectOption('compact');

  await page.waitForTimeout(450);
  await page.reload();
  await page.getByRole('tab', { name: 'appearance' }).click();
  await expect(page.getByLabel('Label position')).toHaveValue('left');
  await expect(page.getByLabel('Input density')).toHaveValue('compact');
});

test('builds and previews a three-step wizard without JSON', async ({ page }) => {
  await page.getByLabel('Mode').selectOption('wizard');
  await page.getByRole('button', { name: '+ Step' }).click();
  await page.getByLabel('Step title').fill('Contact details');
  await page.getByRole('button', { name: '+ Step' }).click();
  await page.getByLabel('Step title').fill('Review');
  await page.getByText('Review step').click();
  await page.getByLabel('Move Work email to step').selectOption({ label: 'Contact details' });
  await expect(page.getByRole('tab', { name: /Review/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('navigation', { name: 'Builder view' }).getByRole('button', { name: 'preview' }).click();
  await expect(page.getByRole('list', { name: 'Form progress' }).getByRole('listitem')).toHaveCount(3);
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Work email').fill('ada@example.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await page.getByRole('button', { name: 'Previous' }).click();
  await expect(page.getByLabel('Work email')).toHaveValue('ada@example.com');
});
test('filters rules and jumps from an issue to its field', async ({ page }) => {
  await page.locator('.field-node').filter({ hasText: 'Full name' }).first().click();
  await page.getByRole('tab', { name: 'logic' }).click();
  await page.getByLabel('Dependencies (comma-separated)').fill('missingField');
  await page.getByRole('navigation', { name: 'Builder view' }).getByRole('button', { name: 'rules' }).click();
  await expect(page.getByRole('heading', { name: 'Rules & issues' })).toBeVisible();
  await expect(page.getByText('Unknown dependency field: missingField')).toBeVisible();
  await page.getByLabel('Filter').selectOption('dependency');
  await expect(page.getByText('Depends on missingField')).toBeVisible();
  await page.getByRole('button', { name: /fullName Unknown dependency/ }).click();
  await expect(page.getByRole('heading', { name: 'Full name' })).toBeVisible();
});
