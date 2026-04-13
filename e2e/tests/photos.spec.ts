import { test, expect } from '@playwright/test';
import type { ILink } from '@shevdi-home/shared';
import {
  seedPhotos,
  resetPhotos,
  getPhotosFromApi,
  resetMock,
  seedUser,
  seedGranteeUser,
  apiLoginAs,
  getPhotosWithToken,
  apiLogin,
} from './helpers/api';
import { loginAsAdmin, loginAsGrantee } from './helpers/auth';

/** `User.name` from `__test/seed-user` for the grantee account. */
const E2E_GRANTEE_DISPLAY_NAME = 'e2e_grantee';
import { mockPhotos } from './fixtures/photo-mocks';

const GALLERY_PHOTO = 'figure a[href^="/photos/"]';
const PHOTOS_API_PATTERN = /\/api\/v1\/photos(\?|$)/;

async function waitForPhotosAndGallery(page: import('@playwright/test').Page) {
  const responsePromise = page.waitForResponse(
    (resp) => {
      if (!PHOTOS_API_PATTERN.test(resp.url()) || resp.request().method() !== 'GET') return false;
      const s = resp.status();
      return s === 200 || s === 304;
    },
    { timeout: 30000 },
  );
  await page.goto('/photos', { waitUntil: 'domcontentloaded' });
  await responsePromise;
  await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 20000 });
}

/** Navigate to /photos via header link (client-side nav) to preserve auth state. Use after loginAsAdmin. */
async function waitForPhotosAndGalleryViaNav(page: import('@playwright/test').Page) {
  await page.getByRole('link', { name: 'Фото' }).click();
  await expect(page).toHaveURL(/\/photos/);
  await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 30000 });
}

