# syntax=docker/dockerfile:1
FROM node:22

WORKDIR /app

# Root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared ./shared
COPY mock-server ./mock-server

RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000

# Flatten: mock-server runs from /app
RUN cp -r mock-server/. .

CMD ["npm", "run", "start"]
