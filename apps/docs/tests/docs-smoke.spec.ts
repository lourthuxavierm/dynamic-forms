import { expect, test } from 'playwright/test';

test('loads the documentation home and navigates to the control inventory', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Dynamic Forms documentation' })).toBeVisible();

  await page.getByRole('link', { name: 'MUI control inventory' }).first().click();
  await expect(page).toHaveURL(/\/CONTROL$/);
  await expect(page.getByRole('heading', { level: 1, name: 'MUI control inventory' })).toBeVisible();
  await expect(page.getByText('Total: 42 registered field types.')).toBeVisible();
});

test('local search discovers source-verified documentation', async ({ page }) => {
  await page.goto('/');
  await page.locator('.VPNavBarSearch button').click();
  const search = page.locator('.VPLocalSearchBox input[type="search"]');
  await search.fill('documentation standards');
  await expect(page.locator('.VPLocalSearchBox')).toContainText('Documentation standards');
});

test('quickstart validates, reports errors, and submits values', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/?example=quickstart');
  await expect(page.getByRole('heading', { level: 1, name: 'Create your profile' })).toBeVisible();

  await page.getByRole('button', { name: 'Create profile' }).click();
  await expect(page.getByText('Full name is required')).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeFocused();

  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Work email').fill('ada@example.com');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Developer' }).click();
  await page.getByRole('button', { name: 'Create profile' }).click();

  await expect(page.getByTestId('submission-result')).toContainText(
    'Profile created for Ada Lovelace (ada@example.com).',
  );
});
test('playground shell supports navigation, search, and theme controls', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/');
  await expect(page.getByRole('heading', { level: 1, name: 'Enterprise playground' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Package and build status' })).toBeVisible();
  await expect(page.getByText('Stable registered').locator('../..')).toContainText('42');
  await expect(page.getByRole('heading', { level: 2, name: 'Core capability matrix' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Architecture overview' })).toBeVisible();
  await page.getByRole('button', { name: 'Basic form' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4175/basic-form');
  await expect(page.getByRole('heading', { level: 1, name: 'Basic form' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit demo' }).click();
  await expect(page.getByText('Full name is required', { exact: true })).toBeVisible();
  await expect(page.getByText('Work email is required', { exact: true })).toBeVisible();
  await expect(page.getByText('Age is required', { exact: true })).toBeVisible();
  await expect(page.getByText('Department is required', { exact: true })).toBeVisible();
  await expect(page.getByText('I accept the workplace policy is required', { exact: true })).toBeVisible();
  await expect(page.getByText('Start date is required', { exact: true })).toBeVisible();
  await page.getByLabel('Work email').fill('invalid-email');
  await page.getByLabel('Age').fill('17');
  await page.getByRole('button', { name: 'Submit demo' }).click();
  await expect(page.getByText('Work email has an invalid format', { exact: true })).toBeVisible();
  await expect(page.getByText('Age must be at least 18', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Schema editor' }).click();
  await page.getByLabel('Schema JSON').fill('{ invalid json');
  await page.getByRole('button', { name: 'Apply schema' }).click();
  await expect(page.getByRole('alert')).toContainText('JSON');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await page.getByLabel('Search demos').fill('validation');
  await expect(page.getByRole('button', { name: 'Validation' })).toBeVisible();
});
test('basic form loads values, submits serialized data, and resets', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/basic-form');
  await page.getByRole('button', { name: 'Load example values' }).click();
  await expect(page.getByLabel('State inspector')).toContainText('Ada Lovelace');
  await expect(page.getByLabel('State inspector')).toContainText('2026-09-01');
  await page.getByRole('button', { name: 'Submit demo' }).click();
  await expect(page.getByTestId('demo-submission')).toContainText('engineering');
  await expect(page.getByTestId('demo-submission')).toContainText('acceptTerms');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('State inspector')).toContainText('"fullName": ""');
});
test('fields catalogue filters controls and exposes enterprise reference states', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/fields');
  await expect(page.getByRole('heading', { level: 1, name: 'All Fields catalogue' })).toBeVisible();
  await expect(page.getByText('42 registered controls and 4 schema-only capabilities.')).toBeVisible();
  await page.getByLabel('Search controls').fill('async-autocomplete');
  await page.getByRole('button', { name: 'async-autocomplete' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'async-autocomplete' })).toBeVisible();
  await expect(page.getByText('Keyboard: use Tab', { exact: false })).toBeVisible();
  await expect(page.getByText('Async coverage for controls', { exact: false })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading catalogue data' })).toBeVisible();
  await expect(page.getByText('Empty: no options available.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(page.getByText('Normal', { exact: true })).toBeVisible();
  await expect(page.getByText('Disabled', { exact: true })).toBeVisible();
  await expect(page.getByText('Read-only', { exact: true })).toBeVisible();
  await expect(page.getByText('Required', { exact: true })).toBeVisible();
  await expect(page.getByText('Error', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Schema snippet')).toContainText('async-autocomplete');
  await expect(page.getByRole('link', { name: 'Open control documentation' })).toHaveAttribute('href', '/docs/CONTROL#registered-controls');
});
test('validation laboratory covers schema, custom, async, server, warning, focus, and timing flows', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/validation');
  await expect(page.getByRole('heading', { level: 1, name: 'Validation laboratory' })).toBeVisible();
  await page.getByRole('combobox').filter({ hasText: 'Blur' }).click();
  await page.getByRole('option', { name: 'Change' }).click();
  await page.getByRole('button', { name: 'Submit demo' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Please correct the following errors' })).toBeVisible();
  await expect(page.getByLabel('Username')).toBeFocused();
  await page.getByLabel('Username').fill('root');
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm password').fill('different');
  await page.getByRole('button', { name: 'Run custom validation' }).click();
  await expect(page.getByRole('link', { name: 'Username root is reserved' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Passwords must match' })).toBeVisible();
  await page.getByLabel('Username').fill('admin');
  await expect(page.getByText('Async username: Unavailable', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Simulate server error' }).click();
  await expect(page.getByRole('link', { name: 'Server rejected this email address' })).toBeVisible();
  await page.getByLabel('Age').fill('19');
  await expect(page.getByText('Applicants under 21', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Measure validation' }).click();
  await expect(page.getByText('Validation completed in', { exact: false })).toBeVisible();
});