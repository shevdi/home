import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Photo flows', () => {
  test('view photo gallery', async ({ page }) => {
    await page.goto('/photos');
    await expect(page.getByRole('heading', { name: 'Фото' })).toBeVisible();
  });

  test('view single photo when gallery has photos', async ({ page }) => {
    await page.goto('/photos');
    const photoLinks = page.locator('a[href^="/photos/"]').filter({ hasNot: page.locator('a[href="/photos/photo/new"]') });
    const count = await photoLinks.count();

    if (count > 0) {
      await photoLinks.first().click();
      await expect(page).toHaveURL(/\/photos\/[^/]+$/);
    }
  });

  test('unauthenticated user is redirected from upload page', async ({ page }) => {
    await page.goto('/photos/photo/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated admin can access upload page', async ({ page }) => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'E2E_LOGIN and E2E_PASSWORD must be set for this test');

    await loginAsAdmin(page);
    await page.goto('/photos/photo/new');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Добавить фото' })).toBeVisible();
  });
});