test.describe('Photo flows', () => {
  test.beforeAll(async ({ request }) => {
    await seedUser(request);
    await resetPhotos(request);
    await resetMock(request);
  });

  test.beforeAll(async ({ request }) => {
    await resetPhotos(request);
  });

  test.beforeEach(async ({ request }) => {
    await seedPhotos(request, mockPhotos);
  });

  test.afterEach(async ({ request }) => {
    await resetPhotos(request);
  });

  test.describe('unauthenticated user', () => {
    test('views photo gallery', async ({ page }) => {
      await test.step('Open photo gallery', async () => {
        await waitForPhotosAndGallery(page);
      });

      await test.step('Public photos visible, private badge absent', async () => {
        await expect(page.locator('[aria-label="Private photo"]')).toHaveCount(0);
      });
    });

    test('goes to photo by click', async ({ page }) => {
      await test.step('Open gallery and wait for photos', async () => {
        await waitForPhotosAndGallery(page);
      });

      await test.step('Click first photo', async () => {
        await page.locator(GALLERY_PHOTO).first().click();
      });

      await test.step('Single photo page is shown', async () => {
        await expect(page).toHaveURL(/\/photos\/[a-f0-9]{24}$/);
        await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
        await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible();
      });
    });

    test('upload route is hidden for guests (not-found, URL unchanged)', async ({ page }) => {
      await test.step('Navigate to /photos/new', async () => {
        await page.goto('/photos/new');
      });

      await test.step('Guest sees not-found for upload URL', async () => {
        await expect(page).toHaveURL(/\/photos\/new$/, { timeout: 10000 });
        await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('link', { name: 'К фотографиям' })).toBeVisible();
      });
    });

    test('fails to open private photo by direct link', async ({ page, request }) => {
      const privatePhoto = await test.step('Get private photo from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => p.private);
      });

      await test.step('Navigate to private photo URL', async () => {
        await page.goto(`/photos/${privatePhoto?._id}`);
      });

      await test.step('Not-found message is shown', async () => {
        await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
      });
    });
  });

  test.describe('authenticated user', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('views photo gallery', async ({ page }) => {
      await test.step('Open gallery', async () => {
        await waitForPhotosAndGalleryViaNav(page);
      });

      await test.step('Enable private filter', async () => {
        await page.getByText('Приватные').click();
      });

      await test.step('Private photos are visible', async () => {
        await expect(page.locator('[aria-label="Private photo"]').first()).toBeVisible({ timeout: 10000 });
      });
    });

    test('goes to photo by click', async ({ page }) => {
      await test.step('Open gallery and wait for photos', async () => {
        await waitForPhotosAndGalleryViaNav(page);
      });

      await test.step('Click first photo', async () => {
        await page.locator(GALLERY_PHOTO).first().click();
      });

      await test.step('Edit link is visible on detail page', async () => {
        await expect(page).toHaveURL(/\/photos\/[a-f0-9]{24}$/);
        await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
        await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible();
      });
    });

    test('opens private photo', async ({ page, request }) => {
      const privatePhoto = await test.step('Get private photo from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => p.private);
      });

      await test.step('Open gallery and navigate to private photo', async () => {
        await waitForPhotosAndGalleryViaNav(page);
        await page.getByText('Приватные').click();
        await expect(page.locator(`a[href^="/photos/${privatePhoto?._id}"]`)).toBeVisible({ timeout: 5000 });
        await page.locator(`a[href^="/photos/${privatePhoto?._id}"]`).first().click();
      });

      await test.step('Private photo is accessible', async () => {
        await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible();
      });
    });

    test('uploads photo', () => {
      // Deferred: requires multipart upload + server-side image processing
    });

    test('edits photo', async ({ page, request }) => {
      const photo = await test.step('Get first photo from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos[0];
      });

      await test.step('Navigate to edit page', async () => {
        await waitForPhotosAndGalleryViaNav(page);
        await page.locator(`a[href^="/photos/${photo._id}"]`).first().click();
        await page.getByRole('link', { name: 'Редактировать' }).click();
        await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Fill updated title', async () => {
        await page.locator('input[name="title"]').fill('Updated Title');
      });

      await test.step('Save and verify API returns 200', async () => {
        const saveResponse = page.waitForResponse(
          (resp) => resp.url().includes('/api/v1/photos/') && resp.request().method() === 'PUT',
        );
        await page.getByRole('button', { name: 'Сохранить' }).click();
        const response = await saveResponse;
        expect(response.status()).toEqual(200);
      });
    });

    test('deletes photo', async ({ page, request }) => {
      const photo = await test.step('Get first photo from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos[0];
      });

      await test.step('Navigate to edit page', async () => {
        await waitForPhotosAndGalleryViaNav(page);
        await page.locator(`a[href^="/photos/${photo._id}"]`).first().click();
        await page.getByRole('link', { name: 'Редактировать' }).click();
        await expect(page.getByRole('button', { name: 'Удалить' })).toBeVisible({ timeout: 10000 });
      });

      const deleteResponse = page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/photos/') && resp.request().method() === 'DELETE',
      );

      await test.step('Click delete and wait for API response', async () => {
        await page.getByRole('button', { name: 'Удалить' }).click();
      });

      await test.step('DELETE returns 200', async () => {
        const response = await deleteResponse;
        expect(response.status()).toEqual(200);
      });

      await test.step('App redirects to gallery', async () => {
        await expect(page).toHaveURL(/\/photos\/?$/, { timeout: 10000 });
      });
    });
  });

  test.describe('search and filter', () => {
    test('filters by tag', async ({ page }) => {
      await test.step('Open gallery', async () => {
        await waitForPhotosAndGallery(page);
      });

      await test.step('Filter by tag вьетнам', async () => {
        await page.locator('#photo-filter-tags').fill('вьетнам');
        await page.locator('#photo-filter-tags').press('Enter');
      });

      await test.step('Gallery shows exactly 2 photos', async () => {
        await expect(page.locator(GALLERY_PHOTO)).toHaveCount(2, { timeout: 10000 });
      });
    });

    test('filters by non-existent tag shows empty gallery', async ({ page }) => {
      await test.step('Open gallery', async () => {
        await waitForPhotosAndGallery(page);
      });

      await test.step('Filter by non-existent tag', async () => {
        await page.locator('#photo-filter-tags').fill('несуществующий');
        await page.locator('#photo-filter-tags').press('Enter');
      });

      await test.step('Gallery is empty', async () => {
        await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
      });
    });

    test('filters by country', async ({ page }) => {
      await test.step('Open gallery', async () => {
        await waitForPhotosAndGallery(page);
      });

      await test.step('Filter by country Вьетнам', async () => {
        await page.locator('#photo-filter-country').fill('Вьетнам');
        await page.locator('#photo-filter-country').press('Enter');
      });

      await test.step('Gallery shows exactly 2 photos', async () => {
        await expect(page.locator(GALLERY_PHOTO)).toHaveCount(2, { timeout: 10000 });
      });
    });
  });

  test.describe('photo detail', () => {
    test('full-size link points to correct URL', async ({ page, request }) => {
      const photo = await test.step('Get public photo with fullSizeUrl from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => !p.private && p.fullSizeUrl);
      });

      await test.step('Open photo detail page', async () => {
        if (!photo?._id) throw new Error('Photo id is not found');
        await page.goto(`/photos/${photo._id}`);
        await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible({ timeout: 10000 });
      });

      await test.step('Full-size link href matches photo.fullSizeUrl', async () => {
        const url = photo?.fullSizeUrl;
        if (!url) throw new Error('Photo with fullSizeUrl is not found');
        await expect(page.getByRole('link', { name: 'Полный размер' })).toHaveAttribute('href', url);
      });
    });

    test('photo detail shows date and tags', async ({ page, request }) => {
      const photo = await test.step('Get photo with metadata from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => p.meta?.takenAt && (p.tags?.length ?? 0) > 0 && !p.private);
      });

      await test.step('Open photo detail page', async () => {
        if (!photo?._id) throw new Error('Photo id is not found');
        await page.goto(`/photos/${photo?._id}`);
        await expect(page.locator('a[href*="dateFrom="]')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Date link and tags are visible', async () => {
        for (const tag of photo?.tags ?? []) {
          await expect(page.locator('span', { hasText: tag })).toBeVisible();
        }
      });
    });

    test('photo detail without metadata hides date and tags', async ({ page, request }) => {
      const photo = await test.step('Get photo without metadata from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find(
          (p: ILink) => !p.meta?.takenAt && (!p.tags || p.tags.length === 0) && !p.private,
        );
      });

      await test.step('Open photo detail page', async () => {
        if (!photo?._id) throw new Error('Photo id is not found');
        await page.goto(`/photos/${photo._id}`);
        await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible({ timeout: 10000 });
      });

      await test.step('Date link and tag list are not shown', async () => {
        await expect(page.locator('a[href*="dateFrom="]')).not.toBeVisible();
      });
    });
  });
});

