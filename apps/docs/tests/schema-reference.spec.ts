import { expect, test } from 'playwright/test';

test('schema landing page exposes the complete canonical reference', async ({ page }) => {
  await page.goto('/schema/');
  await expect(page.getByRole('heading', { level: 1, name: 'Schema guide' })).toBeVisible();
  const reference = page.getByRole('heading', { level: 2, name: 'Reference' }).locator('xpath=following-sibling::ul[1]');
  await expect(reference.getByRole('listitem')).toHaveCount(13);
  await expect(reference.getByRole('link', { name: 'FieldSchema' })).toBeVisible();
  await expect(reference.getByRole('link', { name: 'Versioning' })).toBeVisible();
});

test('field reference exposes renderer and structural boundaries', async ({ page }) => {
  await page.goto('/schema/field-schema');
  await expect(page.getByRole('heading', { level: 1, name: 'FieldSchema' })).toBeVisible();
  await expect(page.getByText('Renderer support is separate from Core validity.')).toBeVisible();
  await expect(page.getByText('Object and array fields require at least one child.')).toBeVisible();
});

test('layout reference does not present renderer layout as FormSchema', async ({ page }) => {
  await page.goto('/schema/layouts');
  await expect(page.getByRole('heading', { level: 1, name: 'Schema and layouts' })).toBeVisible();
  await expect(page.getByText('FormSchema has no layout property.')).toBeVisible();
  await expect(page.getByText('Custom layout nodes belong to the renderer')).toBeVisible();
});

test('versioning reference states that migration is application-owned', async ({ page }) => {
  await page.goto('/schema/versioning');
  await expect(page.getByRole('heading', { level: 1, name: 'Schema versioning' })).toBeVisible();
  await expect(page.getByText('Core stores it but does not parse, compare, negotiate, or migrate schema versions.')).toBeVisible();
});
