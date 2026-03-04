## 1. Unauthenticated Gallery Tests

- [x] 1.1 Implement "views photo gallery" — navigate to `/photos`, assert public photos are visible as image links, assert no private badge (`aria-label="Private photo"`) is present
- [x] 1.2 Implement "goes to photo by click" — click a photo in the gallery, assert URL changes to `/photos/:id`, assert photo image and "Предыдущее"/"Следующее" navigation links are present
- [x] 1.3 Implement "fails to open upload photo page" — navigate to `/photos/new`, assert "Такого фото нет" text is visible
- [x] 1.4 Implement "fails to open private photo by direct link" — seed a private photo, navigate to its `/photos/:id` URL, assert "Такого фото нет" text is visible

## 2. Authenticated Gallery & Detail Tests

- [x] 2.1 Implement "views photo gallery" — login, navigate to `/photos`, enable "Приватные" checkbox, assert private photos with badge appear alongside public ones
- [x] 2.2 Implement "goes to photo by click" — login, click a photo, assert URL is `/photos/:id`, assert "Редактировать" link and photo navigation are visible
- [x] 2.3 Implement "opens private photo" — login, navigate directly to a private photo's `/photos/:id`, assert photo image and "Редактировать" link are visible

## 3. Authenticated CRUD Tests

- [x] 3.1 Implement "edits photo" — login, navigate to `/photos/:id/edit`, change title field, click "Сохранить", assert no error message appears
- [x] 3.2 Implement "deletes photo" — login, navigate to `/photos/:id/edit`, click "Удалить", assert redirect to `/photos`, assert the deleted photo is no longer in the gallery

## 4. Search & Filter Edge-Case Tests

- [x] 4.1 Add test "filters by tag" — type "вьетнам" in the tags input, press Enter, assert gallery shows only photos with that tag (3 photos), assert photos without the tag are absent
- [x] 4.2 Add test "filters by non-existent tag shows empty gallery" — type a tag no photo has, press Enter, assert no photo cards are visible
- [x] 4.3 Add test "filters by country" — type a country in the "Страна" input, press Enter, assert gallery updates

## 5. Photo Detail Edge-Case Tests

- [x] 5.1 Add test "full-size link points to correct URL" — navigate to a photo detail page, assert "Полный размер" link is visible with the correct `href`
- [x] 5.2 Add test "photo detail shows date and tags" — navigate to a photo with `meta.takenAt` and tags, assert the formatted date link and tag elements are visible
- [x] 5.3 Add test "photo detail without metadata hides date and tags" — navigate to a photo without `meta.takenAt` or tags (e.g., mock photo #2 "Нижний Новгород"), assert no date link or tag list is shown
