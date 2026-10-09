import { expect, test, type Page } from 'playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });

const openGroup = (page: Page, group: string) => page.getByRole('button', { name: group, exact: true }).click();
const fieldCard = (page: Page, path: string) => page.locator(`[data-field-path="${path}"]`);
const builderView = (page: Page, view: string) => page.getByRole('navigation', { name: 'Builder view' }).getByRole('button', { name: view, exact: true }).click();
const openSection = async (page: Page, title: string) => { const section = page.locator('.property-list details').filter({ has: page.locator('summary', { hasText: title }) }); if (!(await section.evaluate((node) => (node as HTMLDetailsElement).open))) await section.locator('summary').click(); return section; };
const layoutMenu = async (page: Page, item: string) => { await page.getByRole('button', { name: 'Form layout options' }).click(); await page.getByRole('menuitem', { name: item }).click(); };

test('edits fields, options, history, and restores the draft', async ({ page }) => {
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  await page.getByLabel('Label', { exact: true }).fill('Annual revenue');
  await expect(page.locator('.field-summary strong', { hasText: 'Annual revenue' }).first()).toBeVisible();
  await openGroup(page, 'Selection');
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByLabel('Option 1 label').fill('Enterprise');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.waitForTimeout(450); await page.reload();
  await expect(page.locator('.field-summary strong', { hasText: 'Annual revenue' }).first()).toBeVisible();
});

test('creates nested fields with keyboard-accessible controls', async ({ page }) => {
  await openGroup(page, 'Structure');
  await page.getByRole('button', { name: 'Object', exact: true }).click();
  await expect(fieldCard(page, 'object')).toBeVisible();
  await page.getByRole('button', { name: /Add child to Object/ }).click();
  await expect(fieldCard(page, 'object.text')).toBeVisible();
  await fieldCard(page, 'object.text').focus();
  await page.keyboard.press('Enter');
  await expect(fieldCard(page, 'object.text')).toHaveClass(/selected/);
});

test('validates JSON before applying and previews the production form', async ({ page }) => {
  await builderView(page, 'JSON');
  const editor = page.getByLabel('Schema JSON'); const original = await editor.inputValue();
  await editor.fill('{bad'); await page.getByRole('button', { name: 'Apply JSON' }).click();
  await expect(page.getByRole('alert')).toContainText('json:');
  await editor.fill(original.replace('customer-intake', 'e2e-form')); await page.getByRole('button', { name: 'Apply JSON' }).click();
  await builderView(page, 'Preview');
  await expect(page.getByRole('heading', { name: 'E2e form' })).toBeVisible();
  await page.getByLabel('Full name').fill('Ada Lovelace'); await page.getByLabel('Work email').fill('ada@example.com'); await page.getByLabel('How can we help?').selectOption({ label: 'Product question' });
  await page.getByRole('button', { name: 'Submit form' }).click(); await expect(page.getByText('Submitted values')).toBeVisible();
});

