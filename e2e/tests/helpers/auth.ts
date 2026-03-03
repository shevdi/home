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
    await page.getByRole('button', { name: 'Войти' }).click();
    await page.waitForURL(/\/(home)?$/);
  });
}
