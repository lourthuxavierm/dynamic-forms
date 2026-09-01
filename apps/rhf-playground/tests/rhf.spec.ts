import { expect, test, type Page } from 'playwright/test';
import axe from 'axe-core';

async function open(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'React Hook Form E2E Playground' })).toBeVisible();
}

async function values(page: Page, label = 'Watched values') {
  return JSON.parse(await page.getByLabel(label).textContent() ?? '{}') as Record<string, unknown>;
}

test('submits typed basic values', async ({ page }) => {
  await open(page);
  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('Age').fill('36');
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByLabel('Submitted JSON')).toContainText('"firstName":"Ada"');
  await expect(page.getByLabel('Submitted JSON')).toContainText('"age":36');
});

test('shows required errors, focuses correction, and resubmits', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByRole('alert', { name: 'Error summary' })).toContainText('First name is required');
  await expect(page.getByLabel('First name')).toBeFocused();
  await page.getByLabel('First name').fill('Grace');
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByLabel('Submit count')).toHaveText('1');
});

test('updates conditional visibility and required validation', async ({ page }) => {
  await open(page);
  await expect(page.getByLabel('Company')).toHaveCount(0);
  await page.getByLabel('Account type').selectOption('business');
  await expect(page.getByLabel('Company')).toBeVisible();
  await page.getByLabel('First name').fill('Ada');
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByRole('alert', { name: 'Error summary' })).toContainText('Company is required');
  await page.getByLabel('Company').fill('Analytical Engines');
  await expect(page.getByLabel('Errors')).toHaveText('{}');
});

test('edits nested objects and appends, reorders, removes, and submits arrays', async ({ page }) => {
  await open(page);
  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('City').fill('Pune');
  await page.getByRole('button', { name: 'Add contact' }).click();
  await expect(page.getByLabel('Contact email')).toHaveCount(2);
  await page.getByLabel('Contact email').nth(1).fill('grace@example.com');
  await page.getByRole('button', { name: 'Move first contact', exact: true }).click();
  await expect(page.getByLabel('Contact email').first()).toHaveValue('grace@example.com');
  await page.getByRole('button', { name: 'Remove first contact' }).click();
  await expect(page.getByLabel('Contact email')).toHaveCount(1);
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByLabel('Submitted JSON')).toContainText('"city":"Pune"');
  await expect(page.getByLabel('Submitted JSON')).toContainText('"contacts":[{"email":"ada@example.com"}]');
});

test('resets individual fields and the whole form state', async ({ page }) => {
  await open(page);
  await page.getByLabel('City').fill('Delhi');
  await page.getByRole('button', { name: 'Reset city' }).click();
  await expect(page.getByLabel('City')).toHaveValue('Mumbai');
  await page.getByLabel('First name').fill('Changed');
  await page.getByLabel('City').fill('Changed');
  await page.getByRole('button', { name: 'Reset form' }).click();
  await expect(page.getByLabel('First name')).toHaveValue('');
  await expect(page.getByLabel('City')).toHaveValue('Mumbai');
  await expect(page.getByLabel('Dirty fields')).toHaveText('{}');
  await expect(page.getByLabel('Touched fields')).toHaveText('{}');
});

test('suppresses stale async validation', async ({ page }) => {
  await open(page);
  await page.getByLabel('Username').fill('taken');
  await page.getByLabel('Username').fill('available');
  await expect(page.locator('html')).toHaveAttribute('data-validation-completions', '2');
  await expect(page.getByLabel('Errors')).not.toContainText('Username unavailable');
});

test('refreshes dependent options and suppresses stale data-source responses', async ({ page }) => {
  await open(page);
  await page.getByLabel('Country').selectOption('IN');
  await expect(page.getByLabel('Region options')).toHaveText('Karnataka,Maharashtra');
  await expect(page.locator('html')).toHaveAttribute('data-source-completions', '2');
  await expect(page.getByLabel('Region options')).not.toContainText('California');
  await expect(page.getByLabel('Refresh count')).toHaveText('1');
});

test('supports programmatic updates through an external RHF instance', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Set first name externally' }).click();
  await expect(page.getByLabel('First name')).toHaveValue('Programmatic');
  expect((await values(page)).firstName).toBe('Programmatic');
});

test('supports keyboard-only completion and error-summary focus', async ({ page }) => {
  await open(page);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('First name')).toBeFocused();
  await page.keyboard.type('Keyboard');
  await page.getByLabel('First name').fill('');
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await page.getByRole('alert', { name: 'Error summary' }).getByRole('button').first().click();
  await expect(page.getByLabel('First name')).toBeFocused();
});

test('Strict Mode produces one logical submit', async ({ page }) => {
  await open(page);
  await page.getByLabel('First name').fill('Strict');
  await page.getByRole('button', { name: 'Submit profile' }).click();
  await expect(page.getByLabel('Submit count')).toHaveText('1');
});

for (const state of ['initial', 'invalid', 'conditional', 'array'] as const) {
  test('has no serious accessibility violations in ' + state + ' state', async ({ page }) => {
    await open(page);
    if (state === 'invalid') await page.getByRole('button', { name: 'Submit profile' }).click();
    if (state === 'conditional') await page.getByLabel('Account type').selectOption('business');
    if (state === 'array') await page.getByRole('button', { name: 'Add contact' }).click();
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: { run(): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe.run();
      return result.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
    });
    expect(violations).toEqual([]);
  });
}
