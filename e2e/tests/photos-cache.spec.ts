import { test, expect } from '@playwright/test';
import type { ILink } from '@shevdi-home/shared';
import { seedPhotos, resetPhotos, resetMock, apiLogin, extractUrlVersion, API_URL } from './helpers/api';
import { loginAsAdmin } from './helpers/auth';
import { mockPhotos } from './fixtures/photo-mocks';

const GALLERY_PHOTO = 'figure a[href^="/photos/"]';

interface CapturedResponse {
  status: number;
  body: { photos?: ILink[] };
  servedAt: string | null;
}

function captureApiResponse(page: import('@playwright/test').Page, urlPattern: string | RegExp) {
  let resolve: (value: CapturedResponse) => void;
  const promise = new Promise<CapturedResponse>((r) => { resolve = r; });

  const handler = async (response: import('@playwright/test').Response) => {
    const url = response.url();
    const matches = typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
    if (matches && response.request().method() === 'GET') {
      let body: unknown = null;
      try {
        body = await response.json();
      } catch { /* empty */ }
      const headers = await response.allHeaders();
      resolve({
        status: response.status(),
        body: body || [],
        servedAt: headers['x-served-at'] ?? null,
      });
      page.off('response', handler);
    }
  };

  page.on('response', handler);
  return promise;
}

function getPhotoVersions(photos: ILink[]): Map<string, string | null> {
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

    const { response1, versions1 } = await test.step('Load gallery — cache MISS, urlCache MISS', async () => {
      const capture = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
      await page.goto('/photos');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
      const response1 = await capture;

      expect(response1.status).toEqual(200);
      expect((response1.body)?.photos?.length).toBeGreaterThan(0);
      expect(response1.servedAt).not.toBeNull();

      const versions1 = getPhotoVersions((response1.body).photos || []);
      expect(versions1.size).toBeGreaterThan(0);
      for (const v of versions1.values()) {
        expect(v).not.toBeNull();
      }

      return { response1, versions1 };
    });

    await test.step('Reload page — cache HIT (x-served-at unchanged)', async () => {
      await expect(async () => {
        const capture = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
        await page.reload();
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
        const response2 = await capture;
        expect(response2.servedAt).toEqual(response1.servedAt);
      }).toPass({ timeout: 30000, intervals: [300, 800, 1500] });
    });

    await test.step('Edit photo via API to bust response cache', async () => {
      const token = await apiLogin(request);
      const photoToEdit = (response1.body as { photos: ILink[] }).photos[0];
      const editResponse = await request.put(`${API_URL}/photos/${photoToEdit._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: 'Cache test edit', tags: photoToEdit.tags ?? [] },
      });
      expect(editResponse.status()).toEqual(200);
    });

    await test.step('Reload page — cache MISS (cleared by edit), urlCache HIT (versions unchanged)', async () => {
      const capture = captureApiResponse(page, /\/api\/v1\/photos(\?|$)/);
      await page.reload();
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
      const response4 = await capture;

      expect(response4.status).toEqual(200);
      expect(response4.servedAt).not.toEqual(response1.servedAt);
      expect((response4.body)?.photos?.length).toBeGreaterThan(0);

      const versions4 = getPhotoVersions((response4.body as { photos: ILink[] }).photos);
      expect(versions1).toEqual(versions4)

      return versions4;
    });

    await test.step('Change sort order — cache MISS, urlCache HIT (same versions)', async () => {
      const capture = captureApiResponse(page, /\/api\/v1\/photos\?.*order=/);
      await page.locator('#photo-sort-order').selectOption('orderUpByTakenAt');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
      const response5 = await capture;

      expect(response5.status).toEqual(200);
      expect(response5.servedAt).not.toEqual(response1.servedAt);
      expect((response5.body)?.photos?.length).toBeGreaterThan(0);

      const versions5 = getPhotoVersions((response5.body as { photos: ILink[] }).photos);
      expect(versions1).toEqual(versions5)
    });
  });
});
