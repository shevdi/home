import { test, expect } from '@playwright/test';
import { apiLogin, seedPhotos, resetPhotos, seedUser, API_URL } from './helpers/api';
import { loginAsAdmin } from './helpers/auth';
import { mockPhotos } from './fixtures/photo-mocks';

test.describe('Photo flows', () => {
  test.beforeEach(async ({ request }) => {
    await seedPhotos(request, mockPhotos);
  });

  test.afterEach(async ({ request }) => {
    await resetPhotos(request);
  });
  test('view photo gallery', async ({ page }) => {
    await page.goto('/photos');
    await expect(page.getByRole('heading', { name: 'Фото' })).toBeVisible();

    const photos = page.locator('figure img');
    await expect(photos.first()).toBeVisible({ timeout: 15000 });
    await expect(photos).toHaveCount(3);
  });

  test('view single photo when gallery has photos', async ({ page }) => {
    await page.goto('/photos');
    const photoLinks = page.locator('a[href^="/photos/"]').filter({ hasNot: page.locator('a[href="/photos/new"]') });
    const count = await photoLinks.count();

    if (count > 0) {
      await photoLinks.first().click();
      await expect(page).toHaveURL(/\/photos\/[^/]+$/);
    }
  });

  test('unauthenticated user is redirected from upload page', async ({ page }) => {
    await page.goto('/photos/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated admin can access upload page', async ({ page }) => {
    const username = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    test.skip(!username || !password, 'E2E_LOGIN and E2E_PASSWORD must be set for this test');

    await loginAsAdmin(page);
    await page.goto('/photos/new');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Добавить фото' })).toBeVisible();
  });

  test.describe('API', () => {
    test.beforeEach(async ({ request }) => {
      // await seedUser(request);
      await seedPhotos(request, mockPhotos);
    });

    test.afterEach(async ({ request }) => {
      await resetPhotos(request);
    });

    test.describe('GET /photos', () => {
      test('returns only public photos without auth', async ({ request }) => {
        const res = await request.get(`${API_URL}/photos`);
        expect(res.ok()).toBe(true);
        const body = await res.json();
        const publicCount = mockPhotos.filter(p => !p.private).length;
        expect(body.photos).toHaveLength(publicCount);
        for (const photo of body.photos) {
          expect(photo.private).not.toBe(true);
        }
      });

      test('returns all photos for admin', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        expect(body.pagination.totalCount).toBe(mockPhotos.length);
      });
    });

    test.describe('GET /photos/:id', () => {
      test('returns photo by id', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = await listRes.json();
        const photoId = list.photos[0]._id;

        const res = await request.get(`${API_URL}/photos/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBe(true);
        const photo = await res.json();
        expect(photo._id).toBe(photoId);
      });

      test('returns 404 for non-existent id', async ({ request }) => {
        const res = await request.get(`${API_URL}/photos/000000000000000000000000`);
        expect(res.status()).toBe(404);
      });

      test('returns 403 for private photo without auth', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = await listRes.json();
        const privatePhoto = list.photos.find((p: any) => p.private === true);
        test.skip(!privatePhoto, 'No private photos in seed data');

        const res = await request.get(`${API_URL}/photos/${privatePhoto._id}`);
        expect(res.status()).toBe(403);
      });
    });

    test.describe('filter by date', () => {
      test('filters by dateFrom (meta.takenAt >= dateFrom)', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos?dateFrom=2020-01-01`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt).filter(Boolean);
        expect(takenAts).toHaveLength(3);
        expect(body.pagination.totalCount).toBe(3);
        expect(takenAts).toEqual([
          '2023-01-17T07:57:59.000Z',
          '2023-01-01T13:54:44.000Z',
          '2023-01-17T07:26:41.000Z',
        ]);
      });

      test('filters by dateTo (meta.takenAt <= dateTo)', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos?dateTo=2020-01-01`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt).filter(Boolean);
        expect(takenAts).toHaveLength(2);
        expect(body.pagination.totalCount).toBe(2);
        expect(takenAts).toEqual([
          '2019-05-02T13:45:43.000Z',
          '2019-04-17T10:32:32.000Z',
        ]);
      });

      test('filters by dateFrom and dateTo (range)', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(
          `${API_URL}/photos?dateFrom=2019-04-22&dateTo=2023-01-03`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const body = await res.json();
        expect(body.photos).toHaveLength(2);
        expect(body.pagination.totalCount).toBe(2);
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt);
        expect(takenAts).toEqual([
          '2019-05-02T13:45:43.000Z',
          '2023-01-01T13:54:44.000Z',
        ]);
      });

      test('filters by dateTo excluding private (no auth)', async ({ request }) => {
        const res = await request.get(`${API_URL}/photos?dateTo=2026-02-11`);
        const body = await res.json();
        expect(body.photos).toHaveLength(3);
        expect(body.pagination.totalCount).toBe(3);
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt);
        expect(takenAts).toEqual([
          '2019-04-17T10:32:32.000Z',
          '2023-01-17T07:57:59.000Z',
          '2023-01-17T07:26:41.000Z',
        ]);
      });
    });

    test.describe('sort and pagination', () => {
      test('orderDownByTakenAt returns newest taken first', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos?order=orderDownByTakenAt`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt ?? null);
        expect(takenAts).toEqual([
          '2023-01-17T07:57:59.000Z',
          '2023-01-17T07:26:41.000Z',
          '2023-01-01T13:54:44.000Z',
          '2019-05-02T13:45:43.000Z',
          '2019-04-17T10:32:32.000Z',
          null,
          null,
        ]);
      });

      test('orderUpByTakenAt returns oldest taken first', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos?order=orderUpByTakenAt`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        const takenAts = body.photos.map((p: any) => p.meta?.takenAt ?? null);
        expect(takenAts).toEqual([
          null,
          null,
          '2019-04-17T10:32:32.000Z',
          '2019-05-02T13:45:43.000Z',
          '2023-01-01T13:54:44.000Z',
          '2023-01-17T07:26:41.000Z',
          '2023-01-17T07:57:59.000Z',
        ]);
      });

      test('orderDownByEdited sorts by updatedAt desc', async ({ request }) => {
        const token = await apiLogin(request);
        const res = await request.get(`${API_URL}/photos?order=orderDownByEdited`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        const updatedAts = body.photos.map((p: any) => p.updatedAt);
        expect(updatedAts).toEqual([
          '2026-02-09T09:15:34.534Z',
          '2026-02-03T18:11:14.534Z',
          '2026-02-01T20:06:34.534Z',
          '2026-02-01T13:15:34.534Z',
          '2026-01-30T18:14:54.534Z',
          '2026-01-28T14:57:34.534Z',
          '2026-01-01T18:43:34.534Z',
        ]);
      });

      test('pagination returns correct pages', async ({ request }) => {
        const token = await apiLogin(request);
        const res1 = await request.get(`${API_URL}/photos?page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body1 = await res1.json();
        const res2 = await request.get(`${API_URL}/photos?page=2`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body2 = await res2.json();

        expect(body1.pagination.pageSize).toBe(5);
        expect(body1.photos.length).toBeLessThanOrEqual(5);
        expect(body2.photos.length).toBeLessThanOrEqual(5);
        expect(body1.photos.length + body2.photos.length).toBe(
          body1.pagination.totalCount,
        );
      });
    });

    test.describe('PUT /photos/:id', () => {
      test('updates and returns the photo', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = await listRes.json();
        const photoId = list.photos[0]._id;

        const res = await request.put(`${API_URL}/photos/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { title: 'Updated title', description: 'New description' },
        });
        expect(res.ok()).toBe(true);
        const body = await res.json();
        expect(body.title).toBe('Updated title');
        expect(body.description).toBe('New description');

        const getRes = await request.get(`${API_URL}/photos/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updated = await getRes.json();
        expect(updated.title).toBe('Updated title');
      });

      test('returns 401 without auth', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = await listRes.json();
        const photoId = list.photos[0]._id;

        const res = await request.put(`${API_URL}/photos/${photoId}`, {
          data: { title: 'hack' },
        });
        expect(res.status()).toBe(401);
      });
    });

    test.describe('DELETE /photos/:id', () => {
      test('deletes the photo and confirms removal', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = await listRes.json();
        const photoId = list.photos[0]._id;
        const initialCount = list.pagination.totalCount;

        const res = await request.delete(`${API_URL}/photos/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBe(true);
        const body = await res.json();
        expect(body.ok).toBe(true);

        const getRes = await request.get(`${API_URL}/photos/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(getRes.status()).toBe(404);

        const listRes2 = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list2 = await listRes2.json();
        expect(list2.pagination.totalCount).toBe(initialCount - 1);
      });

      test('returns 401 without auth', async ({ request }) => {
        const token = await apiLogin(request);
        const listRes = await request.get(`${API_URL}/photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = await listRes.json();
        const photoId = list.photos[0]._id;

        const res = await request.delete(`${API_URL}/photos/${photoId}`);
        expect(res.status()).toBe(401);
      });
    });
  });
});
