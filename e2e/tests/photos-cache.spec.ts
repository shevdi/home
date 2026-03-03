import { test, expect } from '@playwright/test';
import { seedPhotos, resetPhotos, resetMock, apiLogin, extractUrlVersion, API_URL } from './helpers/api';
import { loginAsAdmin } from './helpers/auth';
import { mockPhotos } from './fixtures/photo-mocks';

const GALLERY_PHOTO = 'figure a[href^="/photos/"]';

interface CapturedResponse {
  status: number;
  body: any;
  servedAt: string | null;
}

function captureApiResponse(page: import('@playwright/test').Page, urlPattern: string | RegExp) {
  let resolve: (value: CapturedResponse) => void;
  const promise = new Promise<CapturedResponse>((r) => { resolve = r; });

  const handler = async (response: import('@playwright/test').Response) => {
    const url = response.url();
    const matches = typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
    if (matches && response.request().method() === 'GET') {
      let body: any = null;
      try {
        body = await response.json();
      } catch { /* empty */ }
      const headers = await response.allHeaders();
      resolve({
        status: response.status(),
        body,
        servedAt: headers['x-served-at'] ?? null,
      });
      page.off('response', handler);
    }
  };

  page.on('response', handler);
  return promise;
}

function getPhotoVersions(photos: any[]): Map<string, string | null> {
  const versions = new Map<string, string | null>();
  for (const photo of photos) {
    if (photo.smSizeUrl) {
      versions.set(`${photo._id}:sm`, extractUrlVersion(photo.smSizeUrl));
    }
  }
  return versions;
}

test.describe('Photo gallery caching', () => {
  test.beforeAll(async ({ request }) => {
    await resetPhotos(request);
    await resetMock(request);
  });

  test.beforeEach(async ({ request }) => {
    await resetMock(request);
    await seedPhotos(request, mockPhotos);
  });

  test.afterEach(async ({ request }) => {
    await resetPhotos(request);
  });

  test('cache lifecycle: response cache and urlCache', async ({ page, request, }) => {
    await loginAsAdmin(page);

    // Step 1: Load gallery — response cache MISS, urlCache MISS
    const capture1 = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
    await page.goto('/photos');
    await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
    const response1 = await capture1;

    expect(response1.status).toBe(200);
    expect(response1.body?.photos?.length).toBeGreaterThan(0);
    expect(response1.servedAt).not.toBeNull();

    const versions1 = getPhotoVersions(response1.body.photos);
    expect(versions1.size).toBeGreaterThan(0);

    for (const v of versions1.values()) {
      expect(v).not.toBeNull();
    }

    // Step 2: F5 reload — response cache HIT (same x-served-at = replayed from cache)
    await page.waitForTimeout(2000);
    const capture2 = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
    const response2 = await capture2;

    expect(response2.servedAt).toBe(response1.servedAt);

    // Step 3: Edit a photo via API to trigger cacheClear('photos')
    const token = await apiLogin(request);
    const photoToEdit = response1.body.photos[0];
    const editResponse = await request.put(`${API_URL}/photos/${photoToEdit._id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Cache test edit', tags: photoToEdit.tags ?? [] },
    });
    expect(editResponse.status()).toBe(200);

    // Step 4: F5 reload — response cache MISS (cleared by edit), urlCache HIT (same v= values)
    const capture4 = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
    await page.reload();
    await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
    const response4 = await capture4;

    expect(response4.status).toBe(200);
    expect(response4.servedAt).not.toBe(response1.servedAt);
    expect(response4.body?.photos?.length).toBeGreaterThan(0);

    const versions4 = getPhotoVersions(response4.body.photos);

    for (const [key, v1] of versions1) {
      const v4 = versions4.get(key);
      if (v1 && v4) {
        expect(v4).toBe(v1);
      }
    }

    // Step 5: Change sort order — different URL = response cache MISS, urlCache HIT
    const capture5 = captureApiResponse(page, /\/api\/v1\/photos\?.*order=/);
    await page.locator('#photo-sort-order').selectOption('orderUpByTakenAt');
    await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
    const response5 = await capture5;

    expect(response5.status).toBe(200);
    expect(response5.servedAt).not.toBe(response1.servedAt);
    expect(response5.body?.photos?.length).toBeGreaterThan(0);

    const versions5 = getPhotoVersions(response5.body.photos);

    for (const [key, v1] of versions1) {
      const v5 = versions5.get(key);
      if (v1 && v5) {
        expect(v5).toBe(v1);
      }
    }
  });
});
