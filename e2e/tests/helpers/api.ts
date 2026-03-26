import { test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import type { ILink } from '@shevdi-home/shared';

export const API_URL = process.env.E2E_API_URL || 'http://localhost:3001/api/v1';

/** Playwright API calls to Docker services occasionally fail with transient TCP errors under load. */
const TEST_API_TIMEOUT_MS = 60_000;

const TRANSIENT_REQUEST_ERR =
  /socket hang up|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EPIPE|Network error/i;

async function withTransientRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!TRANSIENT_REQUEST_ERR.test(msg) || i === attempts - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw lastError;
}

export async function apiLogin(request: APIRequestContext): Promise<string> {
  const username = process.env.E2E_LOGIN;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error('E2E_LOGIN and E2E_PASSWORD must be set');
  }

  const response = await request.post(`${API_URL}/auth`, {
    data: { username, password },
    timeout: TEST_API_TIMEOUT_MS,
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return body.accessToken;
}

export async function seedPhotos(request: APIRequestContext, photos: unknown[]): Promise<void> {
  await test.step('Seed photos', async () => {
    const response = await withTransientRetry(() =>
      request.post(`${API_URL}/__test/seed-photos`, {
        data: { photos },
        timeout: TEST_API_TIMEOUT_MS,
      }),
    );
    if (!response.ok()) {
      throw new Error(`Seed photos failed: ${response.status()} ${await response.text()}`);
    }
  });
}

export async function resetPhotos(request: APIRequestContext): Promise<void> {
  await test.step('Reset photos DB', async () => {
    const response = await withTransientRetry(() =>
      request.post(`${API_URL}/__test/reset-photos`, { timeout: TEST_API_TIMEOUT_MS }),
    );
    if (!response.ok()) {
      throw new Error(`Reset photos failed: ${response.status()} ${await response.text()}`);
    }
  });
}

export async function getPhotosFromApi(request: APIRequestContext): Promise<ILink[]> {
  return test.step('Get photos from API', async () => {
    const token = await apiLogin(request);
    const response = await request.get(`${API_URL}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: TEST_API_TIMEOUT_MS,
    });
    if (!response.ok()) {
      throw new Error(`Get photos failed: ${response.status()} ${await response.text()}`);
    }
    const body = await response.json();
    return body.photos as ILink[];
  });
}

const MOCK_URL = process.env.E2E_MOCK_URL || 'http://localhost:3004';

export async function resetMock(request: APIRequestContext): Promise<void> {
  await test.step('Reset mock server', async () => {
    const response = await withTransientRetry(() =>
      request.post(`${MOCK_URL}/__reset`, { timeout: TEST_API_TIMEOUT_MS }),
    );
    if (!response.ok()) {
      throw new Error(`Reset mock failed: ${response.status()} ${await response.text()}`);
    }
  });
}

export function extractUrlVersion(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

export async function seedUser(request: APIRequestContext): Promise<void> {
  const username = process.env.E2E_LOGIN;
  const password = process.env.E2E_PASSWORD;

  const response = await withTransientRetry(() =>
    request.post(`${API_URL}/__test/seed-user`, {
      data: { username, password, roles: ['admin'] },
      timeout: TEST_API_TIMEOUT_MS,
    }),
  );
  if (!response.ok()) {
    throw new Error(`Seed user failed: ${response.status()} ${await response.text()}`);
  }
}
