import { test, expect } from '@playwright/test';
import { seedUser } from './helpers/api';

// TODO: Skip this test until we have a way to test the login flow
test.describe.only('Login flow', () => {
  test.beforeAll(async ({ request }) => {
    await seedUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await test.step('Submit invalid credentials', async () => {
      await page.locator('input[name="username"]').fill('invalid-user');
      await page.locator('input[name="password"]').fill('wrong-password');
      await page.getByRole('button', { name: 'Войти' }).click();
    });

    await test.step('Error message is shown', async () => {
      await expect(page.getByText('Неверный логин или пароль')).toBeVisible({ timeout: 10000 });
    });
  });

  test('redirects to home on successful login and logs out', async ({ page }) => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'E2E_LOGIN and E2E_PASSWORD must be set for this test');

    await test.step('Fill credentials and submit', async () => {
      await page.locator('input[name="username"]').fill(username!);
      await page.locator('input[name="password"]').fill(password!);
      await page.getByRole('button', { name: 'Войти' }).click();
    });

    await test.step('Logged-in state is confirmed', async () => {
      await expect(page).toHaveURL(/\/(home)?$/);
      await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('Log out via settings', async () => {
      await page.getByLabel('Настройки').click();
      await page.getByRole('button', { name: 'Выйти' }).click();
    });

    await test.step('Logout is confirmed', async () => {
      await expect(page.getByRole('button', { name: 'Выйти' })).not.toBeVisible();
    });
  });
});
