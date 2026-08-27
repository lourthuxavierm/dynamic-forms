import { expect, test } from 'playwright/test';

test('control landing page preserves the React HTML stable group total', async ({ page }) => {
  await page.goto('/controls/');
  await expect(page.getByRole('heading', { level: 1, name: 'Control reference' })).toBeVisible();
  await expect(page.getByText('The React HTML leaf-control counts total 42.')).toBeVisible();
  const table = page.getByRole('table').filter({ hasText: 'React HTML stable controls' });
  await expect(table.getByRole('row')).toHaveCount(9);
  await expect(page.getByRole('cell', { name: 'Experimental 15-type baseline' })).toBeVisible();
});

test('selection reference exposes typed values and keyboard semantics', async ({ page }) => {
  await page.goto('/controls/selection');
  await expect(page.getByRole('heading', { level: 1, name: 'Selection controls' })).toBeVisible();
  await expect(page.getByText('Typed values may be strings, numbers, or booleans.')).toBeVisible();
  await expect(page.getByText('ARIA combobox/listbox pattern')).toBeVisible();
});

test('file reference exposes upload and privacy boundaries', async ({ page }) => {
  await page.goto('/controls/file-media');
  await expect(page.getByRole('heading', { level: 1, name: 'File and media controls' })).toBeVisible();
  await expect(page.getByText('Core schemas do not contain transport functions.')).toBeVisible();
  await expect(page.getByText('Do not serialize File objects or raw form values into diagnostics.')).toBeVisible();
});

test('experimental page separates registered extensions from the stable tuple', async ({ page }) => {
  await page.goto('/controls/experimental');
  await expect(page.getByRole('heading', { level: 1, name: 'Experimental and deferred controls' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'searchable-select' })).toBeVisible();
  await expect(page.getByText('the default React HTML registry does not register it')).toBeVisible();
});
