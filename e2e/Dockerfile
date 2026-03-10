FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Root package files and all workspaces for npm ci
COPY package.json package-lock.json ./
COPY shared ./shared
COPY e2e ./e2e
COPY client ./client
COPY server ./server
COPY mock-server ./mock-server

RUN npm ci

WORKDIR /app/e2e

CMD ["npx", "playwright", "test"]
