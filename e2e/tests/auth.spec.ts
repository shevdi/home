import { test, expect } from '@playwright/test';
import { seedUser } from './helpers/api';

test.describe('Login flow', () => {
  test.beforeAll(async ({ request }) => {
    await seedUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await test.step('Submit invalid credentials and wait for 401', async () => {
      const authRejected = page.waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          /\/api\/v1\/auth\b/.test(r.url()) &&
          r.status() === 401,
      );
      await page.locator('input[name="username"]').fill('invalid-user');
      await page.locator('input[name="password"]').fill('wrong-password');
      await page.getByRole('button', { name: 'Войти' }).click();
      const resp = await authRejected;
      const body = (await resp.json()) as { message?: string };
      expect(body.message).toBe('Неверный логин или пароль');
    });

    await test.step('Error message is shown in the form', async () => {
      await expect(page.getByTestId('password-login-error')).toContainText('Неверный логин или пароль', {
        timeout: 10000,
      });
    });
  });

  test('redirects to home on successful login and logs out', async ({ page }) => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'E2E_LOGIN and E2E_PASSWORD must be set for this test');

    await test.step('Fill credentials and submit', async () => {
      const loginResponse = page.waitForResponse(
        (resp) =>
          resp.request().method() === 'POST' &&
          /\/api\/v1\/auth\b/.test(resp.url()) &&
          resp.status() === 200,
      );
      await page.locator('input[name="username"]').fill(username!);
      await page.locator('input[name="password"]').fill(password!);
      await page.getByRole('button', { name: 'Войти' }).click();
      await loginResponse;
    });

    await test.step('Logged-in state is confirmed', async () => {
      await expect(page).toHaveURL(/\/(home)?$/);
      await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible({ timeout: 30000 });
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
