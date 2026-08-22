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
test('conditions workbench explains compound, nested, role, and calculated rules', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/conditions');
  await expect(page.getByRole('heading', { level: 1, name: 'Conditions and business rules' })).toBeVisible();
  await expect(page.getByText('Declarative operators only', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Visual rule graph')).toContainText('FAIL');
  await page.getByLabel('Profile region').click();
  await page.getByRole('option', { name: 'European Union' }).click();
  await expect(page.getByLabel('Visual rule graph')).toContainText('PASS');
  await expect(page.getByLabel('Manager notes')).toBeVisible();
  await page.getByRole('combobox').filter({ hasText: 'Editor' }).click();
  await page.getByRole('option', { name: 'Admin' }).click();
  await expect(page.getByText('Admin approval code is REQUIRED', { exact: false })).toBeVisible();
  await page.getByLabel('Base salary').fill('200000');
  await page.getByLabel('Bonus rate').fill('20');
  await expect(page.getByLabel('State inspector')).toContainText('240000');
  await expect(page.getByText('Unknown condition field: missingField')).toBeVisible();
  await expect(page.getByLabel('Rule unit-test examples')).toContainText("describe('approvalCondition'");
});

test('dependency workbench cascades values, visualizes impact, preserves values, and rejects cycles', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/dependencies');
  await expect(page.getByRole('heading', { level: 1, name: 'Dependency workbench' })).toBeVisible();
  await expect(page.getByLabel('Dependency graph')).toContainText('country');
  await expect(page.getByText('Recalculation order: country -> state -> city')).toBeVisible();
  await page.getByLabel('Country').click();
  await page.getByRole('option', { name: 'United States' }).click();
  await expect(page.getByLabel('State')).toHaveText('');
  await expect(page.getByLabel('Dependency graph')).toContainText('affected');
  await expect(page.getByText('country changed; state -> city recalculated', { exact: false })).toBeVisible();
  await page.getByLabel('State').click();
  await page.getByRole('option', { name: 'California' }).click();
  await page.getByLabel('City').click();
  await page.getByRole('option', { name: 'San Francisco' }).click();
  await page.getByLabel('Value policy').click();
  await page.getByRole('option', { name: 'Preserve dependents' }).click();
  await page.getByLabel('Country').click();
  await page.getByRole('option', { name: 'India' }).click();
  await expect(page.getByLabel('State')).toContainText('CA');
  await page.getByRole('button', { name: 'Demonstrate cycle' }).click();
  await expect(page.getByText('Dependency cycle detected', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Only affected controls rerender' })).toBeVisible();
});

test('data source studio configures, normalizes, caches, simulates, redacts, and cancels requests', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/data-sources');
  await expect(page.getByRole('heading', { level: 1, name: 'Data Source Studio' })).toBeVisible();
  await expect(page.getByLabel('Normalization preview')).toContainText('Chennai');
  await expect(page.getByLabel('Request inspector')).toContainText('[REDACTED]');
  await page.getByRole('button', { name: 'Load / retry' }).click();
  await expect(page.getByText('status: cached', { exact: false })).toBeVisible();
  await expect(page.getByText('hits: 1', { exact: false })).toBeVisible();
  await page.getByLabel('Pagination').click();
  await page.getByRole('option', { name: 'Cursor' }).click();
  await expect(page.getByLabel('Cursor')).toBeVisible();
  await page.getByLabel('Response simulation').click();
  await page.getByRole('option', { name: 'Empty' }).click();
  await page.getByRole('button', { name: 'Invalidate cache' }).click();
  await page.getByRole('button', { name: 'Load / retry' }).click();
  await expect(page.getByText('No options available.')).toBeVisible();
  await page.getByLabel('Response simulation').click();
  await page.getByRole('option', { name: 'Failure' }).click();
  await page.getByRole('button', { name: 'Load / retry' }).click();
  await expect(page.getByText('503 Service Unavailable', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Slow network: off' }).click();
  await page.getByLabel('Response simulation').click();
  await page.getByRole('option', { name: 'Normal' }).click();
  await page.getByRole('button', { name: 'Invalidate cache' }).click();
  await page.getByRole('button', { name: 'Load / retry' }).click();
  await expect(page.getByRole('button', { name: 'Cancel request' })).toBeEnabled();
  await page.getByRole('button', { name: 'Cancel request' }).click();
  await expect(page.getByText('Request cancelled manually')).toBeVisible();
  await page.getByRole('button', { name: 'Offline: off' }).click();
  await expect(page.getByRole('button', { name: 'Offline: on' })).toBeVisible();
});

test('nested arrays preserve identity across mutations, validate constraints, and switch renderers', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/nested-fields');
  await expect(page.getByRole('heading', { level: 1, name: 'Nested fields and arrays' })).toBeVisible();
  await expect(page.getByLabel('Nested value preview')).toContainText('Analytical Engines');
  const firstId = await page.getByText(/Stable ID: worker-/).first().textContent();
  await page.getByRole('button', { name: 'Move down' }).first().click();
  await expect(page.getByText(firstId ?? '')).toBeVisible();
  await page.getByRole('button', { name: 'Duplicate' }).first().click();
  await expect(page.getByText('3 item(s); allowed range 1-5', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Add worker' }).click();
  await expect(page.getByText('requires a name.', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Show table' }).click();
  await expect(page.getByRole('table', { name: 'Worker array table' })).toBeVisible();
  await page.getByLabel('Worker type 1').click();
  await page.getByRole('option', { name: 'Contractor' }).click();
  await expect(page.getByLabel('Contract end date 1')).toBeVisible();
  await page.getByRole('button', { name: 'Add skill' }).first().click();
  await expect(page.getByLabel('Skill 1.2')).toBeVisible();
  await page.goto('http://127.0.0.1:4175/arrays');
  await expect(page.getByRole('heading', { level: 1, name: 'Array operations workbench' })).toBeVisible();
  await page.getByRole('button', { name: 'Run 250-row benchmark' }).click();
  await expect(page.getByText('Generated 250 stable rows in', { exact: false })).toBeVisible();
  await expect(page.getByText('A maximum of five workers is allowed.')).toBeVisible();
});

test('enterprise wizard validates, skips steps, restores drafts, reviews, and routes server errors', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/wizard');
  await expect(page.getByRole('heading', { level: 1, name: 'Enterprise wizard' })).toBeVisible();
  await expect(page.getByText('Step 1 of 3: Personal details')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Full name is required')).toBeVisible();
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Email address').fill('blocked@example.com');
  await page.getByLabel('Account type').click();
  await page.getByRole('option', { name: 'Business' }).click();
  await expect(page.getByText('Step 1 of 4: Personal details')).toBeVisible();
  await page.getByRole('button', { name: 'Save draft' }).click();
  await page.getByLabel('Full name').fill('Changed Name');
  await page.getByRole('button', { name: 'Restore draft' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Ada Lovelace');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Company' })).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Company name is required')).toBeVisible();
  await page.getByLabel('Company name').fill('Analytical Engines');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Review' })).toBeVisible();
  await expect(page.getByText('Company: Analytical Engines')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm and submit' }).click();
  await expect(page.getByText('Server error returned to Personal details.')).toBeVisible();
  await expect(page.getByText('Server rejected this email address')).toBeVisible();
  await page.getByLabel('Non-linear navigation').check();
  await expect(page.getByText('Keyboard: Tab reaches every action', { exact: false })).toBeVisible();
  await expect(page.getByText('Navigation protection: active', { exact: false })).toBeVisible();
});

test('permissions workbench explains role policies and redacts sensitive diagnostics', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/permissions');
  await expect(page.getByRole('heading', { level: 1, name: 'Permissions workbench' })).toBeVisible();
  await expect(page.getByText('UI permissions are not server authorization.', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Salary')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('Department')).toBeDisabled();
  await expect(page.getByRole('cell', { name: 'Tenant policy: department managed by HRIS' })).toBeVisible();
  await expect(page.getByLabel('Administrator notes')).toHaveCount(0);
  await expect(page.getByLabel('Redacted permission state')).toContainText('[REDACTED]');
  await expect(page.getByLabel('Redacted permission state')).not.toContainText('secret-production-token');
  await page.getByLabel('Active role').click();
  await page.getByRole('option', { name: 'Admin' }).click();
  await expect(page.getByLabel('Administrator notes')).toBeVisible();
  await page.getByLabel('API token').fill('rotated-secret-token');
  await expect(page.getByLabel('Redacted permission events')).toContainText('[REDACTED]');
  await expect(page.getByLabel('Redacted permission events')).not.toContainText('rotated-secret-token');
  await page.getByLabel('Active role').click();
  await page.getByRole('option', { name: 'Viewer' }).click();
  await expect(page.getByText('Section compensation: hidden', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Display name')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('table', { name: 'Effective permission policies' })).toContainText('RBAC role: viewer');
});
