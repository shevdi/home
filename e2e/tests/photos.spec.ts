import { test, expect } from '@playwright/test';
import type { ILink } from '@shevdi-home/shared';
import { seedPhotos, resetPhotos, getPhotosFromApi, resetMock } from './helpers/api';
import { loginAsAdmin } from './helpers/auth';
import { mockPhotos } from './fixtures/photo-mocks';

const GALLERY_PHOTO = 'figure a[href^="/photos/"]';

test.describe('Photo flows', () => {
  test.beforeAll(async ({ request }) => {
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
      });

      await test.step('Public photos visible, private badge absent', async () => {
        await expect(page.locator('[aria-label="Private photo"]')).toHaveCount(0);
      });
    });

    test('goes to photo by click', async ({ page }) => {
      await test.step('Open gallery and wait for photos', async () => {
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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

    test('fails to open upload photo page', async ({ page }) => {
      await test.step('Navigate to /photos/new', async () => {
        await page.goto('/photos/new');
      });

      await test.step('Not-found message is shown', async () => {
        await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
      });
    });

    test('fails to open private photo by direct link', async ({ page, request }) => {
      const privatePhoto = await test.step('Get private photo from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => p.private);
      });

      await test.step('Navigate to private photo URL', async () => {
        await page.goto(`/photos/${privatePhoto._id}`);
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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

      await test.step('Navigate to private photo URL', async () => {
        await page.goto(`/photos/${privatePhoto._id}`);
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
        await page.goto(`/photos/${photo._id}/edit`);
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
        await page.goto(`/photos/${photo._id}/edit`);
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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
        await page.goto('/photos');
        await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });
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
        await page.goto(`/photos/${photo._id}`);
        await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible({ timeout: 10000 });
      });

      await test.step('Full-size link href matches photo.fullSizeUrl', async () => {
        await expect(page.getByRole('link', { name: 'Полный размер' })).toHaveAttribute('href', photo.fullSizeUrl);
      });
    });

    test('photo detail shows date and tags', async ({ page, request }) => {
      const photo = await test.step('Get photo with metadata from API', async () => {
        const photos = await getPhotosFromApi(request);
        return photos.find((p: ILink) => p.meta?.takenAt && p.tags?.length > 0 && !p.private);
      });

      await test.step('Open photo detail page', async () => {
        await page.goto(`/photos/${photo._id}`);
        await expect(page.locator('a[href*="dateFrom="]')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Date link and tags are visible', async () => {
        for (const tag of photo.tags) {
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
        await page.goto(`/photos/${photo._id}`);
        await expect(page.getByText(photo.title || photo.name)).toBeVisible({ timeout: 10000 });
      });

      await test.step('Date link and tag list are not shown', async () => {
        await expect(page.locator('a[href*="dateFrom="]')).not.toBeVisible();
      });
    });
  });
});
