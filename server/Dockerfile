# Build from repository root: docker build -f server/Dockerfile .
# (Amvera / Kaniko use the whole repo as context — not server/ alone.)
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY mock-server/package.json ./mock-server/package.json
COPY e2e/package.json ./e2e/package.json
COPY shared/package.json ./shared/package.json
COPY ui-kit/package.json ./ui-kit/package.json

RUN npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000

COPY shared ./shared
COPY server ./server

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start", "-w", "shevdi-home-server"]
