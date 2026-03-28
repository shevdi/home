import { test } from '@playwright/test';
import type { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page): Promise<void> {
  await test.step('Login as admin', async () => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error('E2E_LOGIN and E2E_PASSWORD must be set');
    }

    await page.goto('/login');
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    const loginResponse = page.waitForResponse(
      (resp) =>
        resp.request().method() === 'POST' &&
        /\/api\/v1\/auth\b/.test(resp.url()) &&
        resp.status() === 200,
    );
    await page.getByRole('button', { name: 'Войти' }).click();
    await loginResponse;
    await page.waitForURL(/\/(home)?$/);
  });
}
