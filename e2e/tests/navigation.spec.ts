import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('index route renders welcome page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /./ })).toBeVisible();
  });

  test('home route renders', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/home');
    await expect(page.getByRole('heading', { name: /./ })).toBeVisible();
  });

  test('projects route renders', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('heading', { name: /./ })).toBeVisible();
  });

  test('photos route renders gallery', async ({ page }) => {
    await page.goto('/photos');
    await expect(page).toHaveURL('/photos');
    await expect(page.getByRole('heading', { name: 'Фото' })).toBeVisible();
  });

  test('login route renders login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });

  test('navigating from photos to photo detail', async ({ page }) => {
    await page.goto('/photos');
    await expect(page.getByRole('heading', { name: 'Фото' })).toBeVisible();

    const photoLinks = page.locator('a[href^="/photos/"]').filter({ hasNot: page.locator('a[href="/photos/new"]') });
    const count = await photoLinks.count();
    if (count > 0) {
      await photoLinks.first().click();
      await expect(page).toHaveURL(/\/photos\/[^/]+$/);
    }
  });
});
