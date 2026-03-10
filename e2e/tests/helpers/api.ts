import { test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import type { ILink } from '@shevdi-home/shared';

export const API_URL = process.env.E2E_API_URL || 'http://localhost:3001/api/v1';

export async function apiLogin(request: APIRequestContext): Promise<string> {
  const username = process.env.E2E_LOGIN;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error('E2E_LOGIN and E2E_PASSWORD must be set');
  }

  const response = await request.post(`${API_URL}/auth`, {
    data: { username, password },
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  return body.accessToken;
}

export async function seedPhotos(request: APIRequestContext, photos: unknown[]): Promise<void> {
  await test.step('Seed photos', async () => {
    const response = await request.post(`${API_URL}/__test/seed-photos`, {
      data: { photos },
    });
    if (!response.ok()) {
      throw new Error(`Seed photos failed: ${response.status()} ${await response.text()}`);
    }
  });
}

export async function resetPhotos(request: APIRequestContext): Promise<void> {
  await test.step('Reset photos DB', async () => {
    const response = await request.post(`${API_URL}/__test/reset-photos`);
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
    const response = await request.post(`${MOCK_URL}/__reset`);
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

  const response = await request.post(`${API_URL}/__test/seed-user`, {
    data: { username, password, roles: ['admin'] },
  });
  if (!response.ok()) {
    throw new Error(`Seed user failed: ${response.status()} ${await response.text()}`);
  }
}