const SHARED_E2E_PRIVATE: Partial<ILink> = {
  name: 'E2E_SHARED_PRIVATE.jpg',
  fileName: 'E2E_SHARED_PRIVATE.jpg',
  smSizeUrl: 'http://placeholder/sm/e2e-share',
  mdSizeUrl: 'http://placeholder/md/e2e-share',
  fullSizeUrl: 'http://placeholder/full/e2e-share',
  smSizeEntryId: '499010001',
  mdSizeEntryId: '499010002',
  fullSizeEntryId: '499010003',
  private: true,
  tags: ['e2e-private-share'],
  title: 'E2E shared private',
  priority: 0,
  meta: { takenAt: '2022-06-01T12:00:00.000Z' },
  location: { value: { country: [], city: [] } },
};

test.describe('Private photo share (accessedBy)', () => {
  let granteeUserId = '';

  test.beforeAll(async ({ request }) => {
    await seedUser(request);
    const g = await seedGranteeUser(request);
    granteeUserId = g.userId;
    await resetMock(request);
  });

  test.beforeEach(async ({ request }) => {
    await resetPhotos(request);
    await seedPhotos(request, [
      ...mockPhotos,
      { ...SHARED_E2E_PRIVATE, accessedBy: [{ userId: granteeUserId }] },
    ]);
  });

  test.afterEach(async ({ request }) => {
    await resetPhotos(request);
  });

  test('grantee sees shared private photo in gallery', async ({ page, request }) => {
    const password = process.env.E2E_PASSWORD;
    if (!password) {
      test.skip();
      return;
    }
    const token = await apiLoginAs(request, 'e2e_grantee', password);
    const photos = await getPhotosWithToken(request, token);
    const shared = photos.find((p) => p.tags?.includes('e2e-private-share'));
    expect(shared?._id).toBeTruthy();

    await loginAsGrantee(page);
    // Client-side nav keeps the access token in Redux; full reload would drop it and
    // refresh cookie is Secure (not sent on http://localhost in e2e).
    await page.getByRole('link', { name: 'Фото' }).click();
    await expect(page).toHaveURL(/\/photos/);
    await expect(page.locator(`figure a[href^="/photos/${shared?._id}"]`).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('guest cannot open shared private photo by direct link', async ({ page, request }) => {
    const password = process.env.E2E_PASSWORD;
    if (!password) {
      test.skip();
      return;
    }
    const adminToken = await apiLogin(request);
    const photos = await getPhotosWithToken(request, adminToken);
    const shared = photos.find((p) => p.tags?.includes('e2e-private-share'));
    expect(shared?._id).toBeTruthy();

    await page.goto(`/photos/${shared?._id}`);
    await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
  });

  test('edit page shows accessedBy chip with grantee display name, not user id', async ({ page, request }) => {
    const password = process.env.E2E_PASSWORD;
    if (!password) {
      test.skip();
      return;
    }
    await loginAsAdmin(page);
    const adminToken = await apiLogin(request);
    const photos = await getPhotosWithToken(request, adminToken);
    const shared = photos.find((p) => p.tags?.includes('e2e-private-share'));
    expect(shared?._id).toBeTruthy();

    // Client-side nav keeps the access token in Redux; full reload would drop it and
    // refresh cookie is Secure (not sent on http://localhost in e2e).
    await waitForPhotosAndGalleryViaNav(page);
    await page.getByText('Приватные').click();
    await expect(page.locator(`a[href^="/photos/${shared?._id}"]`).first()).toBeVisible({ timeout: 10000 });
    await page.locator(`a[href^="/photos/${shared?._id}"]`).first().click();
    await page.getByRole('link', { name: 'Редактировать' }).click();
    await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 15000 });

    const accessedByTaggedInput = page.locator('#photo-form-accessed-by').locator('..').locator('..');
    await expect(accessedByTaggedInput.getByText(E2E_GRANTEE_DISPLAY_NAME)).toBeVisible();
    await expect(accessedByTaggedInput.getByText(granteeUserId)).toHaveCount(0);
  });

  test('edit page can re-add grantee from suggestions; chip shows display name', async ({ page, request }) => {
    const password = process.env.E2E_PASSWORD;
    if (!password) {
      test.skip();
      return;
    }
    await loginAsAdmin(page);
    const adminToken = await apiLogin(request);
    const photos = await getPhotosWithToken(request, adminToken);
    const shared = photos.find((p) => p.tags?.includes('e2e-private-share'));
    expect(shared?._id).toBeTruthy();

    await waitForPhotosAndGalleryViaNav(page);
    await page.getByText('Приватные').click();
    await expect(page.locator(`a[href^="/photos/${shared?._id}"]`).first()).toBeVisible({ timeout: 10000 });
    await page.locator(`a[href^="/photos/${shared?._id}"]`).first().click();
    await page.getByRole('link', { name: 'Редактировать' }).click();
    await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 15000 });

    const accessedByTaggedInput = page.locator('#photo-form-accessed-by').locator('..').locator('..');
    await expect(accessedByTaggedInput.getByText(E2E_GRANTEE_DISPLAY_NAME)).toBeVisible();

    await accessedByTaggedInput.getByRole('button', { name: new RegExp(`Удалить тег ${granteeUserId}`) }).click();
    await expect(accessedByTaggedInput.getByText(E2E_GRANTEE_DISPLAY_NAME)).toHaveCount(0);

    await page.locator('#photo-form-accessed-by').fill('e2e_gr');
    await expect(page.getByRole('option', { name: E2E_GRANTEE_DISPLAY_NAME })).toBeVisible({ timeout: 10000 });
    await page.getByRole('option', { name: E2E_GRANTEE_DISPLAY_NAME }).click();

    await expect(accessedByTaggedInput.getByText(E2E_GRANTEE_DISPLAY_NAME)).toBeVisible();
    await expect(accessedByTaggedInput.getByText(granteeUserId)).toHaveCount(0);
  });
});
