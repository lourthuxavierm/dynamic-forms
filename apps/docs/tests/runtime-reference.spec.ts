import { expect, test } from 'playwright/test';

test('runtime landing page exposes all canonical runtime topics', async ({ page }) => {
  await page.goto('/runtime/');
  await expect(page.getByRole('heading', { level: 1, name: 'Runtime behavior' })).toBeVisible();
  const reference = page.getByRole('heading', { level: 2, name: 'Reference' }).locator('xpath=following-sibling::ul[1]');
  await expect(reference.getByRole('listitem')).toHaveCount(13);
});

test('lifecycle page exposes value, validation, and submission sequences', async ({ page }) => {
  await page.goto('/runtime/form-lifecycle');
  await expect(page.getByRole('heading', { level: 2, name: 'Value-change sequence' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Validation sequence' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Submission sequence' })).toBeVisible();
  await expect(page.getByText('emit valueChange')).toBeVisible();
});

test('form state reference lists all eight state properties', async ({ page }) => {
  await page.goto('/runtime/form-state');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(9);
  await expect(table.getByRole('cell', { name: 'submitting', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'loading', exact: true })).toBeVisible();
});

test('submission reference distinguishes provider and HtmlForm paths', async ({ page }) => {
  await page.goto('/runtime/submission');
  await expect(page.getByRole('heading', { level: 2, name: 'React provider submission' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'React HTML submission' })).toBeVisible();
  await expect(page.getByText('It does not call FormProvider.submit()')).toBeVisible();
});

test('cancellation reference states cooperative abort behavior', async ({ page }) => {
  await page.goto('/runtime/cancellation');
  await expect(page.getByRole('heading', { level: 2, name: 'Important limitation' })).toBeVisible();
  await expect(page.getByText('Cancellation is cooperative.')).toBeVisible();
});
