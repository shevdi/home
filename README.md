# Shevdi Home

Личный сайт на React и Express. Включает главную страницу и галерею фото с возможностью загрузки и редактирования для администратора. Бэкенд на Node.js с MongoDB, фронтенд на React с авторизацией. Поддерживается запуск через Docker и E2E-тесты на Playwright.

Если вам повезло, то можете открыть её на https://shevdi.ru

## How to run

**Prerequisites:** Node.js, MongoDB (running on `localhost:27017`)

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**UI kit + client (no backend):** The app imports `@shevdi-home/ui-kit` from its **built** output (`ui-kit/dist`). To work on ui-kit and see changes in the client, run:

```bash
npm run dev:client
```

This runs `vite build --watch` for ui-kit and the webpack dev server for the client together. Use Storybook in `ui-kit` (`npm run storybook --workspace=@shevdi-home/ui-kit`) when you only need isolated component work with HMR.

**`npm run dev` vs `npm run dev:client`:** `dev` starts **server + client** (full stack). `dev:client` starts **ui-kit watch + client** only—use it when you do not need the API on localhost.

**Other commands:**
- `npm run build` — Turborepo builds workspaces that define `build` (ui-kit, then client, via the dependency graph). The client bundle defaults `BACKEND_URL` to `http://localhost:3001/api/v1`; set `BACKEND_URL` when you need a different API base baked in (e.g. production build: `BACKEND_URL=https://…/api/v1`).
- `npm run start` — run in production mode (build first)
- `npm run docker:up:dev` — build and start the dev stack (`docker compose … up --build`). This does **not** enable Compose **file sync** on its own.
- `npm run docker:watch:dev` — run **`docker compose watch`** against `docker-compose.dev.yml` so `develop.watch` paths sync into containers (client and ui-kit → `home-frontend`, etc.). Use this when you want host edits reflected without rebuilding images.

### Docker: client + ui-kit on port 3000

The **`home-frontend`** image runs **`npm run dev:with-uikit`** (ui-kit `build:watch` + webpack dev server). The client imports `@shevdi-home/ui-kit` from **`ui-kit/dist`**, so the watch build must run for changes to appear.

- **`home-ui-kit`** (Storybook on port **6006**) is separate: use it for isolated component work with HMR.
- For the **full app** on **3000** with live ui-kit edits from the host, use **`docker compose watch`** (see `npm run docker:watch:dev`) so `./client` and `./ui-kit` sync into the container; `CHOKIDAR_USEPOLLING` is already set for the frontend service.

**Manual check:** With watch running, change a ui-kit source file → `dist/` updates in the container → webpack on **3000** should rebuild (polling may apply on some hosts).

CI may still invoke workspace scripts directly; switching workflows to `turbo run build` everywhere is optional follow-up work.

## E2E Tests

Run Playwright E2E tests with `npm run e2e`. **The dev server must be running** (`npm run dev`) in a separate terminal first. See [e2e/README.md](e2e/README.md) for details.