for (const width of [320, 390, 768]) {
  test(`has no page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test('supports keyboard duplication and deletion with accessible status feedback', async ({ page }) => {
  await fieldCard(page, 'fullName').click();
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true, cancelable: true })));
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toBeVisible();
  await expect(page.locator('.live-region')).toHaveText('Field duplicated');
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })));
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toHaveCount(0);
  await expect(page.locator('.live-region')).toHaveText('Field deleted');
});

test('duplicates and deletes fields from card and inspector actions', async ({ page }) => {
  await page.getByRole('button', { name: 'Duplicate Full name' }).click();
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toBeVisible();
  await page.getByRole('complementary', { name: 'Field configuration' }).getByRole('button', { name: 'Delete Field' }).click();
  await expect(page.locator('.field-summary strong', { hasText: 'Full name copy' })).toHaveCount(0);
  await page.getByRole('button', { name: 'More actions for Work email' }).click();
  await page.getByRole('menuitem', { name: 'Move up' }).click();
  await expect(page.locator('.field-node').first()).toHaveAttribute('data-field-path', 'email');
});

test('exposes keyboard-operable builder landmarks and controls', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Builder view' })).toBeVisible();
  await expect(page.getByRole('tree', { name: 'Form fields' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Redo', exact: true })).toBeDisabled();
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Number', exact: true }).focus();
  await expect(page.getByRole('button', { name: 'Number', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(fieldCard(page, 'number')).toHaveClass(/selected/);
});

test('persists conditional logic and data-source configuration', async ({ page }) => {
  await openGroup(page, 'Selection');
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByRole('tab', { name: 'Advanced' }).click();
  const logic = await openSection(page, 'Conditions & dependencies');
  await logic.getByText('Enabled', { exact: true }).first().click();
  await logic.getByLabel('Visible when field').selectOption('fullName');
  await logic.getByLabel('Visible when value').fill('Ada');
  const dataSource = await openSection(page, 'Data source');
  await dataSource.getByText('Source type').locator('..').getByRole('combobox').selectOption('url');
  await dataSource.getByLabel('URL', { exact: true }).fill('https://example.test/options');
  await page.waitForTimeout(450);
  await page.reload();
  await expect(page.getByText('conditional', { exact: true })).toBeVisible();
  await expect(page.getByText('data', { exact: true })).toBeVisible();
});

test('exposes the application shell and routes rail destinations', async ({ page }) => {
  const primary = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(primary.getByRole('button', { name: 'Design' })).toHaveAttribute('aria-current', 'page');
  await primary.getByRole('button', { name: 'Themes' }).click();
  await expect(page.locator('.live-region')).toHaveText('Themes are coming soon');
  await primary.getByRole('button', { name: 'Logic' }).click();
  await expect(page.getByRole('heading', { name: 'Rules & issues' })).toBeVisible();
  await expect(primary.getByRole('button', { name: 'Logic' })).toHaveAttribute('aria-current', 'page');
  await primary.getByRole('button', { name: 'Design' }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Form ID')).toHaveValue('customer-intake');
  await page.getByRole('button', { name: 'Export options' }).click();
  await expect(page.getByRole('menuitem', { name: 'Import JSON' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Download JSON' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.locator('.preview-action')).toBeVisible();
});

test('keeps three workspace panels on desktop and stacks the inspector below 1080px', async ({ page }) => {
  const layout = () => page.locator('.workspace').evaluate((workspace) => {
    const canvas = workspace.querySelector('.builder-center')!.getBoundingClientRect();
    const inspector = workspace.querySelector('.inspector')!.getBoundingClientRect();
    return { canvasTop: canvas.top, canvasBottom: canvas.bottom, canvasLeft: canvas.left, inspectorTop: inspector.top, inspectorLeft: inspector.left };
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  const wide = await layout();
  expect(Math.abs(wide.canvasTop - wide.inspectorTop)).toBeLessThan(2);
  expect(wide.inspectorLeft).toBeGreaterThan(wide.canvasLeft);

  await page.setViewportSize({ width: 1024, height: 900 });
  const narrow = await layout();
  expect(narrow.inspectorTop).toBeGreaterThanOrEqual(narrow.canvasBottom - 2);
});

test('searches fields and persists palette view and category preferences', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search fields' });
  await search.fill('currency');
  await expect(page.getByRole('button', { name: 'Currency', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Text', exact: true })).toHaveCount(0);

  await search.fill('not-a-real-field');
  await expect(page.getByRole('status').filter({ hasText: 'No fields found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();

  await page.getByRole('button', { name: 'List view' }).click();
  await expect(page.getByRole('button', { name: 'Grid view' })).toBeVisible();

  const basicInputs = page.getByRole('button', { name: 'Basic Inputs', exact: true });
  await expect(basicInputs).toHaveAttribute('aria-expanded', 'true');
  await basicInputs.click();
  await expect(basicInputs).toHaveAttribute('aria-expanded', 'false');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Grid view' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Basic Inputs', exact: true })).toHaveAttribute('aria-expanded', 'false');
});

test('navigates sections and persists spans, cross-section placement, and layout history', async ({ page }) => {
  await expect(page.getByLabel('Personal Details columns')).toHaveValue('2');
  await fieldCard(page, 'fullName').click();
  await page.getByLabel('Full name column span').selectOption('2');
  await expect(page.getByLabel('Full name column span')).toHaveValue('2');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('tab', { name: /Contact & Preferences/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Previous' }).click();

  await page.getByRole('button', { name: 'Add section' }).click();
  await expect(page.getByRole('tab', { name: /Section 4/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: /Personal Details/ }).click();
  await fieldCard(page, 'email').click();
  await page.getByLabel('Move Work email to section').selectOption('section-4');
  await page.getByRole('tab', { name: /Section 4/ }).click();
  await expect(page.getByRole('region', { name: 'Section 4' }).locator('.field-summary strong')).toContainText('Work email');

  await layoutMenu(page, 'Undo layout');
  await expect(fieldCard(page, 'email')).toHaveCount(0);
  await layoutMenu(page, 'Redo layout');
  await expect(fieldCard(page, 'email')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('tab', { name: /Section 4/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: /Personal Details/ }).click();
  await fieldCard(page, 'fullName').click();
  await expect(page.getByLabel('Full name column span')).toHaveValue('2');
  await page.getByRole('tab', { name: /Section 4/ }).click();
  await expect(fieldCard(page, 'email')).toBeVisible();
});

test('adds palette fields to the active section', async ({ page }) => {
  await page.getByRole('tab', { name: /Additional Info/ }).click();
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  await expect(page.getByRole('region', { name: /Additional Info/ }).locator('[data-field-path="number"]')).toBeVisible();
});

test('switches the design canvas viewport without changing the schema', async ({ page }) => {
  await page.getByRole('button', { name: 'mobile canvas' }).click();
  await expect(page.getByRole('button', { name: 'mobile canvas' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.visual-canvas')).toHaveClass(/visual-canvas--mobile/);
  await expect(page.getByRole('tree', { name: 'Form fields' })).toHaveCount(1);
});

test('edits validation, typed defaults, logic, and appearance through inspector tabs', async ({ page }) => {
  await page.getByRole('button', { name: 'Number', exact: true }).click();
  const tabs = page.getByRole('tablist', { name: 'Field inspector' });
  await expect(tabs.getByRole('tab')).toHaveCount(2);

  const defaultValue = page.getByLabel('Default value');
  await expect(defaultValue).toHaveAttribute('type', 'number');
  await defaultValue.fill('42');

  await tabs.getByRole('tab', { name: 'Advanced' }).click();
  await page.getByLabel('Minimum', { exact: true }).fill('1');
  await page.getByLabel('Maximum', { exact: true }).fill('100');
  await page.getByLabel('Multiple of').fill('1');

  await openSection(page, 'Conditions & dependencies');
  const readOnlyRule = page.locator('fieldset').filter({ hasText: 'Read only when' });
  await readOnlyRule.getByText('Enabled', { exact: true }).click();
  await readOnlyRule.getByLabel('Read only when field').selectOption('fullName');

  await openSection(page, 'Appearance');
  await page.getByLabel('Label position').selectOption('left');
  await page.getByLabel('Input density').selectOption('compact');

  await page.waitForTimeout(450);
  await page.reload();
  await page.getByRole('tab', { name: 'Advanced' }).click();
  await openSection(page, 'Appearance');
  await expect(page.getByLabel('Label position')).toHaveValue('left');
  await expect(page.getByLabel('Input density')).toHaveValue('compact');
});

test('builds and previews a three-step wizard without JSON', async ({ page }) => {
  await layoutMenu(page, 'Form flow & wizard');
  await page.getByLabel('Mode').selectOption('wizard');
  await page.getByRole('button', { name: '+ Step' }).click();
  await page.getByLabel('Step title').fill('Contact details');
  await page.getByRole('button', { name: '+ Step' }).click();
  await page.getByLabel('Step title').fill('Review');
  await page.getByText('Review step').click();
  await page.getByLabel('Move Work email to step').selectOption({ label: 'Contact details' });
  await expect(page.getByRole('tablist', { name: 'Wizard steps' }).getByRole('tab', { name: /Review/ })).toHaveAttribute('aria-selected', 'true');
  await builderView(page, 'Preview');
  await expect(page.getByRole('list', { name: 'Form progress' }).getByRole('listitem')).toHaveCount(3);
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('How can we help?').selectOption({ label: 'Product question' });
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Work email').fill('ada@example.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await page.getByRole('button', { name: 'Previous' }).click();
  await expect(page.getByLabel('Work email')).toHaveValue('ada@example.com');
});

test('filters rules and jumps from an issue to its field', async ({ page }) => {
  await fieldCard(page, 'fullName').click();
  await page.getByRole('tab', { name: 'Advanced' }).click();
  await openSection(page, 'Conditions & dependencies');
  await page.getByLabel('Dependencies (comma-separated)').fill('missingField');
  await builderView(page, 'Rules');
  await expect(page.getByRole('heading', { name: 'Rules & issues' })).toBeVisible();
  await expect(page.getByText('Unknown dependency field: missingField')).toBeVisible();
  await page.getByLabel('Filter').selectOption('dependency');
  await expect(page.getByText('Depends on missingField')).toBeVisible();
  await page.getByRole('button', { name: /fullName Unknown dependency/ }).click();
  await expect(fieldCard(page, 'fullName')).toHaveClass(/selected/);
  await expect(page.getByRole('tab', { name: 'Basic' })).toHaveAttribute('aria-selected', 'true');
});

test('saves, publishes immutable releases, and exposes version management', async ({ page }) => {
  await page.getByRole('button', { name: 'Saved', exact: true }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText(/Published customer-intake-v1/)).toBeVisible();
  await page.getByRole('button', { name: 'More publish options' }).click();
  await page.getByRole('menuitem', { name: 'Versions & releases' }).click();
  const dialog = page.getByRole('dialog', { name: 'Forms and versions' });
  await expect(dialog.getByText('Immutable releases')).toBeVisible();
  await expect(dialog.getByText('v1', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Create snapshot' }).click();
  await expect(dialog.getByText('Restore snapshot')).toBeVisible();
});

test('supports skip navigation, keyboard field selection, focus routing, and reduced motion', async ({ page }) => {
  await page.getByRole('link', { name: 'Skip to builder content' }).focus();
  await expect(page.getByRole('link', { name: 'Skip to builder content' })).toBeFocused();
  await page.getByRole('link', { name: 'Skip to builder content' }).press('Enter');
  await expect(page.locator('#builder-content')).toBeFocused();
  const field = fieldCard(page, 'fullName');
  await field.focus();
  await field.press('Enter');
  await expect(field).toHaveClass(/selected/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(field).toBeVisible();
});

test('recovers from a corrupt saved workspace', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('dynamic-forms:builder:workspace-v2', '{bad'));
  await page.reload();
  await expect(page.locator('.live-region')).toContainText('recovered safely');
  await expect(page.getByLabel('Form ID')).toHaveValue('customer-intake');
});

test('does not report corruption for a first-time visitor', async ({ page }) => {
  await expect(page.locator('.live-region')).not.toContainText('recovered safely');
});
