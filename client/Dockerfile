# syntax=docker/dockerfile:1
# Build from repository root: docker build -f client/Dockerfile .
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Manifests only — matches lockfile; all workspaces needed for npm ci
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY mock-server/package.json ./mock-server/package.json
COPY e2e/package.json ./e2e/package.json
COPY shared/package.json ./shared/package.json
COPY ui-kit/package.json ./ui-kit/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000

# 2) Source for client + local workspace packages
COPY turbo.json ./
COPY shared ./shared
COPY ui-kit ./ui-kit
COPY client ./client

# BACKEND_URL must be passed at build time (e.g. --build-arg BACKEND_URL=https://api.example.com)
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npx turbo run build --filter=shevdi-home-front

# Stage-2: static assets + nginx
FROM nginx:1.25.2-alpine-slim

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
