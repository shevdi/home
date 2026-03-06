# Shevdi Home

Личный сайт на React и Express. Включает главную страницу и галерею фото с возможностью загрузки и редактирования для администратора. Бэкенд на Node.js с MongoDB, фронтенд на React с авторизацией. Поддерживается запуск через Docker и E2E-тесты на Playwright.

Если вам повезло, то можете открыть её на https://home-front-shevdi.amvera.io/

## How to run

**Prerequisites:** Node.js, MongoDB (running on `localhost:27017`)

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Other commands:**
- `npm run build` — build the client
- `npm run start` — run in production mode (build first)
- `npm run docker:up:dev` — run with Docker Compose (dev)

## E2E Tests

Run Playwright E2E tests with `npm run e2e`. **The dev server must be running** (`npm run dev`) in a separate terminal first. See [e2e/README.md](e2e/README.md) for details.

## Releases

- [Changelog](docs/CHANGELOG.md) — cumulative release history
- [Release notes](docs/releases/) — per-version notes and E2E Allure reports

### GitHub setup

1. **GitHub Pages**: Settings → Pages → Source: Deploy from branch → Branch: `main`, folder: `/docs`
2. **Branch protection**: Require CI to pass before merging into `main`
