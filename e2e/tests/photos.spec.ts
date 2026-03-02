import { test, expect } from '@playwright/test';
import { seedPhotos, resetPhotos, getPhotosFromApi } from './helpers/api';
import { loginAsAdmin } from './helpers/auth';
import { mockPhotos } from './fixtures/photo-mocks';

const GALLERY_PHOTO = 'figure a[href^="/photos/"]';

test.describe('Photo flows', () => {
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
      await page.goto('/photos');
      const photos = page.locator(GALLERY_PHOTO);
      await expect(photos.first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('[aria-label="Private photo"]')).toHaveCount(0);
    });

    test('goes to photo by click', async ({ page }) => {
      await page.goto('/photos');
      const firstLink = page.locator(GALLERY_PHOTO).first();
      await expect(firstLink).toBeVisible({ timeout: 15000 });
      await firstLink.click();

      await expect(page).toHaveURL(/\/photos\/[a-f0-9]{24}$/);
      await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
      await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible();
    });

    test('fails to open upload photo page', async ({ page }) => {
      await page.goto('/photos/new');
      await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
    });

    test('fails to open private photo by direct link', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const privatePhoto = photos.find((p: any) => p.private);
      await page.goto(`/photos/${privatePhoto._id}`);
      await expect(page.getByText('Такого фото нет')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('authenticated user', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('views photo gallery', async ({ page }) => {
      await page.goto('/photos');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });

      await page.getByText('Приватные').click();
      await expect(page.locator('[aria-label="Private photo"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('goes to photo by click', async ({ page }) => {
      await page.goto('/photos');
      const firstLink = page.locator(GALLERY_PHOTO).first();
      await expect(firstLink).toBeVisible({ timeout: 15000 });
      await firstLink.click();

      await expect(page).toHaveURL(/\/photos\/[a-f0-9]{24}$/);
      await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
      await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible();
    });

    test('opens private photo', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const privatePhoto = photos.find((p: any) => p.private);

      await page.goto(`/photos/${privatePhoto._id}`);
      await expect(page.getByRole('link', { name: 'Полный размер' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('link', { name: 'Редактировать' })).toBeVisible();
    });

    test('uploads photo', () => {
      // Deferred: requires multipart upload + server-side image processing
    });

    test('edits photo', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const photo = photos[0];

      await page.goto(`/photos/${photo._id}/edit`);
      const titleInput = page.locator('input[name="title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });

      await titleInput.fill('Updated Title');

      const saveResponse = page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/photos/') && resp.request().method() === 'PUT',
      );
      await page.getByRole('button', { name: 'Сохранить' }).click();
      const response = await saveResponse;
      expect(response.status()).toBe(200);
    });

    test('deletes photo', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const photo = photos[0];

      await page.goto(`/photos/${photo._id}/edit`);
      await expect(page.getByRole('button', { name: 'Удалить' })).toBeVisible({ timeout: 10000 });

      const deleteResponse = page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/photos/') && resp.request().method() === 'DELETE',
      );
      await page.getByRole('button', { name: 'Удалить' }).click();
      const response = await deleteResponse;
      expect(response.status()).toBe(200);

      await expect(page).toHaveURL(/\/photos\/?$/, { timeout: 10000 });
    });
  });

  test.describe('search and filter', () => {
    test('filters by tag', async ({ page }) => {
      await page.goto('/photos');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });

      await page.locator('#photo-filter-tags').fill('вьетнам');
      await page.locator('#photo-filter-tags').press('Enter');

      await expect(page.locator(GALLERY_PHOTO)).toHaveCount(2, { timeout: 10000 });
    });

    test('filters by non-existent tag shows empty gallery', async ({ page }) => {
      await page.goto('/photos');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });

      await page.locator('#photo-filter-tags').fill('несуществующий');
      await page.locator('#photo-filter-tags').press('Enter');

      await expect(page.locator(GALLERY_PHOTO)).toHaveCount(0, { timeout: 10000 });
    });

    test('filters by country', async ({ page }) => {
      await page.goto('/photos');
      await expect(page.locator(GALLERY_PHOTO).first()).toBeVisible({ timeout: 15000 });

      await page.locator('#photo-filter-country').fill('Вьетнам');
      await page.locator('#photo-filter-country').press('Enter');

      await expect(page.locator(GALLERY_PHOTO)).toHaveCount(2, { timeout: 10000 });
    });
  });

  test.describe('photo detail', () => {
    test('full-size link points to correct URL', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const photo = photos.find((p: any) => !p.private && p.fullSizeUrl);

      await page.goto(`/photos/${photo._id}`);
      const fullSizeLink = page.getByRole('link', { name: 'Полный размер' });
      await expect(fullSizeLink).toBeVisible({ timeout: 10000 });
      await expect(fullSizeLink).toHaveAttribute('href', photo.fullSizeUrl);
    });

    test('photo detail shows date and tags', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const photo = photos.find((p: any) => p.meta?.takenAt && p.tags?.length > 0 && !p.private);

      await page.goto(`/photos/${photo._id}`);
      await expect(page.locator('a[href*="dateFrom="]')).toBeVisible({ timeout: 10000 });
      for (const tag of photo.tags) {
        await expect(page.locator('span', { hasText: tag })).toBeVisible();
      }
    });

    test('photo detail without metadata hides date and tags', async ({ page, request }) => {
      const photos = await getPhotosFromApi(request);
      const photo = photos.find(
        (p: any) => !p.meta?.takenAt && (!p.tags || p.tags.length === 0) && !p.private,
      );

      await page.goto(`/photos/${photo._id}`);
      await expect(page.getByText(photo.title || photo.name)).toBeVisible({ timeout: 10000 });
      await expect(page.locator('a[href*="dateFrom="]')).not.toBeVisible();
    });
  });
});
