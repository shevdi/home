## 1. Dependencies

- [x] 1.1 Add `allure-playwright` as a dev dependency in `e2e/package.json`
- [x] 1.2 Add `allure-commandline` as a dev dependency in `e2e/package.json` so the Allure CLI is available without a global install
- [x] 1.3 Run `npm install` inside `e2e/` to update `package-lock.json`

## 2. Playwright Configuration

- [x] 2.1 Add `allure-playwright` to the `reporter` array in `e2e/playwright.config.ts`, configured to output to `allure-results/`
- [x] 2.2 Keep the `list` reporter active alongside Allure so terminal output is preserved

## 3. npm Scripts

- [x] 3.1 Add a `test:report` script to `e2e/package.json` that runs `allure generate allure-results --clean -o allure-report`

## 4. Git Ignore

- [x] 4.1 Add `e2e/allure-results/` to the root `.gitignore`
- [x] 4.2 Add `e2e/allure-report/` to the root `.gitignore`
