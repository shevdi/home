import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.locator('input[name="username"]').fill('invalid-user');
    await page.locator('input[name="password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Неверный логин или пароль')).toBeVisible({ timeout: 10000 });
  });

  test('redirects to home on successful login and logs out', async ({ page }) => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'E2E_LOGIN and E2E_PASSWORD must be set for this test');

    await page.locator('input[name="username"]').fill(username!);
    await page.locator('input[name="password"]').fill(password!);
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL(/\/(home)?$/);
    await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible();

    await page.getByRole('button', { name: 'Настройки' }).click();
    await page.getByRole('button', { name: 'Выйти' }).click();

    await expect(page.getByRole('button', { name: 'Выйти' })).not.toBeVisible();
  });
});
